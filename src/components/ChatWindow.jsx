import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './ChatWindow.css';

const QUICK_ACTIONS = [
  { label: 'Feed Overview', icon: 'bi-leaf-fill' },
  { label: 'Ingredients', icon: 'bi-flower1' },
  { label: 'Feeding Guide', icon: 'bi-journal-check' },
  { label: 'Working Horses', icon: 'bi-heart-fill' },
];

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
const stripEmoji = (content) => content.replace(/[\p{Extended_Pictographic}\uFE0F]/gu, '').replace(/  +/g, ' ');

const getLocalReply = (question) => {
  const normalizedQuestion = question.toLowerCase();

  if (normalizedQuestion.includes('feed') || normalizedQuestion.includes('dosage') || normalizedQuestion.includes('how much')) {
    return '### Daily Feeding Guide\n\n- **Light work:** 1.5-2.0 kg per day\n- **Moderate work:** 2.5-3.5 kg per day\n- **Heavy or performance work:** 4.0-5.0 kg per day\n\nSplit the daily amount across meals and adjust with your veterinarian based on body condition.';
  }

  if (normalizedQuestion.includes('ingredient')) {
    return '### Ingredients\n\n- Whole grains\n- Essential amino acids\n- Cold-pressed oils\n- Natural digestive enzymes\n- Trace minerals\n\nThe mix contains no fillers or artificial preservatives.';
  }

  if (normalizedQuestion.includes('product') || normalizedQuestion.includes('mix') || normalizedQuestion.includes('buy') || normalizedQuestion.includes('order')) {
    return '### ASHVA Nutrition Mix\n\nASHVA Equine Nutrition Mix supports working and active horses with grains, amino acids, cold-pressed oils, digestive enzymes, and trace minerals. Open the Products Catalog to review the product, add it to your cart, and place an order.';
  }

  if (normalizedQuestion.includes('event') || normalizedQuestion.includes('upcoming')) {
    return '### Upcoming Events\n\nApproved ASHVA welfare drives, community gatherings, and working-horse initiatives appear in the Upcoming Events section. You can see the date, time, city, location, description, and host details there.';
  }

  if (normalizedQuestion.includes('volunteer') || normalizedQuestion.includes('apply')) {
    return '### Volunteer Application\n\nYou can apply directly through the Volunteer section without creating a customer account. The admin team reviews the application. Approved volunteers receive access to their dashboard and event notifications.';
  }

  if (normalizedQuestion.includes('donat') || normalizedQuestion.includes('impact') || normalizedQuestion.includes('rescue')) {
    return '### ASHVA Impact\n\nASHVA supports nutrition, rescue, medical care, and community distribution for working horses. Visit the Donate or Working Horses Initiative page to learn more and contribute.';
  }

  if (normalizedQuestion.includes('horse') || normalizedQuestion.includes('working')) {
    return '### Working Horse Initiative\n\nA percentage of every purchase supports rescue, feeding, and medical care for street and working horses.';
  }

  return 'I can help with **products, ingredients, feeding amounts, digestive support, horse care, upcoming events, volunteer applications, donations, orders, and the Working Horses Initiative**. Ask a specific question for a detailed answer.';
};

const ChatWindow = ({ onClose }) => {
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: 'Welcome to **ASHVA Wellness**.\n\nI am your Equine Nutrition Specialist. Select a topic below or ask any question regarding dosage, ingredients, and feed routines.' 
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
      const res = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await res.json();
      if (res.ok && data.reply) {
        const replyContent = data.reply.content || data.reply;
        setMessages((prev) => [...prev, { role: 'assistant', content: stripEmoji(replyContent) }]);
      } else {
        throw new Error('Server response failed');
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: stripEmoji(getLocalReply(text)) }
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
                  <h3>ASHVA AI</h3>
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
      <div className="aetmaad-chat-body" aria-live="polite">
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
          aria-label="Ask the equine nutrition specialist"
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || !input.trim()} className="send-btn">
          <i className="bi bi-send-fill"></i>
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;