import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Hero.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const Hero = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleBuyNowClick = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/cart' } });
    } else {
      navigate('/cart');
    }
  };

  const handleDonateClick = () => {
    navigate('/donate');
  };

  const handleVolunteerClick = () => {
    navigate('/volunteer', { state: { mode: 'apply' } });
  };

  return (
    <section id="home" className="hero-section">
      <div className="hero-container">
        
        <div className="hero-content">
          <h1 className="hero-title">
            Premium Equine <br />
            Nutrition Mix for <br />
            <span className="hero-highlight">Healthy, Strong & <br />High-Performance <br />Horses</span>
          </h1>
          
          <p className="hero-description">
            Natural daily nutritional support specially formulated to improve stamina, 
            digestion, immunity, hoof strength, coat health, and overall well-being of 
            working and performance horses.
          </p>
          
          <div className="hero-actions">
            <button className="btn-buy-now" onClick={handleBuyNowClick}>
              Buy Now 
              <i className="bi bi-cart3 btn-icon"></i>
            </button>
            
            <button className="btn-donate-help" onClick={handleDonateClick}>
              Donate to Help a Horse 
              <i className="bi bi-heart-fill btn-icon"></i>
            </button>

          </div>

          <div className="hero-volunteer-callout">
            <div className="hero-volunteer-icon" aria-hidden="true">
              <i className="bi bi-people"></i>
            </div>
            <div className="hero-volunteer-copy">
              <span>COMMUNITY VOLUNTEER PROGRAM</span>
              <h2>Want to help working horses in your area?</h2>
              <p>Join local care efforts, coordinate support, and make a practical difference in your city.</p>
            </div>
            <button className="btn-volunteer-hero" onClick={handleVolunteerClick} aria-label="Apply to become a volunteer">
              Apply Now
              <i className="bi bi-arrow-up-right btn-icon"></i>
            </button>
          </div>
          
          <div className="hero-trust-badges">
            <span className="trust-label">Trusted by</span>
            
            <div className="badge-item">
              <i className="bi bi-person-badge badge-icon"></i>
              <span className="badge-text">Horse Owners</span>
            </div>
            
            <div className="badge-item">
              <i className="bi bi-bank badge-icon"></i>
              <span className="badge-text">Farms</span>
            </div>
            
            <div className="badge-item">
              <i className="bi bi-mortarboard badge-icon"></i>
              <span className="badge-text">Riding Schools</span>
            </div>
            
            <div className="badge-item">
              <i className="bi bi-patch-check badge-icon"></i>
              <span className="badge-text">Veterinary Experts</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Hero;