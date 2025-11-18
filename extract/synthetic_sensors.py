#!/usr/bin/env python3
"""
Synthetic Sensor Simulator for AWARE Forecast Model

Simulates live water quality sensor data and feeds it to the forecast model.
Use CLI commands: 'on' to start, 'off' to stop, 'status' to check, 'exit' to quit.
"""

import pandas as pd
import numpy as np
import joblib
import time
import threading
from pathlib import Path
from datetime import datetime
from typing import Optional, Dict, List

# Configuration
MODEL_PATH = Path(__file__).parent / "rf_forecast_model.joblib"
DATA_PATH = Path(__file__).parent / "water_dataX.csv"
SENSOR_DATA_FILE = Path(__file__).parent / "sensor_live_data.csv"
UPDATE_INTERVAL = 5  # seconds between sensor readings

class SyntheticSensor:
    def __init__(self, model_path: Path, data_path: Path, sensor_data_file: Path):
        """Initialize synthetic sensor with forecast model"""
        self.model_path = model_path
        self.data_path = data_path
        self.sensor_data_file = sensor_data_file
        self.model = None
        self.label_encoder = None
        self.lag_features = None
        self.L = None
        self.H = None
        self.station_col = None
        self.station_encoder = None
        self.is_running = False
        self.sensor_thread = None
        self.history = []  # Store recent readings for lag features
        
        # Initialize CSV file with headers
        self.init_data_file()
        
        # Load model
        self.load_model()
        
        # Load historical data for realistic value ranges
        self.load_data_ranges()
    
    def init_data_file(self):
        """Initialize the sensor data CSV file with headers"""
        if not self.sensor_data_file.exists():
            headers = ['timestamp', 'Temp', 'DO', 'pH', 'Conductivity', 'BOD', 'Nitrate', 
                      'FecalColiform', 'TotalColiform', 'Risk', 'Confidence']
            pd.DataFrame(columns=headers).to_csv(self.sensor_data_file, index=False)
    
    def load_model(self):
        """Load the forecast model"""
        if not self.model_path.exists():
            raise FileNotFoundError(f"Model not found at {self.model_path}. Train the model first.")
        
        model_data = joblib.load(self.model_path)
        self.model = model_data['model']
        self.label_encoder = model_data['label_encoder']
        self.lag_features = model_data['lag_features']
        self.L = model_data.get('L', 3)
        self.H = model_data.get('H', 1)
        self.station_col = model_data.get('station_col')
        self.station_encoder = model_data.get('station_encoder')
        
        print(f"✅ Loaded forecast model: L={self.L}, H={self.H}")
        print(f"   Features: {len(self.lag_features)} lag features")
    
    def load_data_ranges(self):
        """Load historical data to get realistic value ranges for synthetic data"""
        try:
            if self.data_path.exists():
                df = pd.read_csv(self.data_path, encoding='latin1', low_memory=False)
                # Rename columns to match expected names
                rename_map = {
                    'Temp': 'Temp', 'D.O. (mg/l)': 'DO', 'PH': 'pH',
                    'CONDUCTIVITY (µmhos/cm)': 'Conductivity',
                    'B.O.D. (mg/l)': 'BOD',
                    'NITRATENAN N+ NITRITENANN (mg/l)': 'Nitrate',
                    'FECAL COLIFORM (MPN/100ml)': 'FecalColiform',
                    'TOTAL COLIFORM (MPN/100ml)Mean': 'TotalColiform'
                }
                df = df.rename(columns={k: v for k, v in rename_map.items() if k in df.columns})
                
                # Get value ranges for each feature
                self.value_ranges = {}
                features = ['Temp', 'DO', 'pH', 'Conductivity', 'BOD', 'Nitrate', 'FecalColiform', 'TotalColiform']
                for feat in features:
                    if feat in df.columns:
                        col = pd.to_numeric(df[feat], errors='coerce').dropna()
                        if len(col) > 0:
                            self.value_ranges[feat] = {
                                'min': float(col.min()),
                                'max': float(col.max()),
                                'mean': float(col.mean()),
                                'std': float(col.std())
                            }
                print(f"✅ Loaded value ranges for {len(self.value_ranges)} features")
            else:
                # Default ranges if no data file
                self.value_ranges = {
                    'Temp': {'min': 20, 'max': 35, 'mean': 28, 'std': 3},
                    'DO': {'min': 2, 'max': 10, 'mean': 5, 'std': 2},
                    'pH': {'min': 6, 'max': 9, 'mean': 7.2, 'std': 0.5},
                    'Conductivity': {'min': 50, 'max': 3000, 'mean': 500, 'std': 400},
                    'BOD': {'min': 0.5, 'max': 10, 'mean': 3, 'std': 2},
                    'Nitrate': {'min': 0.1, 'max': 50, 'mean': 5, 'std': 8},
                    'FecalColiform': {'min': 10, 'max': 10000, 'mean': 1000, 'std': 2000},
                    'TotalColiform': {'min': 50, 'max': 20000, 'mean': 3000, 'std': 4000}
                }
                print("⚠️  Using default value ranges (data file not found)")
        except Exception as e:
            print(f"⚠️  Error loading data ranges: {e}. Using defaults.")
            self.value_ranges = {
                'Temp': {'min': 20, 'max': 35, 'mean': 28, 'std': 3},
                'DO': {'min': 2, 'max': 10, 'mean': 5, 'std': 2},
                'pH': {'min': 6, 'max': 9, 'mean': 7.2, 'std': 0.5},
                'Conductivity': {'min': 50, 'max': 3000, 'mean': 500, 'std': 400},
                'BOD': {'min': 0.5, 'max': 10, 'mean': 3, 'std': 2},
                'Nitrate': {'min': 0.1, 'max': 50, 'mean': 5, 'std': 8},
                'FecalColiform': {'min': 10, 'max': 10000, 'mean': 1000, 'std': 2000},
                'TotalColiform': {'min': 50, 'max': 20000, 'mean': 3000, 'std': 4000}
            }
    
    def generate_sensor_reading(self) -> Dict[str, float]:
        """Generate a synthetic sensor reading based on historical data ranges"""
        reading = {}
        for feat, ranges in self.value_ranges.items():
            # Generate value using normal distribution, clamped to min/max
            value = np.random.normal(ranges['mean'], ranges['std'])
            value = np.clip(value, ranges['min'], ranges['max'])
            reading[feat] = round(float(value), 2)
        return reading
    
    def build_lag_features(self, current_reading: Dict[str, float]) -> Optional[pd.DataFrame]:
        """Build lagged feature vector from history and current reading"""
        # Add current reading to history
        self.history.append(current_reading)
        
        # Keep only last L readings
        if len(self.history) > self.L:
            self.history = self.history[-self.L:]
        
        # Need at least L readings to create lag features
        if len(self.history) < self.L:
            return None
        
        # Build lag features
        lag_row = {}
        features = ['Temp', 'DO', 'pH', 'Conductivity', 'BOD', 'Nitrate', 'FecalColiform', 'TotalColiform']
        
        for feat in features:
            if feat not in self.value_ranges:
                continue
            for lag in range(self.L):
                idx = len(self.history) - 1 - lag
                if idx >= 0:
                    lag_row[f'{feat}_lag{lag}'] = self.history[idx].get(feat, np.nan)
                else:
                    lag_row[f'{feat}_lag{lag}'] = np.nan
        
        # Add station encoding if available
        if self.station_encoder is not None:
            # Use a default station ID for synthetic data
            station_id = "SYNTHETIC_001"
            try:
                station_encoded = self.station_encoder.transform([[station_id]])[0][0]
                lag_row['station_encoded'] = station_encoded
            except:
                lag_row['station_encoded'] = -1
        
        # Create DataFrame
        X = pd.DataFrame([lag_row])
        X = X.reindex(columns=self.lag_features, fill_value=0)
        
        return X
    
    def make_prediction(self, X: pd.DataFrame) -> Dict:
        """Make forecast prediction using the model"""
        try:
            # Fill missing values
            X_filled = X.fillna(X.median())
            
            # Predict
            prediction = self.model.predict(X_filled)[0]
            
            # Get risk level
            try:
                risk_level = self.label_encoder.inverse_transform([prediction])[0]
            except:
                risk_level = str(prediction)
            
            # Get probabilities if available
            confidence = None
            if hasattr(self.model, 'predict_proba'):
                probs = self.model.predict_proba(X_filled)[0]
                confidence = float(max(probs)) * 100
            
            return {
                'risk_level': risk_level,
                'confidence': confidence,
                'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            }
        except Exception as e:
            return {'error': str(e)}
    
    def sensor_loop(self):
        """Main sensor loop - generates readings and predictions"""
        print("\n🟢 Sensor started. Generating readings...")
        print("=" * 60)
        
        while self.is_running:
            # Generate sensor reading
            reading = self.generate_sensor_reading()
            
            # Build lag features
            X = self.build_lag_features(reading)
            
            if X is not None:
                # Make prediction
                prediction = self.make_prediction(X)
                
                # Display results
                print(f"\n[{prediction.get('timestamp', 'N/A')}] Sensor Reading:")
                for feat, value in reading.items():
                    print(f"  {feat:15s}: {value:8.2f}")
                
                if 'error' in prediction:
                    print(f"  ❌ Prediction Error: {prediction['error']}")
                else:
                    print(f"\n  📊 Forecast (H={self.H}):")
                    print(f"     Risk Level: {prediction['risk_level']}")
                    if prediction.get('confidence'):
                        print(f"     Confidence: {prediction['confidence']:.1f}%")
                    
                    # Write to CSV file for live graph
                    self.write_to_csv(reading, prediction)
            else:
                print(f"\n[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Collecting initial readings... ({len(self.history)}/{self.L})")
            
            # Wait for next reading
            time.sleep(UPDATE_INTERVAL)
    
    def write_to_csv(self, reading: Dict[str, float], prediction: Dict):
        """Write sensor reading and prediction to CSV file for live graph"""
        try:
            row = {
                'timestamp': datetime.now().isoformat(),
                'Temp': reading.get('Temp', np.nan),
                'DO': reading.get('DO', np.nan),
                'pH': reading.get('pH', np.nan),
                'Conductivity': reading.get('Conductivity', np.nan),
                'BOD': reading.get('BOD', np.nan),
                'Nitrate': reading.get('Nitrate', np.nan),
                'FecalColiform': reading.get('FecalColiform', np.nan),
                'TotalColiform': reading.get('TotalColiform', np.nan),
                'Risk': prediction.get('risk_level', 'Unknown'),
                'Confidence': prediction.get('confidence', np.nan)
            }
            
            # Append to CSV
            df_new = pd.DataFrame([row])
            df_new.to_csv(self.sensor_data_file, mode='a', header=False, index=False)
        except Exception as e:
            print(f"⚠️  Error writing to CSV: {e}")
        
        print("\n🔴 Sensor stopped.")
    
    def start(self):
        """Start the sensor"""
        if self.is_running:
            print("⚠️  Sensor is already running.")
            return
        
        self.is_running = True
        self.history = []  # Reset history
        self.sensor_thread = threading.Thread(target=self.sensor_loop, daemon=True)
        self.sensor_thread.start()
        print("✅ Sensor started in background thread.")
    
    def stop(self):
        """Stop the sensor"""
        if not self.is_running:
            print("⚠️  Sensor is not running.")
            return
        
        self.is_running = False
        if self.sensor_thread:
            self.sensor_thread.join(timeout=UPDATE_INTERVAL + 1)
        print("✅ Sensor stopped.")
    
    def status(self):
        """Get sensor status"""
        status = "🟢 RUNNING" if self.is_running else "🔴 STOPPED"
        print(f"\nSensor Status: {status}")
        print(f"  History buffer: {len(self.history)}/{self.L} readings")
        print(f"  Update interval: {UPDATE_INTERVAL} seconds")
        if self.is_running:
            print(f"  Ready for predictions: {'Yes' if len(self.history) >= self.L else 'No (collecting initial readings)'}")


def main():
    """Main CLI interface"""
    print("=" * 60)
    print("AWARE Synthetic Sensor Simulator")
    print("=" * 60)
    
    try:
        sensor = SyntheticSensor(MODEL_PATH, DATA_PATH, SENSOR_DATA_FILE)
    except Exception as e:
        print(f"❌ Failed to initialize sensor: {e}")
        return
    
    print("\nCommands:")
    print("  'on'     - Start sensor")
    print("  'off'    - Stop sensor")
    print("  'status' - Check sensor status")
    print("  'exit'   - Quit program")
    print("=" * 60)
    
    while True:
        try:
            command = input("\n> ").strip().lower()
            
            if command == 'on':
                sensor.start()
            elif command == 'off':
                sensor.stop()
            elif command == 'status':
                sensor.status()
            elif command in ['exit', 'quit', 'q']:
                if sensor.is_running:
                    sensor.stop()
                print("\n👋 Goodbye!")
                break
            elif command == '':
                continue
            else:
                print(f"❌ Unknown command: '{command}'. Try 'on', 'off', 'status', or 'exit'.")
        except KeyboardInterrupt:
            print("\n\n⚠️  Interrupted. Stopping sensor...")
            if sensor.is_running:
                sensor.stop()
            print("👋 Goodbye!")
            break
        except Exception as e:
            print(f"❌ Error: {e}")


if __name__ == "__main__":
    main()

