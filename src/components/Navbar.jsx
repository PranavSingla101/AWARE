import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { SignedIn, SignedOut, useUser, UserButton } from '@clerk/clerk-react'
import './Navbar.css'

function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const location = useLocation()
  const dropdownRef = useRef(null)
  const { user } = useUser()
  const isDashboard = location.pathname === '/dashboard'

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen])

  const closeDropdown = () => {
    setIsDropdownOpen(false)
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={closeDropdown}>
          <img src="/aware_logo.png" alt="AWARE Logo" className="logo-image" />
        </Link>
        
        <div className="navbar-right">
          {isDashboard && (
            <SignedIn>
              <div className="navbar-user-info">
                <span className="user-greeting">
                  Welcome, {user?.firstName || user?.emailAddresses[0]?.emailAddress}
                </span>
                <UserButton afterSignOutUrl="/" />
              </div>
            </SignedIn>
          )}
          
          <div className="navbar-menu" ref={dropdownRef}>
            <button 
              className="navbar-dropdown-toggle"
              onClick={toggleDropdown}
              aria-expanded={isDropdownOpen}
              aria-haspopup="true"
            >
              <span>Navigation</span>
              <svg 
                className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}
                width="16" 
                height="16" 
                viewBox="0 0 16 16" 
                fill="none"
              >
                <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            
            {isDropdownOpen && (
              <div className="navbar-dropdown">
                <Link 
                  to="/" 
                  className={`dropdown-item ${location.pathname === '/' ? 'active' : ''}`}
                  onClick={closeDropdown}
                >
                  <span className="dropdown-icon">🏠</span>
                  Landing Page
                </Link>
                <SignedIn>
                  <Link 
                    to="/dashboard" 
                    className={`dropdown-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
                    onClick={closeDropdown}
                  >
                    <span className="dropdown-icon">📊</span>
                    Dashboard
                  </Link>
                </SignedIn>
                <SignedOut>
                  <div className="dropdown-item disabled">
                    <span className="dropdown-icon">📊</span>
                    Dashboard (Sign in required)
                  </div>
                </SignedOut>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar

