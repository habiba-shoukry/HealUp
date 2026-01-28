import React from 'react';
import '../styles/Notifications.css';

const Notifications = () => {
  const notifications = [
    { 
      title: 'Challenge Complete', 
      description: 'Walked 10,000 steps',
      time: '11:20AM'
    },
    { 
      title: 'Reward Earned', 
      description: 'Earned 10 XP',
      time: '10:00AM'
    },
    { 
      title: 'Goal Complete', 
      description: 'Sleep time 7hr 46m',
      time: '8:00AM'
    }
  ];

  return (
    <div className="page-container">
      <div className="notifications-grid">
        {/* Left Section - Today's Notifications */}
        <div className="notifications-section">
          <div className="card notifications-card" data-testid="notifications-list">
            <h2 className="section-title">Today's Notifications</h2>
            <div className="notification-list">
              {notifications.map((notification, index) => (
                <div key={index} className="notification-item" data-testid={`notification-${index}`}>
                  <div className="notification-content">
                    <h3 className="notification-title">{notification.title}</h3>
                    <p className="notification-description">{notification.description}</p>
                  </div>
                  <span className="notification-time">{notification.time}</span>
                </div>
              ))}
            </div>
            <button className="track-more-button" data-testid="track-more-btn">
              Track More
            </button>
          </div>
        </div>

        {/* Right Section - Health Reports */}
        <div className="reports-section">
          {/* Heart Rate Card */}
          <div className="report-card-wrapper">
            <div className="card report-card-small" data-testid="heart-rate-report">
              <h3 className="report-title">Heart Rate</h3>
              <div className="heart-rate-icon">❤️</div>
              <div className="heart-rate-display">
                {/* Content to be added */}
              </div>
            </div>
            <div className="card report-card-detail" data-testid="heart-rate-detail">
              <h3 className="report-title">Heart Rate</h3>
              <p className="report-text">
                {/* Content to be added */}
              </p>
            </div>
          </div>

          {/* Sleep Card */}
          <div className="report-card-wrapper">
            <div className="card report-card-small" data-testid="sleep-report">
              <h3 className="report-title">Sleep</h3>
              <div className="sleep-display">
                {/* Content to be added */}
              </div>
            </div>
            <div className="card report-card-detail" data-testid="sleep-detail">
              <h3 className="report-title">Sleep</h3>
              <p className="report-text">
                {/* Content to be added */}
              </p>
            </div>
          </div>

          {/* Stress Card */}
          <div className="report-card-wrapper">
            <div className="card report-card-small" data-testid="stress-report">
              <h3 className="report-title">Stress</h3>
              <div className="stress-display">
                {/* Content to be added */}
              </div>
            </div>
            <div className="card report-card-detail" data-testid="stress-detail">
              <h3 className="report-title">Stress</h3>
              <p className="report-text">
                {/* Content to be added */}
              </p>
            </div>
          </div>

          {/* Track Report Button */}
          <button className="track-report-button" data-testid="track-report-btn">
            Track Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
