import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaInstagram, FaFacebookF, FaTwitter } from 'react-icons/fa'; // Social Icons
import '../styles/LogIn.css'; 

export default function LoginPage() {
  const navigate = useNavigate();

  return (
    <div className="login-container">
      
      {/* left side brand, socials */}
      <div className="login-brand-section">
        <div className="brand-content">
          {/* need to replace src with our actual logo  */}
          <img 
            src="" 
            alt="HealUp Logo" 
            className="brand-logo" 
          />
          <h1 className="brand-name">HealUP!</h1>
          
          <div className="social-icons">
            <a href="#" className="icon"><FaInstagram /></a>
            <a href="#" className="icon"><FaFacebookF /></a>
            <a href="#" className="icon"><FaTwitter /></a>
        </div>
        </div>
      </div>

      {/* rright side (the white card) */}
      <div className="login-form-section">
        <div className="login-card">
          <h2 className="welcome-title">WELCOME BACK!</h2>
          
          <div className="input-group">
            <label>Username</label>
            <input type="text" placeholder="" />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input type="password" placeholder="........" />
          </div>

          <button 
            className="action-btn login-btn"
            onClick={() => navigate('/dashboard')}
          >
            Log-in
          </button>

          <div className="signup-prompt">
            <p>Don't have an account?</p>
            <span className="sub-text">Create a free account to manage your health data better</span>
          </div>

          <button 
            className="action-btn signup-btn"
            onClick={() => navigate('/signup')}>
            Sign-up
          </button>
        </div>
      </div>

    </div>
  );
}
