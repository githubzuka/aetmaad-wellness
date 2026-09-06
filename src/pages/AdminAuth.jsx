import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, Mail, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import './AdminAuth.css';

const AdminAuth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // If already logged in as admin, redirect to admin dashboard
  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.user.role !== 'admin') {
        setError('Access denied. This portal is restricted to Administrator credentials.');
        return;
      }
      setSuccess('Admin credentials verified. Redirecting to Management Console...');
      setTimeout(() => {
        navigate('/admin/dashboard', { replace: true });
      }, 1000);
    } catch (err) {
      setError(err.message || 'Invalid administrator email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-auth-page">
      <div className="admin-auth-card">
        
        <div className="admin-badge">
          <Shield size={32} />
        </div>

        <div className="admin-auth-header">
          <span className="secret-tag">SECURE SYSTEM GATEWAY</span>
          <h2>Admin Portal Access</h2>
          <p>Enter master administrator credentials to access platform management console.</p>
        </div>

        {error && (
          <div className="admin-alert error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="admin-alert success">
            <CheckCircle2 size={18} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-auth-form">
          <div className="form-group">
            <label>Admin Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                placeholder="admin@aetmaad.com"
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
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-admin-login" disabled={loading}>
            {loading ? 'Authenticating...' : (
              <>
                Authenticate & Enter Console
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="admin-auth-footer">
          <Link to="/">← Back to ASHVA Wellness Public Site</Link>
        </div>

      </div>
    </div>
  );
};

export default AdminAuth;
