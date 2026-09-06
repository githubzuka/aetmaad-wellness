import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Phone, MapPin, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';
import './Login.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    contactNumber: '',
    city: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const fromPath = location.state?.from || '/';

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/');
  };

  const handleInputChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await register({
        ...formData,
        role: 'customer',
      });
      navigate(fromPath, { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your information.');
    } finally {
      setLoading(false);
    }
  };

  const accountAlreadyExists = error?.toLowerCase().includes('already exists');

  return (
    <div className="auth-page-container">
      <div className="auth-card-wrapper">
        <button type="button" className="auth-back-link" onClick={handleBack}>
          <ArrowLeft size={15} />
          Back
        </button>
        <div className="auth-card-header">
          <Link to="/" className="auth-brand-logo">
            <span className="brand-ashva">ASHVA</span>
            <span className="brand-sub">Wellness Store</span>
          </Link>
          <h2>Create Customer Account</h2>
          <p className="auth-subtitle">Register to order equine nutrition mixes and track your deliveries.</p>
        </div>

        {error && (
          <div className="auth-alert error">
            <AlertCircle size={18} />
            <div>
              <span>{error}</span>
              {accountAlreadyExists && (
                <Link to="/login" state={{ from: fromPath }} className="auth-alert-action">
                  Sign In Instead
                </Link>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Full Name</label>
            <div className="input-with-icon">
              <User size={18} className="input-icon" />
              <input
                type="text"
                name="name"
                placeholder="e.g. Vikram Singh"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                name="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                name="password"
                placeholder="Create a secure password"
                value={formData.password}
                onChange={handleInputChange}
                minLength={6}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Contact Number</label>
            <div className="input-with-icon">
              <Phone size={18} className="input-icon" />
              <input
                type="tel"
                name="contactNumber"
                placeholder="+91 98765 43210"
                value={formData.contactNumber}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>City / Zone</label>
            <div className="input-with-icon">
              <MapPin size={18} className="input-icon" />
              <input
                type="text"
                name="city"
                placeholder="e.g. Mumbai / Pune"
                value={formData.city}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Creating Account...' : (
              <>
                Register Account
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="auth-card-footer">
          <p>
            Already registered?{' '}
            <Link to="/login" state={{ from: fromPath }} className="link-switch">
              Sign In Here
            </Link>
          </p>
          <p className="auth-admin-link-row">
            Managing the platform?{' '}
            <Link to="/admin" className="link-switch">Admin Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
