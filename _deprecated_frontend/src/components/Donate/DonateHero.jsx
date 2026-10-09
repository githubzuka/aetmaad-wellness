import React from 'react';
import './DonateHero.css';

const DonateHero = () => {
  return (
    <section className="donate-hero">
      {/* Background Media with Soft Blend */}
      <div className="hero-media-wrapper">
        <img 
          src="/images/impact.png" 
          alt="Working Horse and Caregiver" 
          className="hero-media-image"
        />
        <div className="hero-media-fade"></div>
      </div>

      {/* Main Container */}
      <div className="hero-main-container">
        <div className="hero-text-block">
          
          {/* Breadcrumb Navigation */}
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <a href="/">Home</a>
            <span className="crumb-sep">&gt;</span>
            <a href="/#initiative">Working Horses Initiative</a>
            <span className="crumb-sep">&gt;</span>
            <span className="crumb-active">Donate</span>
          </nav>

          {/* Title on 3 lines */}
          <h1 className="hero-title">
            Help a Working<br />
            Horse<br />
            Live a <span className="highlight-green">Better Life</span>
          </h1>

          {/* Description */}
          <p className="hero-description">
            Your donation helps provide nutrition, medical care, rescue,<br className="desktop-only" /> 
            shelter and clean water to working horses in need.<br className="desktop-only" />
            Together, we can build a healthier and happier future<br className="desktop-only" /> 
            for these silent heroes.
          </p>

          {/* Feature Icons Row */}
          <div className="hero-features">
            <div className="feature-item">
              <div className="feature-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1C4D2E" strokeWidth="1.8">
                  <path d="M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9z" />
                  <path d="M7 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" />
                  <path d="M12 7a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" />
                  <path d="M17 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" />
                </svg>
              </div>
              <span className="feature-label">Nutrition<br />Support</span>
            </div>

            <div className="feature-divider"></div>

            <div className="feature-item">
              <div className="feature-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1C4D2E" strokeWidth="1.8">
                  <rect x="3" y="3" width="18" height="18" rx="4" />
                  <path d="M12 8v8M8 12h8" />
                </svg>
              </div>
              <span className="feature-label">Medical<br />Care</span>
            </div>

            <div className="feature-divider"></div>

            <div className="feature-item">
              <div className="feature-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1C4D2E" strokeWidth="1.8">
                  <path d="M3 10l9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V10z" />
                  <path d="M9 21V12h6v9" />
                </svg>
              </div>
              <span className="feature-label">Rescue &<br />Shelter</span>
            </div>

            <div className="feature-divider"></div>

            <div className="feature-item">
              <div className="feature-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1C4D2E" strokeWidth="1.8">
                  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                </svg>
              </div>
              <span className="feature-label">Clean Water<br />& Hygiene</span>
            </div>
          </div>

        </div>
      </div>

      {/* Floating Bottom-Right Quote Card */}
      <div className="floating-quote-card">
        <div className="card-heart-icon">
          <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#1C4D2E" strokeWidth="1.6">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </div>
        <h4 className="card-heading">Every act of kindness<br />makes a difference.</h4>
        <p className="card-subtext">Your support brings hope,<br />healing and happiness.</p>
      </div>

    </section>
  );
};

export default DonateHero;