import React, { useState } from 'react';
import './DonateImpact.css';
import DonateModal from './DonateModal';

const impactOptions = [
  {
    id: 'opt1',
    amount: 500,
    title: 'Feed One Horse for a Week',
    description: 'Provides daily nutritious feed to keep a horse healthy and energetic.',
    iconSvg: (
      <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#2D2D2D" strokeWidth="1.5">
        <path d="M6 10a4 4 0 0 1 8 0v2H6v-2z" />
        <path d="M4 12h12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7z" />
      </svg>
    ),
  },
  {
    id: 'opt2',
    amount: 1000,
    title: 'Nutrition Support',
    description: 'Helps provide essential supplements and balanced nutrition for a month.',
    iconSvg: (
      <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#2D2D2D" strokeWidth="1.5">
        <path d="M12 17a7 7 0 0 0 7-7H5a7 7 0 0 0 7 7z" />
      </svg>
    ),
  },
  {
    id: 'opt3',
    amount: 2500,
    title: 'Medical Care',
    description: 'Supports veterinary check-ups, medicines and treatment for sick or injured horses.',
    iconSvg: (
      <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#2D2D2D" strokeWidth="1.5">
        <rect x="3" y="6" width="18" height="13" rx="2" />
        <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
      </svg>
    ),
  },
  {
    id: 'opt4',
    amount: 5000,
    title: 'Rescue Kit',
    description: 'Helps in rescuing, transporting and rehabilitating horses in critical conditions.',
    iconSvg: (
      <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#2D2D2D" strokeWidth="1.5">
        <rect x="1" y="6" width="15" height="10" rx="1" />
        <circle cx="5.5" cy="17.5" r="2.5" />
        <circle cx="18.5" cy="17.5" r="2.5" />
      </svg>
    ),
  },
];

const impactStats = [
  { value: '258', label: 'Working Horses Helped' },
  { value: '18,500', label: 'Meals Provided' },
  { value: '640', label: 'Generous Donors' },
  { value: '22', label: 'Villages Covered' },
];

const DonateImpact = () => {
  const [selectedAmount, setSelectedAmount] = useState(1000);
  const [isCustom, setIsCustom] = useState(false);
  const [customValue, setCustomValue] = useState('');
  const [isMonthly, setIsMonthly] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSelectOption = (amount) => {
    setSelectedAmount(amount);
    setIsCustom(false);
  };

  const handleCustomFocus = () => {
    setIsCustom(true);
  };

  const handleCustomChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setCustomValue(val);
  };

  const handleDonateNow = () => {
    const finalAmount = isCustom ? Number(customValue) || 0 : selectedAmount;
    if (finalAmount <= 0) {
      alert('Please enter a valid donation amount.');
      return;
    }
    setIsModalOpen(true);
  };

  const getEffectiveAmount = () => {
    return isCustom ? Number(customValue) || 0 : selectedAmount;
  };

  return (
    <section className="donateimpact-section">
      <div className="donateimpact-container">
        <div className="donateimpact-header">
          <div className="donateimpact-title-wrapper">
            <span className="donateimpact-line"></span>
            <h2 className="donateimpact-title">Choose Your Impact</h2>
            <span className="donateimpact-line"></span>
          </div>
          <p className="donateimpact-subtitle">Select an amount to support working horses</p>
        </div>

        {/* Options Grid */}
        <div className="donateimpact-grid">
          {impactOptions.map((opt) => {
            const isSelected = !isCustom && selectedAmount === opt.amount;
            return (
              <div
                key={opt.id}
                className={`donateimpact-card ${isSelected ? 'selected' : ''}`}
                onClick={() => handleSelectOption(opt.amount)}
              >
                <div className="donateimpact-icon-circle">{opt.iconSvg}</div>
                <div className="donateimpact-amount">₹{opt.amount.toLocaleString('en-IN')}</div>
                <h3 className="donateimpact-card-title">{opt.title}</h3>
                <p className="donateimpact-card-desc">{opt.description}</p>
              </div>
            );
          })}

          {/* Custom Amount Card */}
          <div
            className={`donateimpact-card donateimpact-custom-card ${isCustom ? 'selected' : ''}`}
            onClick={handleCustomFocus}
          >
            <div className="donateimpact-custom-icon">
              <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#2D2D2D" strokeWidth="1.5">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
            <h3 className="donateimpact-card-title">Custom Amount</h3>
            <p className="donateimpact-card-desc">Give as per your choice</p>

            <div className="donateimpact-input-wrapper">
              <span className="donateimpact-currency">₹</span>
              <input
                type="text"
                placeholder="Enter Amount"
                value={customValue}
                onFocus={handleCustomFocus}
                onChange={handleCustomChange}
                className="donateimpact-input"
              />
            </div>
          </div>
        </div>

        {/* Actions Section */}
        <div className="donateimpact-actions">
          <label className="donateimpact-checkbox-label">
            <input
              type="checkbox"
              checked={isMonthly}
              onChange={(e) => setIsMonthly(e.target.checked)}
              className="donateimpact-checkbox"
            />
            <span className="donateimpact-checkbox-text">Make this a monthly donation</span>
          </label>

          <button className="donateimpact-submit-btn" onClick={handleDonateNow}>
            Donate Now
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>

          <div className="donateimpact-security-info">
            <span>🔒 Secure Donation</span>
            <span className="donateimpact-dot">|</span>
            <span>100% Transparent</span>
          </div>
        </div>

        {/* Impact in Numbers */}
        <div className="donateimpact-stats-card">
          <div className="donateimpact-header">
            <div className="donateimpact-title-wrapper">
              <span className="donateimpact-line"></span>
              <h2 className="donateimpact-title">Your Impact in Numbers</h2>
              <span className="donateimpact-line"></span>
            </div>
            <p className="donateimpact-subtitle">Together, we are creating a stronger tomorrow for working horses.</p>
          </div>

          <div className="donateimpact-stats-grid">
            {impactStats.map((stat, idx) => (
              <React.Fragment key={idx}>
                <div className="donateimpact-stat-item">
                  <div className="donateimpact-stat-content">
                    <div className="donateimpact-stat-number">{stat.value}</div>
                    <div className="donateimpact-stat-label">{stat.label}</div>
                  </div>
                </div>
                {idx < impactStats.length - 1 && <div className="donateimpact-stat-divider" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Donation Modal Form */}
      <DonateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedAmount={getEffectiveAmount()}
        isMonthly={isMonthly}
      />
    </section>
  );
};

export default DonateImpact;