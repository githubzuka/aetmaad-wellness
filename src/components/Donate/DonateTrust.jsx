import React, { useState } from 'react';
import './DonateTrust.css';

const DonateTrustAndFAQ = ({ selectedAmount, onSelectAmount, onDonateClick }) => {
  const [showAlertModal, setShowAlertModal] = useState(false);

  const breakdownData = [
    {
      amount: '500',
      displayAmount: '₹500',
      title: 'Emergency Nutrition',
      description: 'Provides 1 week of high-energy feed, clean water, and supplements for a rescued equine.',
    },
    {
      amount: '1500',
      displayAmount: '₹1,500',
      title: 'Veterinary Medical Kit',
      description: 'Covers essential wound dressings, antibiotics, vaccines, and pain relief medication.',
    },
    {
      amount: '5000',
      displayAmount: '₹5,000',
      title: 'Full Rescue & Rehabilitation',
      description: 'Funds comprehensive medical care, shelter, and full rehabilitation for an injured working horse.',
    },
  ];

  const handleDonateNow = (e) => {
    e.preventDefault(); // Prevents default browser form behavior
    
    // Check if no amount is selected or if amount is 0
    if (!selectedAmount || Number(selectedAmount) <= 0) {
      setShowAlertModal(true);
      return;
    }

    if (onDonateClick) {
      onDonateClick();
    }
  };

  const handleTierClick = (amount) => {
    if (onSelectAmount) {
      onSelectAmount(amount);
    }
    setShowAlertModal(false);
  };

  return (
    <section className="donate-extra-section">
      {/* --- CUSTOM LUXURY ALERT MODAL --- */}
      {showAlertModal && (
        <div className="custom-alert-overlay" onClick={() => setShowAlertModal(false)}>
          <div className="custom-alert-card" onClick={(e) => e.stopPropagation()}>
            <div className="custom-alert-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3>Amount Required</h3>
            <p>Please select a contribution tier below or enter a custom amount before clicking <strong>Donate Now</strong>.</p>
            <button 
              className="custom-alert-dismiss-btn"
              onClick={() => setShowAlertModal(false)}
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* --- TAX & TRANSPARENCY BANNER --- */}
      <div className="donate-transparency-banner">
        <div className="transparency-card">
          <div className="transparency-icon">🛡️</div>
          <div className="transparency-content">
            <h3>100% Secure & Tax Deductible</h3>
            <p>
              Your contributions are tax-exempt under <strong>Section 80G</strong>. 
              We maintain full financial transparency with audited annual reports.
            </p>
          </div>
        </div>
      </div>

      {/* --- WHERE YOUR MONEY GOES --- */}
      <div className="donate-breakdown-container">
        <div className="section-header">
          <h2>Where Your Money Goes</h2>
          <p>Every rupee directly impacts animal welfare and community healthcare.</p>
        </div>

        <div className="breakdown-grid">
          {breakdownData.map((item, idx) => (
            <div 
              key={idx} 
              className={`breakdown-card ${selectedAmount === item.amount ? 'selected' : ''}`}
              onClick={() => handleTierClick(item.amount)}
            >
              <div className="breakdown-amount">{item.displayAmount}</div>
              <h4>{item.title}</h4>
              <p>{item.description}</p>
            </div>
          ))}
        </div>

        <div className="donate-action-wrapper">
          <button className="donate-now-main-btn" onClick={handleDonateNow}>
            Donate Now →
          </button>
        </div>
      </div>
    </section>
  );
};

export default DonateTrustAndFAQ;