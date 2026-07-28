import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './ChatWindow.css';

const QUICK_ACTIONS = [
  { label: 'Feed Overview', icon: 'bi-leaf-fill' },
  { label: 'Ingredients', icon: 'bi-flower1' },
  { label: 'Feeding Guide', icon: 'bi-journal-check' },
  { label: 'Working Horses', icon: 'bi-heart-fill' },
];

const ChatWindow = ({ onClose }) => {
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: 'Welcome to **Aetmaad Wellness**! 🐎\n\nI am your Equine Nutrition Specialist. Select a topic below or ask any question regarding dosage, ingredients, and feed routines.' 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim() || isLoading) return;

    const userMsg = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];

    setMessages(newMessages);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await res.json();
      if (res.ok && data.reply) {
        setMessages((prev) => [...prev, data.reply]);
      } else {
        throw new Error('Server response failed');
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '⚠️ **Connection Error**: Unable to reach backend server. Please verify port 5000 is active.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="aetmaad-chat-window">
      {/* Header */}
      <header className="aetmaad-chat-header">
        <div className="brand-profile">
          <div className="avatar-wrapper">
            <div className="brand-avatar-icon">
              <i className="bi bi-cpu-fill"></i>
            </div>
            <span className="online-indicator" />
          </div>
          <div className="brand-details">
            <div className="brand-title">
              <h3>Aetmaad AI</h3>
              <i className="bi bi-patch-check-fill verified-badge"></i>
            </div>
            <p className="brand-subtitle">Equine Nutrition Specialist</p>
          </div>
        </div>
        <button onClick={onClose} className="close-btn" aria-label="Close Assistant">
          <i className="bi bi-x-lg"></i>
        </button>
      </header>

      {/* Message Stream */}
      <div className="aetmaad-chat-body">
        {messages.map((msg, idx) => (
          <div key={idx} className={`chat-message ${msg.role}`}>
            <div className="message-avatar">
              {msg.role === 'user' ? (
                <i className="bi bi-person-fill"></i>
              ) : (
                <i className="bi bi-robot"></i>
              )}
            </div>
            <div className="message-bubble">
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="chat-message assistant">
            <div className="message-avatar">
              <i className="bi bi-robot"></i>
            </div>
            <div className="message-bubble typing">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Quick Action Chips */}
      <div className="aetmaad-quick-chips">
        <div className="chips-scroll">
          {QUICK_ACTIONS.map((action, i) => (
            <button
              key={i}
              className="chip-btn"
              onClick={() => handleSend(action.label)}
              disabled={isLoading}
            >
              <i className={`bi ${action.icon}`}></i>
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="aetmaad-chat-footer">
        <input
          type="text"
          placeholder="Ask about equine nutrition..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit" disabled={isLoading || !input.trim()} className="send-btn">
          <i className="bi bi-send-fill"></i>
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;