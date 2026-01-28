import React from 'react';
import '../styles/Dashboard.css';

const Dashboard = () => {
  return (
    <div className="page-container">
      <div className="dashboard-grid">
        {/* Avatar and Stats Section */}
        <div className="card large-card">
          <div className="avatar-section">
            <div className="avatar-placeholder" data-testid="avatar-image">
              {/* Avatar image will be added later */}
            </div>
            <div className="stat-bars">
              <div className="stat-bar" data-testid="hp-bar">
                <span className="stat-icon">❤️</span>
                <div className="progress-bar">
                  <div className="progress-fill red" style={{width: '65%'}}></div>
                </div>
                <span className="stat-label">HP</span>
              </div>
              <div className="stat-bar" data-testid="energy-bar">
                <span className="stat-icon">⚡</span>
                <div className="progress-bar">
                  <div className="progress-fill blue" style={{width: '80%'}}></div>
                </div>
                <span className="stat-label">Energy</span>
              </div>
              <div className="stat-bar" data-testid="discipline-bar">
                <span className="stat-icon">💪</span>
                <div className="progress-bar">
                  <div className="progress-fill green" style={{width: '45%'}}></div>
                </div>
                <span className="stat-label">Discipline</span>
              </div>
            </div>
          </div>
        </div>

        {/* Heart Rate Card */}
        <div className="card small-card" data-testid="heart-rate-card">
          <h3>Heart Rate</h3>
          <div className="heart-icon">❤️</div>
          <div className="heart-rate-value">
            {/* Content to be added */}
          </div>
        </div>

        {/* Sleep Card */}
        <div className="card small-card" data-testid="sleep-card">
          <h3>Sleep</h3>
          <div className="sleep-chart">
            {/* Content to be added */}
          </div>
        </div>

        {/* Steps Card */}
        <div className="card small-card" data-testid="steps-card">
          <h3>Steps</h3>
          <div className="steps-content">
            {/* Content to be added */}
          </div>
        </div>

        {/* Calories Card */}
        <div className="card small-card" data-testid="calories-card">
          <h3>Calories</h3>
          <div className="calories-chart">
            {/* Content to be added */}
          </div>
        </div>

        {/* Challenges Card */}
        <div className="card medium-card" data-testid="challenges-summary-card">
          <h3>Challenges</h3>
          <div className="challenge-list">
            {/* Content to be added */}
          </div>
        </div>

        {/* Stress Card */}
        <div className="card medium-card" data-testid="stress-card">
          <h3>Stress</h3>
          <div className="stress-meter">
            {/* Content to be added */}
          </div>
        </div>

        {/* Action Buttons */}
        <button className="dashboard-action-btn log-btn" data-testid="log-activities-btn">
          Log Activities and Food Intake
        </button>

        <button className="dashboard-action-btn sync-btn" data-testid="sync-device-btn">
          Sync Device
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
