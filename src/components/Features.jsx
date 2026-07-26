// src/components/Features.jsx
import React from 'react';
import './Features.css';

const Features = () => {
  const whyChooseList = [
    { 
      id: 1, 
      label: '100% Natural Ingredients',
      svg: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" />
          <path d="M9 12L11 14L15 10" />
        </svg>
      )
    },
    { 
      id: 2, 
      label: 'Energy & Endurance',
      svg: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      )
    },
    { 
      id: 3, 
      label: 'Better Immunity',
      svg: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      )
    },
    { 
      id: 4, 
      label: 'Healthy Hooves',
      svg: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 4C6 4 4 8 4 12C4 16.42 7.58 20 12 20C16.42 20 20 16.42 20 12C20 8 18 4 18 4" />
          <path d="M9 7C9 7 8 9 8 11" />
          <path d="M15 7C15 7 16 9 16 11" />
        </svg>
      )
    },
    { 
      id: 5, 
      label: 'Shiny Coat',
      svg: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707.707M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
        </svg>
      )
    },
    { 
      id: 6, 
      label: 'Better Digestion',
      svg: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4.5 16.5c-1.5-1.5-2.5-3.5-2.5-6a8 8 0 0 1 16 0c0 2.5-1 4.5-2.5 6" />
          <path d="M12 11v9M9 17l3 3 3-3" />
        </svg>
      )
    },
    { 
      id: 7, 
      label: 'Muscle Strength',
      svg: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h2" />
          <path d="M18 18h2a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2h-2" />
          <path d="M6 7h12v10H6z" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      )
    },
    { 
      id: 8, 
      label: 'Performance Support',
      svg: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
          <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
          <path d="M4 22h16" />
          <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34" />
          <path d="M12 2a4 4 0 0 1 4 4v5H8V6a4 4 0 0 1 4-4z" />
        </svg>
      )
    },
  ];

  return (
    <section className="why-choose-section">
      <div className="why-choose-container">
        
        {/* Aesthetic Clean Header */}
        <div className="why-choose-header">
          <div className="header-divider-wrapper">
            <span className="line-left"></span>
            <span className="header-title-text">Why Choose Aetmaad Wellness</span>
            <span className="line-right"></span>
          </div>
        </div>

        {/* 8-Column Row */}
        <div className="why-choose-grid">
          {whyChooseList.map((item) => (
            <div className="why-choose-card" key={item.id}>
              <div className="card-icon-box">
                {item.svg}
              </div>
              <p className="card-label-text">{item.label}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Features;