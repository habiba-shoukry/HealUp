import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaInstagram, FaFacebookF, FaTwitter } from 'react-icons/fa'; 
import '../styles/LogIn.css'; 

export default function SignUp() {
  const navigate = useNavigate();

  return (
    <div className="login-container">
      
      {/* left side brand */}
      <div className="login-brand-section">
        <div className="brand-content">
          <img 
            src="https://via.placeholder.com/150/4dabf7/FFFFFF?text=M" 
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

      {/* right side form */}
      <div className="login-form-section">
        <div className="login-card">
          <h2 className="welcome-title">CREATE ACCOUNT</h2>
                   
          <div className="input-group">
            <label>Full Name</label>
            <input type="text" placeholder="Name" />
          </div>
         
          <div className="input-group">
            <label>Email / Username</label>
            <input type="text" placeholder="user@example.com" />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input type="password" placeholder="........" />
          </div>

           <div className="input-group">
            <label>Confirm Password</label>
            <input type="password" placeholder="........" />
          </div>

          <button 
            className="action-btn login-btn"
            onClick={() => navigate('/dashboard')}
          >
            Sign Up
          </button>


          <div className="signup-prompt">
            <p>Already have an account?</p>
          </div>

          <button 
            className="action-btn signup-btn"
            onClick={() => navigate('/login')}
          >
            Log In instead
          </button>
        </div>
      </div>

    </div>
  );
}
