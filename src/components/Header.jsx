// src/components/Header/Header.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate(); // Hook for programmatic navigation

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleDonateClick = () => {
    closeMobileMenu();
    navigate('/donate'); 
  };

  const handleCartClick = () => {
    closeMobileMenu();
    navigate('/cart'); 
  };

  return (
    <header className="main-header">
      <div className="header-container">
        {/* Brand Logo - click home */}
        <Link to="/" className="logo-area" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="logo-title">AETMAAD</div>
          <div className="logo-subtitle">— WELLNESS —</div>
        </Link>

        {/* Mobile Hamburger Button */}
        <button
          className="mobile-toggle"
          onClick={toggleMobileMenu}
          aria-label="Toggle Navigation Menu"
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          )}
        </button>

        {/* Navigation Menu */}
        <nav className={`nav-menu ${isMobileMenuOpen ? 'open' : ''}`}>
          <a href="/#home" className="nav-item active" onClick={closeMobileMenu}>Home</a>
          <a href="/#about" className="nav-item" onClick={closeMobileMenu}>About Us</a>
          <div className="nav-item dropdown">
            <a href="/#products" onClick={closeMobileMenu}>Products</a>
            <span className="dropdown-arrow">▾</span>
          </div>
          <a href="/#initiative" className="nav-item" onClick={closeMobileMenu}>Working Horses Initiative</a>
          <a href="/#blog" className="nav-item" onClick={closeMobileMenu}>Blog</a>
          <a href="/#contact" className="nav-item" onClick={closeMobileMenu}>Contact</a>

          {/* Mobile Action Buttons */}
          <div className="header-actions mobile-only-actions">
            <button className="btn-buy">
              Buy Now 
              <svg className="btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
            </button>
            
            <button className="btn-donate" onClick={handleDonateClick}>
              Donate Now 
              <svg className="btn-icon" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </button>

            {/* Added Cart Button (Mobile) */}
            <button className="btn-cart" onClick={handleCartClick} aria-label="Shopping Cart">
              <span className="btn-cart-text">Cart</span>
              <div className="btn-cart-icon-wrapper">
                <svg className="btn-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
                <span className="cart-badge">0</span>
              </div>
            </button>
          </div>
        </nav>

        {/* Desktop Action Buttons */}
        <div className="header-actions desktop-only-actions">
          <button className="btn-buy">
            Buy Now 
            <svg className="btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
          </button>
          
          <button className="btn-donate" onClick={handleDonateClick}>
            Donate Now 
            <svg className="btn-icon" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </button>

          {/* Added Cart Button (Desktop) */}
          <button className="btn-cart" onClick={handleCartClick} aria-label="Shopping Cart">
            <span className="btn-cart-text">Cart</span>
            <div className="btn-cart-icon-wrapper">
              <svg className="btn-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              <span className="cart-badge">0</span>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;