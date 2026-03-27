import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Welcome.css'; 

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="welcome-screen">
      <div className="welcome-content">
        
        <img 
          src="" 
          alt="HealUp Logo Icon" 
          className="logo-icon" 
        />
        
        <h1>Welcome to HealUp</h1>
        <p className="subtitle">
          Your personal guide to better habits,<br />
          smarter choices, and healthier living.
        </p>
      
        <button 
          className="get-started-btn" 
          onClick={() => navigate('/logIn')}
        >
          Get Started
        </button>

        {/* <div className="download-section">
          <p className="download-text">Download our app!</p>
          <img 
            src="https://via.placeholder.com/60x60/FFFFFF/4b637a/?text=M" 
            alt="HealUp App Icon" 
            className="app-icon" 
          />
        </div> */}
        
      </div>
    </div>
  );
}
