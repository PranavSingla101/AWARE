import { useState } from 'react'
import Navbar from './Navbar'
import './Dashboard.css'

function Dashboard() {
  const [predictionData, setPredictionData] = useState({
    location: '',
    waterSource: 'tap',
    temperature: '',
    do: '',
    ph: '',
    conductivity: '',
    bod: '',
    nitrate: '',
    fecalColiform: '',
    totalColiform: ''
  })
  const [predictionResult, setPredictionResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setPredictionData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handlePredict = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // Prepare data for ML model (matching the model's expected features)
      // Convert to numbers and validate
      const temp = parseFloat(predictionData.temperature)
      const do_val = parseFloat(predictionData.do)
      const ph_val = parseFloat(predictionData.ph)
      const cond = parseFloat(predictionData.conductivity)
      const bod = parseFloat(predictionData.bod)
      const nitrate = parseFloat(predictionData.nitrate)
      const fecal = parseFloat(predictionData.fecalColiform)
      const total = parseFloat(predictionData.totalColiform)
      
      // Validate all inputs are valid numbers
      if (isNaN(temp) || isNaN(do_val) || isNaN(ph_val) || isNaN(cond) || 
          isNaN(bod) || isNaN(nitrate) || isNaN(fecal) || isNaN(total)) {
        throw new Error('Please fill in all fields with valid numbers')
      }
      
      const mlInput = {
        Temp: temp,
        DO: do_val,
        pH: ph_val,
        Conductivity: cond,
        BOD: bod,
        Nitrate: nitrate,
        FecalColiform: fecal,
        TotalColiform: total
      }
      
      console.log('Sending prediction request:', mlInput)

      // Call the ML model API (FastAPI backend) with timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
      
      const response = await fetch('http://localhost:8000/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mlInput),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('API Error Response:', errorData)
        console.error('Response status:', response.status)
        
        // Handle 422 validation errors specifically
        if (response.status === 422) {
          const validationErrors = errorData.detail || errorData
          let errorMsg = 'Validation error: '
          if (Array.isArray(validationErrors)) {
            errorMsg += validationErrors.map(err => {
              const field = err.loc ? err.loc.join('.') : 'unknown'
              return `${field}: ${err.msg}`
            }).join(', ')
          } else if (typeof validationErrors === 'string') {
            errorMsg += validationErrors
          } else {
            errorMsg += JSON.stringify(validationErrors)
          }
          throw new Error(errorMsg)
        }
        
        throw new Error(errorData.detail || errorData.message || `API error: ${response.status}`)
      }

      const result = await response.json()
      
      // Map the risk level to diseases and recommendations
      const diseases = getDiseasesForRisk(result.riskLevel)
      
      setPredictionResult({
        riskScore: result.riskScore || 'N/A',
        riskLevel: result.riskLevel,
        diseases,
        recommendations: getRecommendations(result.riskLevel),
        location: predictionData.location,
        waterSource: predictionData.waterSource,
        confidence: result.confidence
      })
    } catch (error) {
      console.error('Prediction error:', error)
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      })
      
      // Check if it's a network error
      let errorMessage = 'Failed to connect to ML API. '
      if (error.name === 'AbortError' || error.message.includes('timeout')) {
        errorMessage += 'Request timed out. Please try again.'
      } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError') || error.message.includes('Network request failed')) {
        errorMessage += 'Please ensure the FastAPI backend is running on http://localhost:8000'
      } else if (error.message) {
        errorMessage += error.message
      } else {
        errorMessage += 'Unknown error occurred. Check browser console for details.'
      }
      
      setPredictionResult({
        riskScore: null,
        riskLevel: null,
        diseases: [],
        recommendations: [],
        error: errorMessage
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getDiseasesForRisk = (riskLevel) => {
    if (riskLevel === 'High') {
      return ['Cholera', 'Typhoid', 'Dysentery', 'Hepatitis A']
    } else if (riskLevel === 'Medium') {
      return ['Gastroenteritis', 'Diarrhea']
    } else {
      return []
    }
  }

  const getRecommendations = (level) => {
    if (level === 'Low') {
      return [
        'Water quality is within safe parameters',
        'Continue regular monitoring',
        'Maintain current treatment protocols'
      ]
    } else if (level === 'Medium') {
      return [
        'Increase monitoring frequency',
        'Consider additional filtration',
        'Review treatment processes',
        'Notify health authorities'
      ]
    } else {
      return [
        'Immediate action required',
        'Issue public health advisory',
        'Implement emergency treatment',
        'Contact health department immediately',
        'Consider alternative water sources'
      ]
    }
  }

  return (
    <>
      <Navbar />
      <div className="dashboard">
        <header className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">AWARE Dashboard</h1>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-grid">
          {/* Prediction Form */}
          <div className="dashboard-card prediction-card">
            <h2 className="card-title">Disease Risk Prediction</h2>
            <form onSubmit={handlePredict} className="prediction-form">
              <div className="form-group">
                <label htmlFor="location">Location</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={predictionData.location}
                  onChange={handleInputChange}
                  placeholder="Enter location"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="waterSource">Water Source</label>
                <select
                  id="waterSource"
                  name="waterSource"
                  value={predictionData.waterSource}
                  onChange={handleInputChange}
                >
                  <option value="tap">Tap Water</option>
                  <option value="well">Well Water</option>
                  <option value="river">River</option>
                  <option value="lake">Lake</option>
                  <option value="reservoir">Reservoir</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="temperature">Temperature (°C)</label>
                  <input
                    type="number"
                    id="temperature"
                    name="temperature"
                    value={predictionData.temperature}
                    onChange={handleInputChange}
                    placeholder="25"
                    step="0.1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="do">Dissolved Oxygen (DO) (mg/L)</label>
                  <input
                    type="number"
                    id="do"
                    name="do"
                    value={predictionData.do}
                    onChange={handleInputChange}
                    placeholder="6.0"
                    step="0.1"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="ph">pH Level</label>
                  <input
                    type="number"
                    id="ph"
                    name="ph"
                    value={predictionData.ph}
                    onChange={handleInputChange}
                    placeholder="7.0"
                    min="0"
                    max="14"
                    step="0.1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="conductivity">Conductivity (µmhos/cm)</label>
                  <input
                    type="number"
                    id="conductivity"
                    name="conductivity"
                    value={predictionData.conductivity}
                    onChange={handleInputChange}
                    placeholder="200"
                    step="0.1"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="bod">BOD (mg/L)</label>
                  <input
                    type="number"
                    id="bod"
                    name="bod"
                    value={predictionData.bod}
                    onChange={handleInputChange}
                    placeholder="2.0"
                    step="0.1"
                    min="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="nitrate">Nitrate (mg/L)</label>
                  <input
                    type="number"
                    id="nitrate"
                    name="nitrate"
                    value={predictionData.nitrate}
                    onChange={handleInputChange}
                    placeholder="0.5"
                    step="0.1"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="fecalColiform">Fecal Coliform (MPN/100ml)</label>
                  <input
                    type="number"
                    id="fecalColiform"
                    name="fecalColiform"
                    value={predictionData.fecalColiform}
                    onChange={handleInputChange}
                    placeholder="100"
                    step="1"
                    min="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="totalColiform">Total Coliform (MPN/100ml)</label>
                  <input
                    type="number"
                    id="totalColiform"
                    name="totalColiform"
                    value={predictionData.totalColiform}
                    onChange={handleInputChange}
                    placeholder="500"
                    step="1"
                    min="0"
                    required
                  />
                </div>
              </div>

              <button type="submit" className="predict-button" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Analyzing...
                  </>
                ) : (
                  'Predict Risk'
                )}
              </button>
            </form>
          </div>

          {/* Prediction Results */}
          {predictionResult && (
            <div className="dashboard-card results-card">
              <h2 className="card-title">Prediction Results</h2>
              {predictionResult.error ? (
                <div className="error-banner">
                  <span className="error-icon">⚠️</span>
                  <p>{predictionResult.error}</p>
                  <p className="error-hint">Make sure to start the backend: <code>cd backend && python main.py</code></p>
                </div>
              ) : (
                <>
                  <div className={`risk-indicator risk-${predictionResult.riskLevel.toLowerCase()}`}>
                    <div className="risk-score">
                      <span className="score-value">{predictionResult.riskScore}%</span>
                      <span className="risk-level">{predictionResult.riskLevel} Risk</span>
                      {predictionResult.confidence && (
                        <span className="confidence-badge">Confidence: {predictionResult.confidence.toFixed(1)}%</span>
                      )}
                    </div>
                  </div>

              {predictionResult.diseases.length > 0 && (
                <div className="diseases-section">
                  <h3>Potential Diseases</h3>
                  <div className="diseases-list">
                    {predictionResult.diseases.map((disease, idx) => (
                      <span key={idx} className="disease-tag">{disease}</span>
                    ))}
                  </div>
                </div>
              )}

                  <div className="recommendations-section">
                    <h3>Recommendations</h3>
                    <div className="recommendations-grid">
                      {predictionResult.recommendations.map((rec, idx) => (
                        <div key={idx} className="recommendation-item">
                          <span className="recommendation-icon">✓</span>
                          <span className="recommendation-text">{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Stats Cards */}
          <div className="dashboard-card stats-card">
            <h2 className="card-title">Quick Stats</h2>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-value">12</div>
                <div className="stat-label">Active Monitors</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">3</div>
                <div className="stat-label">Alerts Today</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">98.5%</div>
                <div className="stat-label">System Accuracy</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">24/7</div>
                <div className="stat-label">Monitoring</div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="dashboard-card activity-card">
            <h2 className="card-title">Recent Activity</h2>
            <div className="activity-list">
              <div className="activity-item">
                <div className="activity-icon">🔍</div>
                <div className="activity-content">
                  <div className="activity-title">Risk assessment completed</div>
                  <div className="activity-time">2 minutes ago</div>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon">📊</div>
                <div className="activity-content">
                  <div className="activity-title">Data updated for Location A</div>
                  <div className="activity-time">15 minutes ago</div>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon">✅</div>
                <div className="activity-content">
                  <div className="activity-title">System health check passed</div>
                  <div className="activity-time">1 hour ago</div>
                </div>
              </div>
            </div>
          </div>

          {/* Water Quality Images Gallery */}
          <div className="dashboard-card images-card">
            <h2 className="card-title">Water Quality Examples</h2>
            <div className="images-grid">
              <div className="image-item">
                <img 
                  src="/drinking_water.jpg" 
                  alt="Clean drinking water" 
                  className="water-image"
                />
                <div className="image-label">Safe Drinking Water</div>
              </div>
              <div className="image-item">
                <img 
                  src="/lake_water.avif" 
                  alt="Lake water source" 
                  className="water-image"
                />
                <div className="image-label">Lake Water Source</div>
              </div>
              <div className="image-item">
                <img 
                  src="/water_bad.jpg" 
                  alt="Contaminated water" 
                  className="water-image"
                />
                <div className="image-label">Contaminated Water</div>
              </div>
            </div>
          </div>
        </div>
      </main>
      </div>
    </>
  )
}

export default Dashboard

