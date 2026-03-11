import React, { useState, useEffect } from "react";
import "../styles/Notifications.css";
 
const Notifications = () => {
 
  const [popupMessage, setPopupMessage] = useState("");
  const [score, setScore] = useState(0);
 
  const finalScore = 82;
 
  useEffect(() => {
 
    let current = 0;
 
    const interval = setInterval(() => {
      current += 1;
 
      if (current >= finalScore) {
        current = finalScore;
        clearInterval(interval);
      }
 
      setScore(current);
 
    }, 20);
 
    return () => clearInterval(interval);
 
  }, []);
 
  const showPopup = (message) => {
    setPopupMessage(message);
 
    setTimeout(() => {
      setPopupMessage("");
    }, 3000);
  };
 
  return (
    <div className="page-container">
 
      {popupMessage && (
        <div className="popup-notification">
          {popupMessage}
        </div>
      )}
 
      <h1 className="page-title">📊 Health Reports</h1>
 
 
      {/* HEALTH SCORE SUMMARY */}
 
      <div className="health-summary">
 
        <div className="health-score">
 
          <h3>Overall Health Score</h3>
 
          <div className="score-number">
            {score}<span>/100</span>
          </div>
 
          <p className="score-desc">
            Based on sleep, stress and heart rate analysis
          </p>
 
        </div>
 
        <div className="health-breakdown">
 
          <div className="break-item">
            ❤️ Heart
            <span className="good">Good</span>
          </div>
 
          <div className="break-item">
            😴 Sleep
            <span className="moderate">Moderate</span>
          </div>
 
          <div className="break-item">
            🧠 Stress
            <span className="good">Low</span>
          </div>
 
        </div>
 
      </div>
 
 
      {/* REPORT CARDS */}
 
      <div className="report-grid">
 
 
        {/* HEART RATE */}
 
        <div className="report-card">
 
          <div className="report-header">
 
            <img
              src="/icons/heart-rate.png"
              alt="Heart Rate"
              className="report-icon"
            />
 
            <h2>Heart Rate</h2>
 
          </div>
 
          <div className="report-data">
 
            <p>Resting Heart Rate: <strong>72 bpm</strong></p>
            <p>Average Today: <strong>75 bpm</strong></p>
            <p>Max Today: <strong>110 bpm</strong></p>
            <p>Status: <span className="status-good">Healthy</span></p>
 
          </div>
 
        </div>
 
 
 
        {/* SLEEP */}
 
        <div className="report-card">
 
          <div className="report-header">
 
            <img
              src="/icons/sleep.png"
              alt="Sleep"
              className="report-icon"
            />
 
            <h2>Sleep</h2>
 
          </div>
 
          <div className="report-data">
 
            <p>Total Sleep: <strong>7h 46m</strong></p>
            <p>Deep Sleep: <strong>2h 12m</strong></p>
            <p>REM Sleep: <strong>1h 30m</strong></p>
            <p>Sleep Score: <strong>86 / 100</strong></p>
 
          </div>
 
        </div>
 
 
 
        {/* STRESS */}
 
        <div className="report-card">
 
          <div className="report-header">
 
            <img
              src="/icons/stress.png"
              alt="Stress"
              className="report-icon"
            />
 
            <h2>Stress</h2>
 
          </div>
 
          <div className="report-data">
 
            <p>Stress Level: <strong>Low</strong></p>
            <p>HRV Score: <strong>72</strong></p>
            <p>Relaxation Time: <strong>45 min</strong></p>
            <p>Status: <span className="status-good">Stable</span></p>
 
          </div>
 
        </div>
 
      </div>
 
 
      {/* BUTTONS */}
 
      <div className="report-buttons">
 
        <button
          className="download-button"
          onClick={() => showPopup("✔ Health Report PDF Downloaded")}
        >
          Download PDF Report
        </button>
 
        <button
          className="share-button"
          onClick={() => showPopup("✔ Report Shared With Doctor")}
        >
          Share With Doctor
        </button>
 
      </div>
 
    </div>
  );
};
 
export default Notifications;