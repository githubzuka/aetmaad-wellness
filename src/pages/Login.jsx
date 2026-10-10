import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Lock, Mail, ArrowRight, ArrowLeft, AlertCircle, CheckCircle2,
  Loader2, KeyRound, Home, ShieldAlert, Phone, MessageSquare, Send
} from 'lucide-react';
import authService from '../services/authService';
import './Login.css';

const MAX_ATTEMPTS = 5;

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Lockout state after repeated failed attempts
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [passwordLocked, setPasswordLocked] = useState(false);

  // Forgot-password panel state
  const [showForgot, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetNote, setResetNote] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState(null);
  const [resetSent, setResetSent] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve intended redirect path (e.g., '/cart' or checkout)
  const fromPath = location.state?.from || '/';

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/');
  };

  // When the email changes, ask the server how many recent failed attempts this
  // account has, so the lockout state is accurate across page reloads.
  useEffect(() => {
    const checkAttempts = async () => {
      if (!email || !email.includes('@')) return;
      try {
        const res = await authService.getLoginAttempts(email);
        const attempts = res?.data?.attempts || 0;
        setFailedAttempts(attempts);
        if (attempts >= MAX_ATTEMPTS) setPasswordLocked(true);
      } catch {
        /* non-critical: the lockout is still enforced server-side */
      }
    };
    const timer = setTimeout(checkAttempts, 600);
    return () => clearTimeout(timer);
  }, [email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passwordLocked) return;

    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      // No expectedRole: this single portal accepts customers, volunteers AND
      // administrators. Admins are sent straight to the console, so the /admin
      // route never has to be shared with end users.
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
      const message = err.message || 'Invalid email or password.';

      // Hard lockout, enforced server-side
      if (err.code === 'PASSWORD_LOCKED' || message.toLowerCase().includes('too many failed attempts')) {
        setPasswordLocked(true);
        setError(null);
        return;
      }

      // Role isolation error should not appear here since this portal accepts
      // every role, but keep the handling for safety.
      if (err.code === 'ROLE_MISMATCH') {
        setError(message);
        return;
      }

      // Track attempts so we can warn before the lockout takes effect
      const next = failedAttempts + 1;
      setFailedAttempts(next);
      if (next >= MAX_ATTEMPTS) {
        setPasswordLocked(true);
        setError(null);
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const needsAccount = error?.toLowerCase().includes('no account found');
  const attemptsLeft = Math.max(0, MAX_ATTEMPTS - failedAttempts);
  // Warn once the user is down to their final two attempts
  const showAttemptWarning = !passwordLocked && failedAttempts > 0 && attemptsLeft <= 2;

  const openForgot = () => {
    setResetEmail(email);
    setResetNote('');
    setResetError(null);
    setResetSent(false);
    setShowForgot(true);
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setResetLoading(true);
    setResetError(null);
    try {
      await authService.requestPasswordReset({ email: resetEmail, note: resetNote });
      setResetSent(true);
    } catch (err) {
      setResetError(err.message || 'Could not submit your request. Please try again.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      {/* ---------- Brand panel (desktop only) ---------- */}
      <aside className="auth-brand-panel" aria-hidden="true">
        <div className="auth-brand-panel-inner">
          <Link to="/" className="auth-panel-logo">
            <span className="auth-panel-mark">ASHVA</span>
            <span className="auth-panel-sub">EQUINE WELLNESS</span>
          </Link>

          <div className="auth-panel-copy">
            <h1>Welcome back to ASHVA</h1>
            <p>
              Natural equine nutrition and community care for working horses.
              Sign in to manage your orders, shop zone and weekly updates.
            </p>
          </div>

          <ul className="auth-panel-points">
            <li>
              <span className="auth-panel-dot" />
              Track your nutrition orders and deliveries
            </li>
            <li>
              <span className="auth-panel-dot" />
              Manage your city zone shops as a volunteer
            </li>
            <li>
              <span className="auth-panel-dot" />
              One sign-in for customers, volunteers and admins
            </li>
          </ul>

          <div className="auth-panel-glow" />
        </div>
      </aside>

      {/* ---------- Form panel ---------- */}
      <main className="auth-form-panel">
        <div className="auth-card-wrapper">
          <button type="button" className="auth-back-link" onClick={handleBack}>
            <ArrowLeft size={15} />
            Back
          </button>

        {showForgot ? (
          <>
            <div className="auth-card-header">
              <Link to="/" className="auth-brand-logo">
                <span className="brand-ashva">ASHVA</span>
                <span className="brand-sub">Wellness Portal</span>
              </Link>
              <h2>Forgot Your Password?</h2>
              <p className="auth-subtitle">
                Send a reset request to the ASHVA admin team. They will verify your identity and help you regain access.
              </p>
            </div>

            {resetError && (
              <div className="auth-alert error">
                <AlertCircle size={18} />
                <span>{resetError}</span>
              </div>
            )}

            {resetSent ? (
              <>
                <div className="auth-alert success">
                  <CheckCircle2 size={18} />
                  <span>
                    Request sent! The admin team has been notified and will contact you at{' '}
                    <strong>{resetEmail}</strong>.
                  </span>
                </div>
                <div className="auth-contact-admin">
                  <h4><MessageSquare size={15} /> Need it faster?</h4>
                  <p>Reach the admin team directly and mention your registered email address.</p>
                  <div className="auth-contact-actions">
                    <a href="mailto:enquinemix@gmail.com" className="auth-contact-btn">
                      <Mail size={14} /> Email Admin
                    </a>
                    <a href="https://wa.me/918422060195" target="_blank" rel="noopener noreferrer" className="auth-contact-btn">
                      <MessageSquare size={14} /> WhatsApp
                    </a>
                    <a href="tel:+918422060195" className="auth-contact-btn">
                      <Phone size={14} /> Call Helpline
                    </a>
                  </div>
                </div>
              </>
            ) : (
              <form onSubmit={handleForgotSubmit} className="auth-form">
                <div className="form-group">
                  <label>Account Email Address</label>
                  <div className="input-with-icon">
                    <Mail size={18} className="input-icon" />
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Message to Admin <span className="optional-tag">(optional)</span></label>
                  <textarea
                    rows="3"
                    className="auth-textarea"
                    placeholder="e.g. I can verify my phone number and recent order…"
                    value={resetNote}
                    onChange={(e) => setResetNote(e.target.value)}
                  />
                </div>

                <button type="submit" className="auth-submit-btn" disabled={resetLoading}>
                  {resetLoading ? <Loader2 size={18} className="auth-spin" /> : <KeyRound size={18} />}
                  {resetLoading ? 'Sending Request…' : 'Send Reset Request to Admin'}
                </button>
              </form>
            )}

            <div className="auth-card-footer">
              <p>
                Remembered it?{' '}
                <button type="button" className="link-switch-btn" onClick={() => setShowForgot(false)}>
                  Back to Sign In
                </button>
              </p>
            </div>
          </>
        ) : (
          <>
        <div className="auth-card-header">
          <Link to="/" className="auth-brand-logo">
            <span className="brand-ashva">ASHVA</span>
            <span className="brand-sub">Wellness Portal</span>
          </Link>
          <h2>Sign In</h2>
          <p className="auth-subtitle">Access your ASHVA account — orders, volunteer desk and shop management.</p>
        </div>

        {/* Warning: only two attempts left before the password field locks */}
        {showAttemptWarning && (
          <div className="auth-attempt-warning" role="status">
            <ShieldAlert size={17} />
            <div>
              <strong>
                {attemptsLeft} attempt{attemptsLeft === 1 ? '' : 's'} remaining
              </strong>
              <span>
                After {attemptsLeft} more failed {attemptsLeft === 1 ? 'try' : 'tries'} the password
                field will be locked for your security.
              </span>
            </div>
          </div>
        )}

        {passwordLocked ? (
          /* Password entry removed and forgot-password highlighted */
          <div className="auth-locked-panel" role="alert">
            <div className="auth-locked-icon">
              <Lock size={26} />
            </div>
            <h3>Password Entry Locked</h3>
            <p>
              Too many failed sign-in attempts were recorded for{' '}
              <strong>{email || 'this account'}</strong>. For your security the password field has
              been disabled.
            </p>

            <button type="button" className="auth-locked-forgot-btn" onClick={openForgot}>
              <KeyRound size={17} />
              Reset My Password via Admin
            </button>

            <div className="auth-contact-admin">
              <h4><MessageSquare size={15} /> Contact the Administrator</h4>
              <p>Reach the ASHVA admin team directly to restore access to your account.</p>
              <div className="auth-contact-actions">
                <a href="mailto:enquinemix@gmail.com" className="auth-contact-btn">
                  <Mail size={14} /> Email Admin
                </a>
                <a href="https://wa.me/918422060195" target="_blank" rel="noopener noreferrer" className="auth-contact-btn">
                  <MessageSquare size={14} /> WhatsApp
                </a>
                <a href="tel:+918422060195" className="auth-contact-btn">
                  <Phone size={14} /> Call Helpline
                </a>
                <Link to="/contact" className="auth-contact-btn">
                  <Send size={14} /> Contact Form
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <>

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
          </>
        )}

        <div className="auth-card-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/signup" state={{ from: fromPath }} className="link-switch">
              Create Account
            </Link>
          </p>
          <p className="auth-forgot-row">
            <button type="button" className="link-switch-btn" onClick={openForgot}>
              Forgot your password?
            </button>
          </p>
          <p className="auth-home-row">
            <Link to="/" className="link-switch">
              <Home size={14} /> Back to Home
            </Link>
          </p>
        </div>
          </>
        )}
        </div>
      </main>
    </div>
  );
};

export default Login;
