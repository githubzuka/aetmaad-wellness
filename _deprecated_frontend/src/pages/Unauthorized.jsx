import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import './Unauthorized.css';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="unauthorized-page-container">
      <div className="unauthorized-card">
        <div className="unauthorized-badge-icon">
          <ShieldAlert size={48} />
        </div>
        
        <span className="unauthorized-code">403 FORBIDDEN</span>
        <h2>Access Restricted</h2>
        
        <p className="unauthorized-message">
          You do not have the required role or permissions to access this administrative portal or dashboard.
        </p>

        <div className="unauthorized-actions">
          <button className="btn-go-back" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} />
            Go Back
          </button>
          
          <Link to="/" className="btn-go-home">
            <Home size={18} />
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
