# AWARE ML Backend API

FastAPI backend server for serving the AWARE water quality prediction model.

## Setup

1. **Install Python dependencies:**
```bash
cd backend
pip install -r requirements.txt
```

2. **Ensure the ML model exists:**
   - The model should be at: `../extract/rf_water_model.joblib`
   - If not, train the model using the Jupyter notebook first

## Running the Server

```bash
# From the backend directory
python main.py

# Or using uvicorn directly
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- **API**: http://localhost:8000
- **Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## API Endpoints

### POST `/api/predict`
Predict water quality risk level.

**Request Body:**
```json
{
  "Temp": 29.5,
  "DO": 5.8,
  "pH": 7.2,
  "Conductivity": 150,
  "BOD": 2.0,
  "Nitrate": 0.5,
  "FecalColiform": 120,
  "TotalColiform": 900
}
```

**Response:**
```json
{
  "riskLevel": "Medium",
  "riskScore": 50,
  "confidence": 95.5,
  "message": "Prediction successful: Medium risk level"
}
```

### GET `/health`
Check if the model is loaded and API is healthy.

### GET `/`
Root endpoint with API information.

## Development

The server uses CORS middleware to allow requests from the React frontend running on `http://localhost:5173`.

