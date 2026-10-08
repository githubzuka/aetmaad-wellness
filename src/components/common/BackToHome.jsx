import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';
import './BackToHome.css';

/**
 * Small navigation bar with "Back to Home" (and a plain Back action).
 * Rendered at the top of every page so there is always a way home.
 *
 * variant="light" (default) for light pages, "dark" for dark/green surfaces.
 */
const BackToHome = ({ title, variant = 'light', showBack = true }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/');
  };

  return (
    <div className={`back-home-bar ${variant}`}>
      <div className="back-home-inner">
        {showBack && (
          <button type="button" className="back-home-btn ghost" onClick={handleBack}>
            <ArrowLeft size={15} />
            <span>Back</span>
          </button>
        )}

        {title && <span className="back-home-title">{title}</span>}

        <Link to="/" className="back-home-btn primary">
          <Home size={15} />
          <span>Back to Home</span>
        </Link>
      </div>
    </div>
  );
};

export default BackToHome;
