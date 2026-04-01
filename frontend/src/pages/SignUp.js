import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaInstagram, FaFacebookF, FaTwitter } from 'react-icons/fa';
import '../styles/LogIn.css';

export default function SignUp() {
  const navigate = useNavigate();
  const apiBaseUrl =
    process.env.REACT_APP_API_BASE_URL ||
    `${window.location.protocol}//${window.location.hostname}:8001`;

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'patient',             // Default role
    healthProgram: 'wellbeing'   // Default health program
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setError('');
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Custom handlers for our new toggle buttons
  const handleRoleChange = (selectedRole) => {
    setFormData((prev) => ({
      ...prev,
      role: selectedRole,
      // If they switch to doctor, we don't need a health program. 
      // If they switch back to patient, default to wellbeing.
      healthProgram: selectedRole === 'doctor' ? '' : 'wellbeing'
    }));
  };

  const handleProgramChange = (selectedProgram) => {
    setFormData((prev) => ({ ...prev, healthProgram: selectedProgram }));
  };

  const validate = () => {
    const { fullName, email, password, confirmPassword } = formData;

    if (!fullName.trim()) return 'Full name is required.';
    if (!/^[A-Za-z\s]+$/.test(fullName))
      return 'Full name can only contain letters and spaces.';

    if (!email.trim()) return 'Email is required.';
    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))
      return 'Please enter a valid email address.';

    if (!password) return 'Password is required.';
    if (password.length < 8) return 'Password must be at least 8 characters long.';

    if (password !== confirmPassword) return 'Passwords do not match.';

    return null; // Health program is handled by default toggles, so no text validation needed!
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

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

      {/* left side brand */}
      <div className="login-brand-section">
        <div className="brand-content">
          <img
            src="\logo-transparent.png"
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

          {error && <p className="auth-error">{error}</p>}

          {/* NEW: Role Toggle Buttons */}
          <div className="input-group">
            <label style={{ display: 'block', marginBottom: '8px' }}>I am a:</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => handleRoleChange('patient')}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '20px',
                  border: '2px solid #4dabf7',
                  backgroundColor: formData.role === 'patient' ? '#4dabf7' : 'transparent',
                  color: formData.role === 'patient' ? '#fff' : '#4dabf7',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: '0.3s'
                }}
              >
                Patient / User
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange('doctor')}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '20px',
                  border: '2px solid #4dabf7',
                  backgroundColor: formData.role === 'doctor' ? '#4dabf7' : 'transparent',
                  color: formData.role === 'doctor' ? '#fff' : '#4dabf7',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: '0.3s'
                }}
              >
                Doctor
              </button>
            </div>
          </div>

          <div className="input-group">
            <label>Full Name</label>
            <input
              type="text"
              name="fullName"
              placeholder="Name"
              value={formData.fullName}
              onChange={handleChange}
              maxLength={50}
              pattern="[A-Za-z\s]*"
              title="Letters and spaces only"
              onKeyDown={(e) => {
                if (!/[A-Za-z\s]/.test(e.key) && e.key.length === 1) e.preventDefault();
              }}
            />
          </div>

          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="user@example.com"
              value={formData.email}
              onChange={handleChange}
              maxLength={100}
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
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
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Repeat password"
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
            {loading ? 'Creating account...' : 'Sign Up'}
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