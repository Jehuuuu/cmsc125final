import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

/**
 * Landing page component with menu options
 * @return {JSX.Element} The LandingPage component
 */
function LandingPage() {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="landing-page">
      <div className="landing-container">
        <h1 className="landing-title">Operating System Simulator</h1>
        <p className="landing-subtitle">Choose a module to get started</p>
        
        <div className="menu-buttons">
          <button 
            className="menu-button ide-button"
            onClick={() => handleNavigation('/ide')}
          >
            <div className="button-icon">💻</div>
            <div className="button-text">
              <h3>IDE</h3>
              <p>Integrated Development Environment</p>
            </div>
          </button>

          <button 
            className="menu-button scheduler-button"
            onClick={() => handleNavigation('/simulation')}
          >
            <div className="button-icon">⏰</div>
            <div className="button-text">
              <h3>Old CPU Scheduler</h3>
              <p>Process scheduling algorithms</p>
            </div>
          </button>

          <button 
            className="menu-button simulator-button"
            onClick={() => handleNavigation('/os-simulation')}
          >
            <div className="button-icon">🖥️</div>
            <div className="button-text">
              <h3>OS Simulator</h3>
              <p>Complete operating system simulation</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default LandingPage; 