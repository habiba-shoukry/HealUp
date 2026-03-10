import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaInstagram, FaFacebookF, FaTwitter } from 'react-icons/fa';
import '../styles/LogIn.css';

export default function SignUp() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setError('');
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
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

    return null;
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
      const response = await fetch('http://localhost:8001/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          password: formData.password,
          confirmPassword: formData.confirmPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Sign up failed. Please try again.');
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      if (data.stats) localStorage.setItem('stats', JSON.stringify(data.stats));
      navigate('/dashboard');
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

          {error && <p className="auth-error">{error}</p>}

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
