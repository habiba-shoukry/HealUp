import React from 'react';
import '../styles/Welcome.css'; 

export default function LandingPage() {
  return (
    <div className="container">
      {/* Logo Section */}
      <img 
        src="https://via.placeholder.com/80x80/000000/FFFFFF/?text=M" 
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
        onClick={() => navigate('/Dashboard')}
      >
        Get Started
      </button>

      {/* Download Badge */}
      <div className="download-section">
        <p className="download-text">Download our app!</p>
        <img 
          src="https://via.placeholder.com/60x60/FFFFFF/4b637a/?text=M" 
          alt="HealUp App Icon" 
          className="app-icon" 
        />
      </div>
    </div>
  );
}