import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';

const HP_MAX = 100;
const ENERGY_MAX = 100;
const DISCIPLINE_MAX = 100;

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedStats = localStorage.getItem('stats');

    if (!storedUser) {
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    // Seed with cached stats immediately, then refresh from API
    if (storedStats) {
      setStats(JSON.parse(storedStats));
      setLoading(false);
    }

    fetch(`http://localhost:8001/api/stats/${parsedUser.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setStats(data);
          localStorage.setItem('stats', JSON.stringify(data));
        }
      })
      .catch(() => {/* use cached stats if fetch fails */})
      .finally(() => setLoading(false));
  }, [navigate]);

  const hpPct = stats ? Math.round((stats.hp / HP_MAX) * 100) : 0;
  const energyPct = stats ? Math.min(Math.round((stats.totalEnergy / ENERGY_MAX) * 100), 100) : 0;
  const disciplinePct = stats ? Math.min(Math.round((stats.totalDiscipline / DISCIPLINE_MAX) * 100), 100) : 0;

  return (
    <div className="page-container">
      <div className="dashboard-grid">

        {/* Avatar and Stats Section */}
        <div className="card large-card">
          <div className="avatar-section">
            <div className="avatar-placeholder" data-testid="avatar-image"></div>

            {user && (
              <p className="dashboard-greeting">Welcome, {user.fullName}!</p>
            )}

            {stats && (
              <div className="level-info">
                <span className="level-badge">Level {stats.level}</span>
                <span className="xp-display">{stats.totalXp} XP</span>
              </div>
            )}

            <div className="stat-bars">
              <div className="stat-bar" data-testid="hp-bar">
                <span className="stat-icon">❤️</span>
                <div className="progress-bar">
                  <div className="progress-fill red" style={{ width: `${hpPct}%` }}></div>
                </div>
                <span className="stat-label">
                  HP {loading ? '—' : `${stats?.hp ?? 0}/${HP_MAX}`}
                </span>
              </div>

              <div className="stat-bar" data-testid="energy-bar">
                <span className="stat-icon">⚡</span>
                <div className="progress-bar">
                  <div className="progress-fill blue" style={{ width: `${energyPct}%` }}></div>
                </div>
                <span className="stat-label">
                  Energy {loading ? '—' : stats?.totalEnergy ?? 0}
                </span>
              </div>

              <div className="stat-bar" data-testid="discipline-bar">
                <span className="stat-icon">💪</span>
                <div className="progress-bar">
                  <div className="progress-fill green" style={{ width: `${disciplinePct}%` }}></div>
                </div>
                <span className="stat-label">
                  Discipline {loading ? '—' : stats?.totalDiscipline ?? 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Heart Rate Card */}
        <div className="card small-card" data-testid="heart-rate-card">
          <h3>Heart Rate</h3>
          <div className="heart-icon">❤️</div>
          <div className="heart-rate-value">
            <span className="stat-placeholder-text">No data yet</span>
          </div>
        </div>

        {/* Sleep Card */}
        <div className="card small-card" data-testid="sleep-card">
          <h3>Sleep</h3>
          <div className="sleep-chart">
            <span className="stat-placeholder-text">No data yet</span>
          </div>
        </div>

        {/* Activities Card */}
        <div className="card small-card" data-testid="steps-card">
          <h3>Activities</h3>
          <div className="steps-content">
            <p className="stat-big-value">
              {loading ? '—' : stats?.totalActivitiesLogged ?? 0}
            </p>
            <span className="stat-unit">logged</span>
          </div>
        </div>

        {/* Calories Card */}
        <div className="card small-card" data-testid="calories-card">
          <h3>Calories Burned</h3>
          <div className="calories-chart">
            <p className="stat-big-value">
              {loading ? '—' : stats?.totalCaloriesBurned ?? 0}
            </p>
            <span className="stat-unit">kcal</span>
          </div>
        </div>

        {/* Challenges Card */}
        <div className="card medium-card" data-testid="challenges-summary-card">
          <h3>Challenges</h3>
          <div className="challenge-list">
            <span className="stat-placeholder-text">No challenges yet</span>
          </div>
        </div>

        {/* Distance Card */}
        <div className="card medium-card" data-testid="stress-card">
          <h3>Distance</h3>
          <div className="stress-meter">
            <p className="stat-big-value">
              {loading ? '—' : (stats?.totalDistance ?? 0).toFixed(1)}
            </p>
            <span className="stat-unit">km</span>
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
