import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaInstagram, FaFacebookF, FaTwitter } from 'react-icons/fa';
import '../styles/LogIn.css';

export default function LoginPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setError('');
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    if (!formData.identifier.trim()) return 'Username or email is required.';
    if (!formData.password) return 'Password is required.';
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: formData.identifier.trim(),
          password: formData.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed. Please try again.');
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      if (data.stats) localStorage.setItem('stats', JSON.stringify(data.stats));
      if (data.user.role === 'doctor') {
        navigate('/doctor-dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch {
      setError('Could not connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">

      {/* ── LEFT: Brand panel ── */}
      <div className="login-brand-section">
        <div className="brand-content">

          <div className="brand-logo-row">
            <img
              src="/logo-transparent.png"
              alt="HealUp Logo"
              className="brand-logo"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <h1 className="brand-name">Heal<span>UP</span>!</h1>
          </div>

          <p className="brand-tagline">
            Your personal guide to better habits,<br />
            smarter choices, and healthier living.
          </p>

        

          <div className="social-icons">
            <a href="#" className="icon" aria-label="Instagram"><FaInstagram /></a>
            <a href="#" className="icon" aria-label="Facebook"><FaFacebookF /></a>
            <a href="#" className="icon" aria-label="Twitter"><FaTwitter /></a>
          </div>

        </div>
      </div>

      {/* ── RIGHT: Form card ── */}
      <div className="login-form-section">
        <div className="login-card">

          <h2 className="welcome-title">Welcome Back</h2>

          {error && <p className="auth-error">{error}</p>}

          <div className="input-group">
            <label htmlFor="identifier">Username or Email</label>
            <input
              id="identifier"
              type="text"
              name="identifier"
              placeholder="Enter your username or email"
              value={formData.identifier}
              onChange={handleChange}
              maxLength={100}
              autoComplete="username"
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              maxLength={100}
              autoComplete="current-password"
            />
          </div>

          <button
            className="action-btn login-btn"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Logging in…' : 'Log In →'}
          </button>

          <div className="auth-divider">or</div>

          <div className="signup-prompt">
            <p>Don't have an account?</p>
            <span className="sub-text">Create a free account to manage your health data better</span>
          </div>

          <button
            className="action-btn signup-btn"
            onClick={() => navigate('/signup')}
          >
            Create Account
          </button>

        </div>
      </div>

    </div>
  );
}
