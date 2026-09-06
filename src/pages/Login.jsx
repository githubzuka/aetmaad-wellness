import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ArrowRight, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve intended redirect path (e.g., '/cart' or checkout)
  const fromPath = location.state?.from || '/';

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const res = await login(email, password);
      setSuccess('Sign in successful!');

      setTimeout(() => {
        if (res.user.role === 'admin') {
          navigate('/admin/dashboard', { replace: true });
        } else if (res.user.role === 'volunteer') {
          if (res.user.status === 'approved') {
            navigate('/volunteer/dashboard', { replace: true });
          } else {
            navigate('/volunteer', { replace: true });
          }
        } else {
          // Standard Customer redirect to intended page (e.g. checkout) or home
          navigate(fromPath, { replace: true });
        }
      }, 800);
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const needsAccount = error?.toLowerCase().includes('no account found');

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
            <span className="brand-sub">Wellness Portal</span>
          </Link>
          <h2>Customer Sign In</h2>
          <p className="auth-subtitle">Sign in to your account to complete checkout and manage orders.</p>
        </div>

        {error && (
          <div className="auth-alert error">
            <AlertCircle size={18} />
            <div>
              <span>{error}</span>
              {needsAccount && (
                <Link to="/signup" state={{ from: fromPath }} className="auth-alert-action">
                  Create Account
                </Link>
              )}
            </div>
          </div>
        )}

        {success && (
          <div className="auth-alert success">
            <CheckCircle2 size={18} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Signing In...' : (
              <>
                Sign In
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="auth-card-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/signup" state={{ from: fromPath }} className="link-switch">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
