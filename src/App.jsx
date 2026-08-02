import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import ProductShowcase from './components/ProductShowcase';
import FeedingGuidelines from './components/FeedingGuidelines';
import ImpactSection from './components/ImpactSection';
import Footer from './components/Footer';
import ChatWindow from './components/ChatWindow';

import Donate from './pages/Donate';
import Cart from './pages/Cart';

import './App.css';

const Home = () => (
  <div className="app-wrapper">
    <Header />
    <section id="home"><Hero /></section>
    <section id="about"><Features /></section>
    <section id="products"><ProductShowcase /></section>
    <FeedingGuidelines />
    <section id="initiative"><ImpactSection /></section>
    <div id="contact"><Footer /></div>
  </div>
);

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/donate" element={<Donate />} />
        <Route path="/cart" element={<Cart />} />
      </Routes>

      {/* Aesthetic Floating Chat Launcher */}
      <div className="chat-launcher-container">
        {isChatOpen && (
          <div className="chat-window-wrapper">
            <ChatWindow onClose={() => setIsChatOpen(false)} />
          </div>
        )}

        <div className="launcher-button-wrapper">
          {!isChatOpen && <span className="launcher-ambient-glow" />}

          <button 
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`aesthetic-icon-btn ${isChatOpen ? 'is-active' : ''}`}
            aria-label="Toggle Equine AI Assistant"
          >
            {isChatOpen ? (
              /* Outlined Linear Close Icon */
              <svg className="outlined-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            ) : (
              /* Outlined Linear AI Sparkle / Chat Icon */
              <div className="icon-badge-stack">
                <svg className="outlined-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <span className="live-status-dot" />
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;