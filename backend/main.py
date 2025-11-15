"""
FastAPI backend for AWARE ML Model Prediction
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import pandas as pd
import joblib
import os
from pathlib import Path
from typing import Optional

# Initialize FastAPI app
app = FastAPI(title="AWARE ML Prediction API", version="1.0.0")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model on startup
MODEL_PATH = Path(__file__).parent.parent / "extract" / "rf_water_model.joblib"
model_data = None
model = None
imputer = None
label_encoder = None
features = None

@app.on_event("startup")
async def load_model():
    """Load the ML model, imputer, and label encoder on startup"""
    global model_data, model, imputer, label_encoder, features
    
    if not MODEL_PATH.exists():
        raise FileNotFoundError(f"Model file not found at {MODEL_PATH}. Please train the model first.")
    
    try:
        model_data = joblib.load(MODEL_PATH)
        model = model_data['model']
        imputer = model_data['imputer']
        label_encoder = model_data['label_encoder']
        features = model_data['features']
        print(f"✅ Model loaded successfully from {MODEL_PATH}")
        print(f"   Features: {features}")
        print(f"   Classes: {label_encoder.classes_}")
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        raise

# Pydantic model for request validation
class WaterQualityInput(BaseModel):
    Temp: float = Field(..., description="Temperature in °C", ge=0, le=100)
    DO: float = Field(..., description="Dissolved Oxygen in mg/L", ge=0, le=50)
    pH: float = Field(..., description="pH Level", ge=0, le=14)
    Conductivity: float = Field(..., description="Conductivity in µmhos/cm", ge=0)
    BOD: float = Field(..., description="Biological Oxygen Demand in mg/L", ge=0)
    Nitrate: float = Field(..., description="Nitrate in mg/L", ge=0)
    FecalColiform: float = Field(..., description="Fecal Coliform in MPN/100ml", ge=0)
    TotalColiform: float = Field(..., description="Total Coliform in MPN/100ml", ge=0)
    
    class Config:
        # Allow extra fields to be ignored
        extra = "ignore"
        json_schema_extra = {
            "example": {
                "Temp": 29.5,
                "DO": 5.8,
                "pH": 7.2,
                "Conductivity": 150,
                "BOD": 2.0,
                "Nitrate": 0.5,
                "FecalColiform": 120,
                "TotalColiform": 900
            }
        }

# Pydantic model for response
class PredictionResponse(BaseModel):
    riskLevel: str
    riskScore: Optional[float] = None
    confidence: Optional[float] = None
    message: str

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "AWARE ML Prediction API",
        "status": "running",
        "model_loaded": model is not None,
        "endpoints": {
            "predict": "/api/predict",
            "health": "/health",
            "docs": "/docs"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "features": features if features else None
    }

@app.post("/api/predict", response_model=PredictionResponse)
async def predict_risk(input_data: WaterQualityInput):
    """
    Predict water quality risk level based on input parameters
    
    Returns:
    - riskLevel: Low, Medium, or High
    - riskScore: Optional risk score (0-100)
    - confidence: Optional prediction confidence
    """
    # Debug: print received data
    try:
        input_dict = input_data.model_dump() if hasattr(input_data, 'model_dump') else input_data.dict()
        print(f"✅ Received valid prediction request: {input_dict}")
    except Exception as e:
        print(f"❌ Error processing input: {e}")
    
    if model is None or imputer is None or label_encoder is None:
        raise HTTPException(
            status_code=503,
            detail="Model not loaded. Please check server logs."
        )
    
    try:
        # Convert input to dictionary
        input_dict = input_data.model_dump() if hasattr(input_data, 'model_dump') else input_data.dict()
        
        # Create DataFrame with the input data
        x_new = pd.DataFrame([input_dict])
        
        # Ensure columns are in the correct order
        x_new = x_new.reindex(columns=features)
        
        # Impute missing values (if any)
        x_new_imputed = imputer.transform(x_new)
        
        # Convert back to DataFrame with feature names
        x_new_imputed = pd.DataFrame(x_new_imputed, columns=features, index=x_new.index)
        
        # Make prediction
        prediction = model.predict(x_new_imputed)
        
        # Get predicted risk level
        risk_level = label_encoder.inverse_transform(prediction)[0]
        
        # Get prediction probabilities for confidence
        if hasattr(model, 'predict_proba'):
            probabilities = model.predict_proba(x_new_imputed)[0]
            confidence = float(max(probabilities)) * 100
        else:
            confidence = None
        
        # Calculate a risk score based on the class (optional)
        risk_score_map = {'Low': 25, 'Medium': 50, 'High': 75}
        risk_score = risk_score_map.get(risk_level, 50)
        
        return PredictionResponse(
            riskLevel=risk_level,
            riskScore=risk_score,
            confidence=confidence,
            message=f"Prediction successful: {risk_level} risk level"
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction error: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

