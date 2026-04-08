import React, { useState } from 'react';
import '../styles/ChatboxButton.css';
const BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

const ChatboxButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! How can I help you today?" }
  ]);

  const [input, setInput] = useState("");

  const toggleChatbox = () => {
    setIsOpen(!isOpen);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };

    setMessages((prev) => [...prev, userMessage]);

    const messageToSend = input;
    setInput("");

    try {
      const response = await fetch(`${BASE_URL}/api/chatbot`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: messageToSend })
      });

      const data = await response.json();

      const botMessage = {
        sender: "bot",
        text: data.reply
      };

      setMessages((prev) => [...prev, botMessage]);

    } catch (error) {

      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Sorry. Something went wrong." }
      ]);

    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
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
            <h3>HealUp Assistant</h3>
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
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`chatbox-message ${
                    msg.sender === "bot" ? "bot-message" : "user-message"
                  }`}
                >
                  <p>{msg.text}</p>
                </div>
              ))}
            </div>
            <div className="chatbox-input-area">
              <input 
                type="text" 
                placeholder="Type your message..."
                className="chatbox-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                data-testid="chatbox-input"
              />
              <button
                className="chatbox-send"
                onClick={sendMessage}
                data-testid="chatbox-send-btn"
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
      )}
    </>
  );
};

export default ChatboxButton;
