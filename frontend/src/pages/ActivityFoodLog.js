import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import '../styles/ActivityFoodLog.css';

const ActivityFoodLog = () => {
  const [activityDate, setActivityDate] = useState('11/12/2025');
  const [activityType, setActivityType] = useState('Walking');
  const [duration, setDuration] = useState('34 km');
  const [mealType, setMealType] = useState('Breakfast');
  const [proteins, setProteins] = useState('23');
  const [carbs, setCarbs] = useState('42');
  const [fats, setFats] = useState('19');

  // Sample data for charts
  const weeklyData = [
    { day: 'Mon', value: 30 },
    { day: 'Tue', value: 45 },
    { day: 'Wed', value: 35 },
    { day: 'Thu', value: 50 },
    { day: 'Fri', value: 40 },
    { day: 'Sat', value: 55 },
    { day: 'Sun', value: 35 }
  ];

  const nutritionData = [
    { name: 'Protein', value: parseInt(proteins) || 0, color: '#4A90E2' },
    { name: 'Carbs', value: parseInt(carbs) || 0, color: '#E74C3C' },
    { name: 'Fats', value: parseInt(fats) || 0, color: '#2ECC71' }
  ];

  return (
    <div className="page-container">
      {/* Activity Log Section */}
      <div className="section-card" data-testid="activity-log-section">
        <h2 className="section-title">Activity Log</h2>
        <div className="log-grid">
          <div className="log-form" data-testid="activity-form">
            <div className="form-group">
              <label htmlFor="date-picker">Date Picker:</label>
              <input
                id="date-picker"
                type="text"
                value={activityDate}
                onChange={(e) => setActivityDate(e.target.value)}
                className="form-input"
                data-testid="activity-date-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="activity-type">Activity Type:</label>
              <select
                id="activity-type"
                value={activityType}
                onChange={(e) => setActivityType(e.target.value)}
                className="form-select"
                data-testid="activity-type-select"
              >
                <option>Walking</option>
                <option>Running</option>
                <option>Cycling</option>
                <option>Swimming</option>
                <option>Gym</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="duration">Duration / Distance Input:</label>
              <input
                id="duration"
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="form-input"
                data-testid="duration-input"
              />
            </div>

            <button className="submit-button" data-testid="activity-submit-btn">
              Submit
            </button>
          </div>

          <div className="chart-container" data-testid="weekly-activity-chart">
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#4A90E2" fill="#B3D9FF" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="chart-caption">Weekly activity increased by 12% compared to last week</p>
          </div>
        </div>
      </div>

      {/* Food Intake Log Section */}
      <div className="section-card" data-testid="food-intake-section">
        <h2 className="section-title">Food Intake Log</h2>
        <div className="log-grid">
          <div className="log-form" data-testid="food-form">
            <div className="form-group">
              <label htmlFor="meal-type">Meal Type:</label>
              <select
                id="meal-type"
                value={mealType}
                onChange={(e) => setMealType(e.target.value)}
                className="form-select"
                data-testid="meal-type-select"
              >
                <option>Breakfast</option>
                <option>Lunch</option>
                <option>Dinner</option>
                <option>Snack</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="proteins">Proteins (g):</label>
              <input
                id="proteins"
                type="text"
                value={proteins}
                onChange={(e) => setProteins(e.target.value)}
                className="form-input"
                data-testid="proteins-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="carbs">Carbs (g):</label>
              <input
                id="carbs"
                type="text"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                className="form-input"
                data-testid="carbs-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="fats">Fats (g):</label>
              <input
                id="fats"
                type="text"
                value={fats}
                onChange={(e) => setFats(e.target.value)}
                className="form-input"
                data-testid="fats-input"
              />
            </div>

            <button className="submit-button" data-testid="food-submit-btn">
              Submit
            </button>
          </div>

          <div className="chart-container" data-testid="nutrition-chart">
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={nutritionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={0}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label
                  >
                    {nutritionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-legend">
              <span className="legend-item"><span className="legend-dot blue"></span> Protein</span>
              <span className="legend-item"><span className="legend-dot red"></span> Carbs</span>
              <span className="legend-item"><span className="legend-dot green"></span> Fats</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityFoodLog;
