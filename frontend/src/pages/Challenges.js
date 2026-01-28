import React from 'react';
import '../styles/Challenges.css';

const Challenges = () => {
  const dailyChallenges = [
    { title: 'Walk 10,000 steps today', reward: '50 XP +5 Energy', checked: false },
    { title: 'Drink 2L of water', reward: '20 XP', checked: false },
    { title: 'No Sugary snacks', reward: '30 XP +3 Discipline', checked: false },
    { title: 'Morning Stretch', reward: '15 XP +1 Energy', checked: false },
    { title: 'Daily Workout Complete', reward: '50 XP +5 Energy', checked: false }
  ];

  const weeklyChallenges = [
    { title: 'Run a total distance of 20 km in a week', progress: 40, reward: '150 XP +50 Energy' },
    { title: 'Share progress with a friend', progress: 100, reward: '60 XP +20 Energy' },
    { title: 'Sleep 7-8 hours per night for 5 nights', progress: 70, reward: '120 XP +40 Energy' },
    { title: 'Drink 14L water total this week', progress: 60, reward: '100 XP +30 Energy' }
  ];

  return (
    <div className="page-container">
      <div className="challenges-grid">
        {/* Daily Challenges */}
        <div className="card challenges-card" data-testid="daily-challenges">
          <h2 className="section-title">Daily Challenges</h2>
          <div className="challenge-list">
            {dailyChallenges.map((challenge, index) => (
              <div key={index} className="challenge-item daily" data-testid={`daily-challenge-${index}`}>
                <div className="challenge-content">
                  <span className="challenge-title">{challenge.title}</span>
                  <div className="challenge-reward">
                    <span className="reward-icon">🪙</span>
                    <span>{challenge.reward}</span>
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  className="challenge-checkbox"
                  data-testid={`daily-checkbox-${index}`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Challenges */}
        <div className="card challenges-card" data-testid="weekly-challenges">
          <h2 className="section-title">Weekly Challenges</h2>
          <div className="challenge-list">
            {weeklyChallenges.map((challenge, index) => (
              <div key={index} className="challenge-item weekly" data-testid={`weekly-challenge-${index}`}>
                <div className="challenge-header">
                  <span className="challenge-title">{challenge.title}</span>
                </div>
                <div className="progress-container">
                  <div className="progress-bar-wrapper">
                    <div className="progress-bar-fill" style={{width: `${challenge.progress}%`}}></div>
                  </div>
                  <div className="challenge-reward-weekly">
                    <span className="reward-icon-weekly">⚡</span>
                    <span>{challenge.reward}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Challenges;
