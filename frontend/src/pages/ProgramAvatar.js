import React, { useState } from 'react';
import '../styles/ProgramAvatar.css';

const ProgramAvatar = () => {
  const [avatarName, setAvatarName] = useState('');

  return (
    <div className="page-container">
      <div className="avatar-customization-grid">
        {/* Your Avatar */}
        <div className="card avatar-main-card" data-testid="avatar-main">
          <h2 className="section-title">Your Avatar</h2>
          <div className="avatar-display">
            <div className="avatar-image-large" data-testid="avatar-preview">
              {/* Avatar preview will be added */}
            </div>
            <input
              type="text"
              placeholder="Enter your Avatar name......"
              value={avatarName}
              onChange={(e) => setAvatarName(e.target.value)}
              className="avatar-name-input"
              data-testid="avatar-name-input"
            />
          </div>
        </div>

        {/* Face Options */}
        <div className="card customization-card" data-testid="face-options">
          <h2 className="section-title">FACE</h2>
          <div className="option-grid-square">
            <div className="option-item-square" data-testid="face-option-1">
              {/* Face option 1 */}
            </div>
            <div className="option-item-square" data-testid="face-option-2">
              {/* Face option 2 */}
            </div>
          </div>
          <button className="more-button" data-testid="face-more-btn">More</button>
        </div>

        {/* Hair Options */}
        <div className="card customization-card" data-testid="hair-options">
          <h2 className="section-title">HAIR</h2>
          <div className="option-grid-square">
            <div className="option-item-square" data-testid="hair-option-1">
              {/* Hair option 1 */}
            </div>
            <div className="option-item-square" data-testid="hair-option-2">
              {/* Hair option 2 */}
            </div>
          </div>
          <button className="more-button" data-testid="hair-more-btn">More</button>
        </div>

        {/* Skin Options */}
        <div className="card customization-card" data-testid="skin-options">
          <h2 className="section-title">SKIN</h2>
          <div className="option-grid-square">
            <div className="option-item-square" data-testid="skin-option-1">
              {/* Skin option 1 */}
            </div>
            <div className="option-item-square" data-testid="skin-option-2">
              {/* Skin option 2 */}
            </div>
          </div>
          <button className="more-button" data-testid="skin-more-btn">More</button>
        </div>

        {/* Hair Color Options */}
        <div className="card customization-card" data-testid="hair-color-options">
          <h2 className="section-title">HAIR COLOR</h2>
          <div className="option-grid-square">
            <div className="option-item-square color-option" data-testid="hair-color-option-1">
              {/* Hair color option 1 */}
            </div>
            <div className="option-item-square color-option" data-testid="hair-color-option-2">
              {/* Hair color option 2 */}
            </div>
          </div>
          <div className="color-buttons">
            <button className="more-button" data-testid="hair-color-more-btn">MORE</button>
            <button className="create-button" data-testid="avatar-create-btn">CREATE</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgramAvatar;
