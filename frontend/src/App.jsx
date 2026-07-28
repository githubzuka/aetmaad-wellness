import React, { useState } from 'react';
import ChatWindow from './components/ChatWindow';
import { MessageSquare, X } from 'lucide-react';
import './App.css';

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="app-container">
      <main className="main-content">
        <h1>Welcome to Aetmaad Wellness</h1>
      </main>

      {/* Floating Chat Widget - Placed as direct child of app-container */}
      <div className="floating-chat-container">
        {isChatOpen && (
          <div className="chat-popup">
            <ChatWindow onClose={() => setIsChatOpen(false)} />
          </div>
        )}

        <button 
          className="chat-toggle-btn"
          onClick={() => setIsChatOpen(!isChatOpen)}
          aria-label="Toggle AI Assistant"
        >
          {isChatOpen ? <X size={24} /> : <MessageSquare size={24} />}
        </button>
      </div>
    </div>
  );
}

export default App;