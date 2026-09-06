import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HeartHandshake, Lock, Mail, User, Phone, MapPin, ArrowRight, ArrowLeft, AlertCircle, CheckCircle2, Clock, FileText, AlertTriangle } from 'lucide-react';
import './VolunteerAuth.css';

const VolunteerAuth = () => {
  const location = useLocation();
  const [isRegisterMode, setIsRegisterMode] = useState(location.state?.mode === 'apply');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    contactNumber: '',
    city: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const { login, register, isAuthenticated, user, isVolunteerApproved, logout } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in and approved volunteer
  useEffect(() => {
    if (isAuthenticated && user?.role === 'volunteer' && user?.status === 'approved') {
      navigate('/volunteer/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleInputChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (isRegisterMode) {
        // Register Volunteer
        const res = await register({
          ...formData,
          role: 'volunteer',
        });
        setSuccessMsg('Volunteer application submitted! Pending Admin verification.');
      } else {
        // Sign In
        const res = await login(formData.email, formData.password);
        if (res.user.role !== 'volunteer' && res.user.role !== 'admin') {
          setError('Account is not registered as a Volunteer. Please apply below.');
          return;
        }
        if (res.user.status === 'approved') {
          navigate('/volunteer/dashboard', { replace: true });
        }
      }
    } catch (err) {
      setError(err.message || 'Volunteer authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  // If user is currently logged in as volunteer but status is 'pending' or 'rejected'
  if (isAuthenticated && user?.role === 'volunteer' && user?.status !== 'approved') {
    return (
      <div className="volunteer-auth-page">
        <div className="volunteer-pending-card">
          <div className="pending-icon-badge">
            <Clock size={40} />
          </div>
          <span className="pending-tag">STATUS: {user?.status?.toUpperCase()}</span>
          <h2>Application Pending Admin Approval</h2>
          <p>
            Thank you, <strong>{user?.name}</strong>! Your application for the <strong>{user?.city || 'Community'} Zone</strong> volunteer program is currently under review by our Admin desk.
          </p>
          <div className="pending-info-box">
            <p><FileText size={15} aria-hidden="true" /> <strong>Registered Email:</strong> {user?.email}</p>
            <p><Phone size={15} aria-hidden="true" /> <strong>Contact:</strong> {user?.contactNumber}</p>
            <p><MapPin size={15} aria-hidden="true" /> <strong>City/Zone:</strong> {user?.city}</p>
          </div>
          <p className="pending-note">
            Once approved, you will gain access to your Zone's shop management portal and bulk ordering desk.
          </p>
          <div className="pending-card-actions">
            <button className="btn-logout-pending" onClick={logout}>Sign Out / Switch Account</button>
            <Link to="/" className="btn-home-link">Return to Home</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="volunteer-auth-page">
      <div className="volunteer-auth-card">
        <Link to="/" className="auth-back-link">
          <ArrowLeft size={15} />
          Back to site
        </Link>

        <div className="volunteer-badge">
          <HeartHandshake size={32} />
        </div>

        <div className="volunteer-auth-header">
          <span className="volunteer-tag">COMMUNITY INITIATIVE PORTAL</span>
          <h2>{isRegisterMode ? 'Apply as a Volunteer' : 'Volunteer Sign In'}</h2>
          <p>
            {isRegisterMode 
              ? 'Join our working horses initiative to manage shops and distribution in your zone.'
              : 'Sign in to access your assigned city shops and place direct orders.'}
          </p>
        </div>

        {/* Mode Toggle Tabs */}
        <div className="mode-toggle-tabs">
          <button
            type="button"
            className={`mode-tab ${!isRegisterMode ? 'active' : ''}`}
            onClick={() => { setIsRegisterMode(false); setError(null); setSuccessMsg(null); }}
          >
            Volunteer Sign In
          </button>
          <button
            type="button"
            className={`mode-tab ${isRegisterMode ? 'active' : ''}`}
            onClick={() => { setIsRegisterMode(true); setError(null); setSuccessMsg(null); }}
          >
            Apply to be a Volunteer
          </button>
        </div>

        {error && (
          <div className="volunteer-alert error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="volunteer-alert success">
            <CheckCircle2 size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="volunteer-auth-form">

          {isRegisterMode && (
            <div className="form-group">
              <label>Full Name</label>
              <div className="input-with-icon">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Ramesh Kumar"
                  value={formData.name}
                  onChange={handleInputChange}
                  required={isRegisterMode}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                name="email"
                placeholder="volunteer@example.com"
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
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                minLength={6}
                required
              />
            </div>
          </div>

          {isRegisterMode && (
            <>
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
                    required={isRegisterMode}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Assigned City / Zone</label>
                <div className="input-with-icon">
                  <MapPin size={18} className="input-icon" />
                  <input
                    type="text"
                    name="city"
                    placeholder="e.g. Mumbai / Pune"
                    value={formData.city}
                    onChange={handleInputChange}
                    required={isRegisterMode}
                  />
                </div>
              </div>

              <div className="approval-notice-box">
                <p><AlertTriangle size={16} aria-hidden="true" /> Applications require Administrator verification before shop editing and ordering permissions are granted.</p>
              </div>
            </>
          )}

          <button type="submit" className="btn-volunteer-submit" disabled={loading}>
            {loading ? 'Processing...' : (
              <>
                {isRegisterMode ? 'Submit Volunteer Application' : 'Sign In to Volunteer Dashboard'}
                <ArrowRight size={18} />
              </>
            )}
          </button>

        </form>

        <div className="volunteer-auth-footer">
          <Link to="/">← Back to ASHVA Wellness Public Site</Link>
        </div>

      </div>
    </div>
  );
};

export default VolunteerAuth;
