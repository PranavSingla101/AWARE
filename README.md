# AWARE - Waterborne Disease Predictor

A modern web application for predicting and monitoring waterborne diseases using React, Vite, and Clerk authentication.

## Features

- 🔐 **Google Authentication** - Secure login via Clerk with Google OAuth
- 📊 **Real-time Dashboard** - Comprehensive analytics and monitoring interface
- 🔮 **AI Predictions** - Risk assessment for waterborne diseases
- 📈 **Data Visualization** - Interactive charts and statistics
- 🔔 **Alert System** - Real-time notifications for risk levels
- 📱 **Responsive Design** - Works seamlessly on all devices

## Tech Stack

- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **Clerk** - Authentication and user management
- **React Router** - Client-side routing

## Getting Started

### Quick Setup

**For detailed setup instructions, see [SETUP.md](SETUP.md)**

**For dependency information, see [DEPENDENCIES.md](DEPENDENCIES.md)**

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Clerk account (free tier available)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd AWARE
```

2. Install dependencies (choose one method):

   **Option A: Use installation script (Recommended)**
   ```bash
   # Windows
   install.bat
   
   # Linux/Mac
   chmod +x install.sh
   ./install.sh
   ```
   
   **Option B: Manual installation**
   ```bash
   npm install
   ```

3. Set up Clerk:
   - Go to [clerk.com](https://clerk.com) and create a free account
   - Create a new application
   - Enable Google OAuth provider
   - Copy your Publishable Key

4. Create environment file (`.env.local` or `.env`):
```bash
# Create .env.local file
```

5. Add your Clerk keys to `.env.local`:
```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_key_here
CLERK_SECRET_KEY=sk_test_your_secret_key_here
```

   **Note:** Vite requires the `VITE_` prefix for environment variables. The `CLERK_SECRET_KEY` is optional for frontend-only apps.

6. Configure Clerk Redirect URLs:
   - In your Clerk dashboard, go to "Paths"
   - Add `http://localhost:5173` to allowed redirect URLs
   - Add your production URL when deploying

### Running the Application

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The production build will be in the `dist` directory.

## Project Structure

```
src/
├── components/
│   ├── LandingPage.jsx      # Landing page with authentication
│   ├── LandingPage.css      # Landing page styles
│   ├── Dashboard.jsx        # Main dashboard component
│   └── Dashboard.css        # Dashboard styles
├── App.jsx                  # Main app component with routing
├── App.css                  # Global app styles
├── main.jsx                 # Entry point with Clerk provider
└── index.css                # Base styles
```

## Features Overview

### Landing Page
- Beautiful gradient design
- Google OAuth sign-in
- Feature highlights
- Responsive layout

### Dashboard
- **Prediction Form**: Input water quality parameters
  - Location
  - Water source type
  - Temperature, pH, Turbidity, Chlorine levels
- **Risk Assessment**: Real-time risk scoring
  - Low/Medium/High risk indicators
  - Potential disease identification
  - Actionable recommendations
- **Statistics**: Quick overview metrics
- **Activity Feed**: Recent system activities

## Environment Variables

Create a `.env` file in the root directory:

```
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

## ML Model Integration

The dashboard is now connected to a FastAPI backend that serves the trained Random Forest model.

### Backend Setup

1. **Install Python dependencies:**
```bash
cd backend
pip install -r requirements.txt
```

2. **Ensure the ML model is trained:**
   - Train the model using the Jupyter notebook: `extract/AWARE_random_forest_updated.ipynb`
   - The model will be saved to: `extract/rf_water_model.joblib`

3. **Start the FastAPI backend:**
```bash
# Windows
cd backend
python main.py

# Or use the start script
backend\start.bat

# Linux/Mac
cd backend
python main.py
# Or
chmod +x start.sh
./start.sh
```

The API will run on `http://localhost:8000`

### API Documentation

Once the backend is running, visit:
- **API Docs**: http://localhost:8000/docs (Interactive Swagger UI)
- **Health Check**: http://localhost:8000/health

### Model Inputs

The dashboard form now collects all required inputs:
- Temperature (°C)
- Dissolved Oxygen (DO) (mg/L)
- pH Level
- Conductivity (µmhos/cm)
- BOD (mg/L)
- Nitrate (mg/L)
- Fecal Coliform (MPN/100ml)
- Total Coliform (MPN/100ml)

### Running the Full Stack

1. **Terminal 1 - Start Backend:**
```bash
cd backend
python main.py
```

2. **Terminal 2 - Start Frontend:**
```bash
npm run dev
```

The dashboard will automatically connect to the ML model API for real predictions!

## Synthetic Sensor Simulator

The synthetic sensor simulator generates live water quality data and feeds it to the forecast model for real-time predictions.

### Prerequisites

- Trained forecast model: `extract/rf_forecast_model.joblib` (train using `extract/AWARE_random_forest.ipynb`)
- Python 3.7+ with required packages (pandas, numpy, scikit-learn, joblib)

### Usage

1. **Navigate to the extract folder:**
```bash
cd extract
```

2. **Run the synthetic sensor:**
```bash
python3 synthetic_sensors.py
```

3. **Use CLI commands:**
   - `on` - Start the sensor (begins generating readings and predictions)
   - `off` - Stop the sensor
   - `status` - Check sensor status and history buffer
   - `exit` - Quit the program

### How It Works

- **Generates synthetic readings** every 5 seconds based on historical data patterns
- **Maintains a history buffer** of the last L readings (L=3 by default)
- **Builds lag features** from the reading history
- **Makes forecasts** using the trained model (H=1 horizon)
- **Displays results** with risk level predictions and confidence scores

### Example Session

```bash
$ python3 synthetic_sensors.py
============================================================
AWARE Synthetic Sensor Simulator
============================================================
✅ Loaded forecast model: L=3, H=1
   Features: 24 lag features
✅ Loaded value ranges for 8 features

Commands:
  'on'     - Start sensor
  'off'    - Stop sensor
  'status' - Check sensor status
  'exit'   - Quit program
============================================================

> on
✅ Sensor started in background thread.

🟢 Sensor started. Generating readings...
============================================================

[2024-01-15 10:30:05] Sensor Reading:
  Temp            :    28.45
  DO              :     5.23
  pH              :     7.15
  ...

  📊 Forecast (H=1):
     Risk Level: Medium
     Confidence: 87.3%

> status
Sensor Status: 🟢 RUNNING
  History buffer: 3/3 readings
  Update interval: 5 seconds
  Ready for predictions: Yes

> off
✅ Sensor stopped.
🔴 Sensor stopped.

> exit
👋 Goodbye!
```

### Configuration

You can modify the update interval by editing `UPDATE_INTERVAL` in `synthetic_sensors.py` (default: 5 seconds).

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.

