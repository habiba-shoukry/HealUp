import React from 'react';
import '../styles/GoalsProgress.css';

const GoalsProgress = () => {
  const rewards = [
    { title: '8,790 Steps', reward: '50 XP +5 Energy', status: 'complete' },
    { title: '7hr 46m Sleep', reward: '30 XP +3 Discipline', status: 'complete' },
    { title: '2000 Calories burned', reward: '15 XP +1 Energy', status: 'incomplete' },
    { title: 'Stress Level 65', reward: '50 XP +5 Energy', status: 'complete' }
  ];

  return (
    <div className="page-container">
      <div className="goals-layout">
        {/* Left Side - Today's Rewards */}
        <div className="card rewards-card" data-testid="todays-rewards">
          <h2 className="section-title">Today's Rewards</h2>
          <div className="rewards-list">
            {rewards.map((reward, index) => (
              <div 
                key={index} 
                className={`reward-item ${reward.status}`}
                data-testid={`reward-${index}`}
              >
                <span className="reward-title">{reward.title}</span>
                <div className="reward-badge">
                  <span className={`status-indicator ${reward.status}`}></span>
                  <span className="reward-text">{reward.reward}</span>
                </div>
              </div>
            ))}
          </div>
          <button className="track-button" data-testid="track-rewards-btn">
            Track Rewards
          </button>
        </div>

        {/* Right Side - Stats Grid */}
        <div className="stats-right-section">
          <div className="stats-grid-compact">
            <div className="stat-card" data-testid="total-xp-card">
              <h3>Total XP</h3>
              <div className="stat-value blue">
                {/* Content to be added */}
              </div>
            </div>

            <div className="stat-card" data-testid="todays-xp-card">
              <h3>Today's XP</h3>
              <div className="stat-value green">
                {/* Content to be added */}
              </div>
            </div>

            <div className="stat-card" data-testid="total-eg-card">
              <h3>Total EG</h3>
              <div className="stat-value blue">
                {/* Content to be added */}
              </div>
            </div>

            <div className="stat-card" data-testid="todays-eg-card">
              <h3>Today's EG</h3>
              <div className="stat-value green">
                {/* Content to be added */}
              </div>
            </div>

            <div className="stat-card" data-testid="total-dp-card">
              <h3>Total Dp</h3>
              <div className="stat-value blue">
                {/* Content to be added */}
              </div>
            </div>

            <div className="stat-card" data-testid="todays-dp-card">
              <h3>Today's Dp</h3>
              <div className="stat-value red">
                {/* Content to be added */}
              </div>
            </div>
          </div>

          {/* View Goals Button */}
          <button className="view-goals-button" data-testid="view-goals-btn">
            View Goals
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoalsProgress;
