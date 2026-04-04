import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Welcome.css';

// Generates random star elements for the background
const StarField = () => {
  const stars = Array.from({ length: 55 }, (_, i) => ({
    id: i,
    size: Math.random() * 2 + 0.5,
    top: Math.random() * 100,
    left: Math.random() * 100,
    dur: (Math.random() * 4 + 2).toFixed(1),
    delay: (Math.random() * 5).toFixed(1),
    peak: (Math.random() * 0.55 + 0.15).toFixed(2),
  }));

  return (
    <div className="stars" aria-hidden="true">
      {stars.map(s => (
        <div
          key={s.id}
          className="star"
          style={{
            width: s.size,
            height: s.size,
            top: `${s.top}%`,
            left: `${s.left}%`,
            '--dur': `${s.dur}s`,
            '--delay': `${s.delay}s`,
            '--peak': s.peak,
          }}
        />
      ))}
    </div>
  );
};

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="welcome-screen">
      <StarField />

      <div className="welcome-content">

        {/* Logo */}
        <div className="logo-badge">
          <div className="logo-ring" aria-hidden="true" />
          <img
            src="/logo-transparent.png"
            alt="HealUp Logo"
            className="logo-icon"
          />
        </div>

        {/* Status pill */}
        <div className="welcome-pill" role="status">
          Your wellness journey starts here
        </div>

        {/* Headline */}
        <h1>
          Heal smarter,<br />
          live <span>better.</span>
        </h1>

        <div className="welcome-divider" aria-hidden="true" />

        {/* Subtitle */}
        <p className="subtitle">
          Your personal guide to better habits,<br />
          smarter choices, and healthier living.
        </p>

        {/* CTA */}
        <button
          className="get-started-btn"
          onClick={() => navigate('/logIn')}
          aria-label="Get started with HealUp"
        >
          Get Started <span className="btn-arrow" aria-hidden="true">→</span>
        </button>

        {/* Trust nudge */}
        <p className="trust-line">
          Free to join &nbsp;·&nbsp; <strong>No credit card required</strong>
        </p>

      </div>
    </div>
  );
}
