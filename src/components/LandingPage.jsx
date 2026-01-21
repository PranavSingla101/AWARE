import { Link } from 'react-router-dom'
import { SignedIn } from '@clerk/clerk-react'
import { useEffect } from 'react'
import Navbar from './Navbar'
import './LandingPage.css'

// Check if Clerk is configured
const isClerkConfigured = !!(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || import.meta.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)

function LandingPage() {
  // Handle hash navigation (scroll to section from URL)
  useEffect(() => {
    const hash = window.location.hash.replace('#', '')
    if (hash) {
      setTimeout(() => {
        const element = document.getElementById(hash)
        if (element) {
          const offset = 80 // Account for fixed navbar
          const elementPosition = element.getBoundingClientRect().top
          const offsetPosition = elementPosition + window.pageYOffset - offset
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          })
        }
      }, 300) // Delay to ensure page is fully loaded
    }
  }, [])

  return (
    <>
      <Navbar />
      <div className="landing-page">
      <div className="landing-container">
        <div className="hero-section">
          <h1 className="hero-title">
            <span className="title-accent">AWARE</span>
            <br />
            Waterborne Disease Predictor
          </h1>
          <p className="hero-subtitle">
            Advanced analytics and prediction system for waterborne disease monitoring
          </p>
          <p className="hero-description">
            Monitor water quality, predict disease outbreaks, and protect your community 
            with AI-powered insights and real-time data analysis.
          </p>
        </div>

        <div className="image-collage">
          <div className="collage-item">
            <img 
              src="/drinking_water.jpg" 
              alt="Safe drinking water" 
              className="collage-image"
            />
          </div>
          <div className="collage-item">
            <img 
              src="/lake_water.avif" 
              alt="Lake water source" 
              className="collage-image"
            />
          </div>
          <div className="collage-item">
            <img 
              src="/water_bad.jpg" 
              alt="Contaminated water" 
              className="collage-image"
            />
          </div>
        </div>

        <section id="mission" className="mission-section">
          <h2 className="mission-title">Our Mission</h2>
          <p className="mission-tagline">
            Early Warnings. Safer Communities. Healthier Futures.
          </p>
          <div className="mission-content">
            <p className="mission-paragraph">
              We created AWARE because too many rural communities suffer silently from preventable waterborne diseases. Delayed reporting, weak connectivity, and slow responses cost precious time and lives.
            </p>
            <p className="mission-paragraph">
              Our dream is to change that.
            </p>
            <p className="mission-paragraph">
              AWARE brings together community reports, water quality insights, and AI predictions to warn villages before outbreaks take hold.
            </p>
            <p className="mission-paragraph">
              Built for ASHA workers, health officials, and every family that deserves safe water, AWARE is our step toward a future where early action replaces crisis, and awareness becomes protection.
            </p>
          </div>
        </section>

        <section id="methodology" className="methodology-section">
          <h2 className="section-title">Methodology</h2>
          <div className="methodology-content">
            <p className="methodology-paragraph">
              AWARE employs a comprehensive approach combining community reporting, sensor data, and artificial intelligence to predict and prevent waterborne disease outbreaks.
            </p>
            <p className="methodology-paragraph">
              Our system integrates real-time water quality monitoring, community health reports from ASHA workers, and advanced machine learning algorithms to identify potential risks before they escalate into full-blown outbreaks.
            </p>
            <p className="methodology-paragraph">
              By analyzing patterns in water contamination, disease symptoms, and environmental factors, AWARE provides early warnings that enable proactive intervention and save lives.
            </p>
          </div>
        </section>

        <div className="features-section">
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Real-time Monitoring</h3>
            <p>Track water quality metrics in real-time across multiple locations</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔮</div>
            <h3>AI Predictions</h3>
            <p>Advanced machine learning models predict disease outbreaks before they happen</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📈</div>
            <h3>Analytics Dashboard</h3>
            <p>Comprehensive data visualization and trend analysis</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔔</div>
            <h3>Alert System</h3>
            <p>Get instant notifications when risk levels exceed safe thresholds</p>
          </div>
        </div>

        {isClerkConfigured ? (
          <SignedIn>
            <div className="emergency-request-section">
              <div className="emergency-request-card">
                <div className="emergency-request-content">
                  <div className="emergency-request-icon">🚨</div>
                  <div className="emergency-request-text">
                    <h3 className="emergency-request-title">Report an Emergency</h3>
                    <p className="emergency-request-description">
                      Found a water quality issue? Report it immediately for urgent action.
                    </p>
                  </div>
                </div>
                <Link to="/emergency-request" className="emergency-request-button">
                  Request Emergency Check
                </Link>
              </div>
            </div>
          </SignedIn>
        ) : (
          <div className="emergency-request-section">
            <div className="emergency-request-card">
              <div className="emergency-request-content">
                <div className="emergency-request-icon">🚨</div>
                <div className="emergency-request-text">
                  <h3 className="emergency-request-title">Report an Emergency</h3>
                  <p className="emergency-request-description">
                    Found a water quality issue? Report it immediately for urgent action.
                  </p>
                </div>
              </div>
              <Link to="/emergency-request" className="emergency-request-button">
                Request Emergency Check
              </Link>
            </div>
          </div>
        )}

        <section id="contact" className="contact-section">
          <h2 className="section-title">Contact</h2>
          <div className="contact-content">
            <p className="contact-paragraph">
              Have questions about AWARE or need support? We're here to help.
            </p>
            <p className="contact-paragraph">
              For technical assistance, partnership inquiries, or general information, please reach out to our team.
            </p>
            <div className="contact-email">
              <a href="mailto:reachout@teamaware.com" className="email-link">
                reachout@teamaware.com
              </a>
            </div>
            <p className="contact-paragraph">
              Together, we can build healthier communities through early warning and proactive action.
            </p>
          </div>
        </section>
      </div>
    </div>
    </>
  )
}

export default LandingPage

