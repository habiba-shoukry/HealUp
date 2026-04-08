import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaInstagram, FaFacebookF, FaTwitter } from 'react-icons/fa';
import '../styles/LogIn.css';

export default function SignUp() {
  const navigate = useNavigate();
  const apiBaseUrl =
    process.env.REACT_APP_API_BASE_URL ||
    `${window.location.protocol}//${window.location.hostname}:5000`;

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'patient',
    healthProgram: 'wellbeing'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setError('');
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRoleChange = (selectedRole) => {
    setFormData((prev) => ({
      ...prev,
      role: selectedRole,
      healthProgram: selectedRole === 'doctor' ? '' : 'wellbeing'
    }));
  };

  const handleProgramChange = (selectedProgram) => {
    setFormData((prev) => ({ ...prev, healthProgram: selectedProgram }));
  };

  const validate = () => {
    const { fullName, email, password, confirmPassword } = formData;
    if (!fullName.trim()) return 'Full name is required.';
    if (!/^[A-Za-z\s]+$/.test(fullName)) return 'Full name can only contain letters and spaces.';
    if (!email.trim()) return 'Email is required.';
    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) return 'Please enter a valid email address.';
    if (!password) return 'Password is required.';
    if (password.length < 8) return 'Password must be at least 8 characters long.';
    if (password !== confirmPassword) return 'Passwords do not match.';
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          role: formData.role,
          healthProgram: formData.healthProgram
        })
      });

      let data = {};
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        setError(data.error || 'Sign up failed. Please try again.');
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
            Join thousands already tracking<br />
            their health journey with HealUp.
          </p>


          <div className="social-icons">
  <a
    href="https://www.instagram.com/healup.wellness?igsh=dTA4aWwxZ2drOWtk&utm_source=qr"
    target="_blank"
    rel="noopener noreferrer"
    className="icon"
    aria-label="Instagram"
  >
    <FaInstagram />
  </a>

  <a
    href="https://facebook.com/yourusername"
    target="_blank"
    rel="noopener noreferrer"
    className="icon"
    aria-label="Facebook"
  >
    <FaFacebookF />
  </a>

  <a
    href="https://x.com/healupwellness?s=21"
    target="_blank"
    rel="noopener noreferrer"
    className="icon"
    aria-label="Twitter"
  >
    <FaTwitter />
  </a>
</div>

        </div>
      </div>

      {/* ── RIGHT: Form card ── */}
      <div className="login-form-section">
        <div className="login-card">

          <h2 className="welcome-title">Create Account</h2>

          {error && <p className="auth-error">{error}</p>}

          {/* Role toggle */}
          <div className="input-group">
            <label>I am a</label>
            <div className="role-toggle">
              <button
                type="button"
                className={`role-btn ${formData.role === 'patient' ? 'active' : ''}`}
                onClick={() => handleRoleChange('patient')}
              >
                <img src="/user.png" alt="Patient" className="role-icon" />
                Patient / User
              </button>
              <button
                type="button"
                className={`role-btn ${formData.role === 'doctor' ? 'active' : ''}`}
                onClick={() => handleRoleChange('doctor')}
              >
                <img src="/doctor.png" alt="Doctor" className="role-icon" />
                Doctor
              </button>
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              type="text"
              name="fullName"
              placeholder="Your full name"
              value={formData.fullName}
              onChange={handleChange}
              maxLength={50}
              onKeyDown={(e) => {
                if (!/[A-Za-z\s]/.test(e.key) && e.key.length === 1) e.preventDefault();
              }}
            />
          </div>

          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="user@example.com"
              value={formData.email}
              onChange={handleChange}
              maxLength={100}
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="Min. 8 characters"
              value={formData.password}
              onChange={handleChange}
              minLength={8}
              maxLength={100}
            />
          </div>

          <div className="input-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              placeholder="Repeat your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              minLength={8}
              maxLength={100}
            />
          </div>

          <button
            className="action-btn login-btn"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Creating account…' : 'Sign Up →'}
          </button>

          <div className="auth-divider">or</div>

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
