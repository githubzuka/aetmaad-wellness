// src/components/ImpactSection.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ImpactSection.css';

const ImpactSection = () => {
  const navigate = useNavigate(); // Hook for programmatic navigation

  const handleDonateClick = () => {
    navigate('/donate'); // Navigates to the /donate page
  };

  const stats = [
    { number: "258", label: "Working Horses Helped" },
    { number: "18,500", label: "Meals Provided" },
    { number: "640", label: "Donors" },
    { number: "22", label: "Villages Covered" }
  ];

  return (
    <section className="impact-section">
      <div className="impact-container">
        
        {/* Main Hero Card */}
        <div className="impact-hero-card">
          {/* Solid Left Green Content Block */}
          <div className="impact-content-block">
            <span className="impact-sub-tag">MAKE AN IMPACT</span>
            <h2 className="impact-heading">
              Help a Working Horse Live a Better Life
            </h2>
            <p className="impact-text">
              Your support helps provide nutrition, medical care, rescue, shelter and clean water to working horses in need.
            </p>
            <button className="btn-donate-impact" onClick={handleDonateClick}>
              Donate Now <span className="heart-icon">♥</span>
            </button>
          </div>

          {/* Right Image Block with Feathered Left Edge */}
          <div className="impact-image-block">
            <img 
              src="/images/impact.png" 
              alt="Help a Working Horse" 
              className="impact-photo"
            />
          </div>
        </div>

        {/* 2x2 Stats Grid */}
        <div className="impact-stats-grid">
          {stats.map((stat, idx) => (
            <div className="stat-box" key={idx}>
              <h3 className="stat-number">{stat.number}</h3>
              <p className="stat-label">{stat.label}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default ImpactSection;