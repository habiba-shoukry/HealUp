import React, { useState } from 'react';
import '../styles/ChatboxButton.css';

const ChatboxButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChatbox = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Chatbox Button */}
      {!isOpen && (
        <button 
          className="chatbox-button" 
          onClick={toggleChatbox}
          data-testid="chatbox-open-btn"
        >
          💬
        </button>
      )}

      {/* Chatbox Window */}
      {isOpen && (
        <div className="chatbox-window" data-testid="chatbox-window">
          <div className="chatbox-header">
            <h3>Chat with us</h3>
            <button 
              className="chatbox-close" 
              onClick={toggleChatbox}
              data-testid="chatbox-close-btn"
            >
              ✕
            </button>
          </div>
          <div className="chatbox-content">
            <div className="chatbox-messages">
              <div className="chatbox-message bot-message">
                <p>Hello! How can I help you today?</p>
              </div>
            </div>
            <div className="chatbox-input-area">
              <input 
                type="text" 
                placeholder="Type your message..."
                className="chatbox-input"
                data-testid="chatbox-input"
              />
              <button className="chatbox-send" data-testid="chatbox-send-btn">
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatboxButton;
