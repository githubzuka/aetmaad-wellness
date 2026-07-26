// src/components/FeedingGuidelines.jsx
import React from 'react';
import './FeedingGuidelines.css';

const FeedingGuidelines = () => {
  const guidelines = [
    {
      phase: "Light Work / Maintenance",
      description: "For horses in rest, trail riding, or light training schedules.",
      dosages: [
        { weight: "300 kg (Light)", amount: "150g - 200g", frequency: "Split into 2 meals" },
        { weight: "400 kg (Medium)", amount: "200g - 250g", frequency: "Split into 2 meals" },
        { weight: "500 kg (Standard)", amount: "250g - 300g", frequency: "Split into 2 meals" },
        { weight: "600 kg+ (Heavy)", amount: "300g - 350g", frequency: "Split into 2 meals" }
      ]
    },
    {
      phase: "Moderate to Heavy Performance",
      description: "For horses in active competition, heavy training, or intense work.",
      dosages: [
        { weight: "300 kg (Light)", amount: "250g - 300g", frequency: "Split into 2-3 meals" },
        { weight: "400 kg (Medium)", amount: "300g - 400g", frequency: "Split into 2-3 meals" },
        { weight: "500 kg (Standard)", amount: "400g - 500g", frequency: "Split into 2-3 meals" },
        { weight: "600 kg+ (Heavy)", amount: "500g - 600g", frequency: "Split into 2-3 meals" }
      ]
    }
  ];

  return (
    <section className="feeding-section">
      <div className="feeding-container">
        
        {/* Aesthetic Header */}
        <div className="feeding-header">
          <div className="header-divider-wrapper">
            <span className="line-left"></span>
            <h2 className="header-title-text">Feeding Guidelines</h2>
            <span className="line-right"></span>
          </div>
          <p className="feeding-subtitle">
            Optimized daily intake tailored specifically to your horse's activity level and weight.
          </p>
        </div>

        {/* High-End Split Layout Grid */}
        <div className="feeding-split-grid">
          {guidelines.map((group, groupIdx) => (
            <div className="feeding-panel-card" key={groupIdx}>
              <div className="panel-header">
                <span className="panel-badge">
                  {groupIdx === 0 ? "Maintenance" : "Performance"}
                </span>
                <h3 className="panel-title">{group.phase}</h3>
                <p className="panel-desc">{group.description}</p>
              </div>
              
              <div className="panel-rows-container">
                {group.dosages.map((row, rowIdx) => (
                  <div className="dosage-metric-row" key={rowIdx}>
                    <div className="metric-info">
                      <span className="metric-weight">{row.weight}</span>
                      <span className="metric-frequency">{row.frequency}</span>
                    </div>
                    <div className="metric-badge-amount">
                      {row.amount} <span className="per-day">/ day</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Minimalist Advisory Note */}
        <div className="advisory-panel">
          <div className="advisory-accent-dot"></div>
          <p className="advisory-message">
            <strong>Important:</strong> Always introduce new wellness supplements gradually over a period of 7–10 days. Ensure consistent access to clean, fresh water.
          </p>
        </div>

      </div>
    </section>
  );
};

export default FeedingGuidelines;