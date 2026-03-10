import React, { useState, useRef, useEffect } from 'react';
import '../styles/Chatbot.css';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello, I'm your personal virtual companion. How can I help you?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = () => {
    if (inputValue.trim() === '') return;

    /* user prompt */
    const userMessage = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages([...messages, userMessage]);
    setInputValue('');

    setIsTyping(true);

    /* bot response */
    setTimeout(() => {
      const botMessage = {
        id: messages.length + 2,
        text: "I'm here to help! This is a demo response.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="chatbot-page" data-testid="chatbot-page">
      <div className="chatbot-container" data-testid="chatbot-container">
        <div className="chatbot-header-title" data-testid="chatbot-header-title">
          <h1>HealUp Assistant</h1>
        </div>

        <div className="chatbot-messages-area" data-testid="chatbot-messages-area">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message-wrapper ${message.sender === 'user' ? 'user-wrapper' : 'bot-wrapper'}`}
              data-testid={`message-${message.sender}-${message.id}`}
            >
              <div className={`chatbot-message ${message.sender}-message`}>
                {message.sender === 'bot' && (
                  <div className="message-icon" data-testid="bot-icon">
                    <svg 
                      width="20" 
                      height="20" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                  </div>
                )}
                <p>{message.text}</p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="message-wrapper bot-wrapper" data-testid="typing-indicator">
              <div className="chatbot-message bot-message typing-indicator">
                <div className="message-icon">
                  <svg 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                </div>
                <div className="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="chatbot-input-area" data-testid="chatbot-input-area">
          <input
            type="text"
            className="chatbot-input"
            placeholder="Type Here....."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            data-testid="chatbot-input"
          />
          <button 
            className="chatbot-send" 
            onClick={handleSend}
            data-testid="chatbot-send-button"
          >
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
