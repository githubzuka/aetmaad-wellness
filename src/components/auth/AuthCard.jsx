import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Lock, Mail, Eye, EyeOff, ArrowRight, ArrowLeft, AlertCircle, CheckCircle2,
  Loader2, KeyRound, Home, ShieldAlert, Phone, MessageSquare, Send,
  User as UserIcon, MapPin, HeartHandshake, ShoppingBag, Info,
} from 'lucide-react';
import authService from '../../services/authService';
import './AuthCard.css';

const MAX_ATTEMPTS = 5;

/**
 * Shared ASHVA authentication card.
 *
 * Renders the Sign In / Create Account / Forgot Password flows in one
 * consistently aligned card, so every entry point into the portal
 * (login page, signup page, headers, checkout redirects) looks identical.
 */
const AuthCard = ({ initialMode = 'signin' }) => {
  const [mode, setMode] = useState(initialMode);

  // ---------- Sign in ----------
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Lockout state after repeated failed attempts
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [passwordLocked, setPasswordLocked] = useState(false);

  // ---------- Sign up ----------
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    contactNumber: '',
    city: '',
  });
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [accountType, setAccountType] = useState('customer');
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState(null);

  // ---------- Forgot password ----------
  const [resetEmail, setResetEmail] = useState('');
  const [resetNote, setResetNote] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState(null);
  const [resetSent, setResetSent] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const fromPath = location.state?.from || '/';

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
    setSignupError(null);
    setResetError(null);
  };

  const switchMode = (next) => {
    clearMessages();
    setMode(next);
  };

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/');
  };

  // Ask the server how many recent failed attempts this account has, so the
  // lockout state stays accurate across page reloads.
  useEffect(() => {
    const checkAttempts = async () => {
      if (mode !== 'signin' || !email || !email.includes('@')) return;
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
  }, [email, mode]);

  const handleSignin = async (e) => {
    e.preventDefault();
    if (passwordLocked) return;

    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      // No expectedRole: this single portal accepts customers, volunteers AND
      // administrators. Admins are sent straight to the console.
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
          navigate(fromPath, { replace: true });
        }
      }, 700);
    } catch (err) {
      const message = err.message || 'Invalid email or password.';

      if (err.code === 'PASSWORD_LOCKED' || message.toLowerCase().includes('too many failed attempts')) {
        setPasswordLocked(true);
        setError(null);
        return;
      }

      if (err.code === 'ROLE_MISMATCH') {
        setError(message);
        return;
      }

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

  const handleSignupChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setSignupError(null);
    setSignupLoading(true);

    try {
      await register({ ...formData, role: accountType });

      // Volunteer accounts await admin approval before they get a desk
      if (accountType === 'volunteer') {
        navigate('/volunteer', { replace: true });
        return;
      }

      navigate(fromPath, {
        replace: true,
        state: location.state?.mode === 'apply' ? { mode: 'apply' } : undefined,
      });
    } catch (err) {
      setSignupError(err.message || 'Registration failed. Please check your information.');
    } finally {
      setSignupLoading(false);
    }
  };

  const handleForgot = async (e) => {
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

  const openForgot = () => {
    setResetEmail(email);
    setResetNote('');
    setResetError(null);
    setResetSent(false);
    setMode('forgot');
  };

  const needsAccount = error?.toLowerCase().includes('no account found');
  const attemptsLeft = Math.max(0, MAX_ATTEMPTS - failedAttempts);
  const showAttemptWarning = !passwordLocked && failedAttempts > 0 && attemptsLeft <= 2;

  const accountExists = signupError?.toLowerCase().includes('already exists');
  const isVolunteer = accountType === 'volunteer';

  // Header copy follows the active tab so the card always reads coherently
  const header = {
    signin: {
      title: 'Welcome Back',
      subtitle: 'Sign in to track orders, manage your shop zone and stay updated.',
    },
    signup: {
      title: isVolunteer ? 'Become a Volunteer' : 'Create Your Account',
      subtitle: isVolunteer
        ? 'Register to support shops and horse welfare in your city zone.'
        : 'Register to order equine nutrition mixes and track your deliveries.',
    },
    forgot: {
      title: 'Forgot Password?',
      subtitle: 'Send a reset request to the ASHVA admin team — they will verify you and restore access.',
    },
  }[mode];

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
            <h1>Natural nutrition for working horses.</h1>
            <p>
              One secure account for shopping, volunteer zones and donations —
              built around the horses we care for.
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

          <div className="auth-card-header">
            <Link to="/" className="auth-brand-logo">
              <span className="brand-ashva">ASHVA</span>
              <span className="brand-sub">Wellness Portal</span>
            </Link>
            <h2>{header.title}</h2>
            <p className="auth-subtitle">{header.subtitle}</p>
          </div>

          {/* Segmented mode tabs */}
          <div className="auth-tabs" role="tablist" aria-label="Account access">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'signin'}
              className={`auth-tab ${mode === 'signin' ? 'active' : ''}`}
              onClick={() => switchMode('signin')}
            >
              Sign In
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'signup'}
              className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
              onClick={() => switchMode('signup')}
            >
              Create Account
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'forgot'}
              className={`auth-tab ${mode === 'forgot' ? 'active' : ''}`}
              onClick={() => switchMode('forgot')}
            >
              Forgot
            </button>
          </div>

          {/* ================= SIGN IN ================= */}
          {mode === 'signin' && (
            <>
              {showAttemptWarning && (
                <div className="auth-attempt-warning" role="status">
                  <ShieldAlert size={17} />
                  <div>
                    <strong>
                      {attemptsLeft} attempt{attemptsLeft === 1 ? '' : 's'} remaining
                    </strong>
                    <span>
                      After {attemptsLeft} more failed {attemptsLeft === 1 ? 'try' : 'tries'} the
                      password field will be locked for your security.
                    </span>
                  </div>
                </div>
              )}

              {passwordLocked ? (
                <div className="auth-locked-panel" role="alert">
                  <div className="auth-locked-icon">
                    <Lock size={26} />
                  </div>
                  <h3>Password Entry Locked</h3>
                  <p>
                    Too many failed sign-in attempts were recorded for{' '}
                    <strong>{email || 'this account'}</strong>. For your security the password field
                    has been disabled.
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
                          <button
                            type="button"
                            className="auth-alert-action"
                            onClick={() => switchMode('signup')}
                          >
                            Create Account
                          </button>
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

                  <form onSubmit={handleSignin} className="auth-form">
                    <div className="form-group">
                      <label htmlFor="signin-email">Email Address</label>
                      <div className="input-with-icon">
                        <Mail size={18} className="input-icon" />
                        <input
                          id="signin-email"
                          type="email"
                          autoComplete="email"
                          placeholder="name@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <div className="label-row">
                        <label htmlFor="signin-password">Password</label>
                      </div>
                      <div className="input-with-icon has-trailing">
                        <Lock size={18} className="input-icon" />
                        <input
                          id="signin-password"
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="current-password"
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          className="input-trailing-btn"
                          onClick={() => setShowPassword((v) => !v)}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                        </button>
                      </div>
                    </div>

                    <button type="submit" className="auth-submit-btn" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 size={18} className="auth-spin" />
                          Signing In…
                        </>
                      ) : (
                        <>
                          Sign In
                          <ArrowRight size={18} />
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </>
          )}

          {/* ================= CREATE ACCOUNT ================= */}
          {mode === 'signup' && (
            <>
              {signupError && (
                <div className="auth-alert error">
                  <AlertCircle size={18} />
                  <div>
                    <span>{signupError}</span>
                    {accountExists && (
                      <button
                        type="button"
                        className="auth-alert-action"
                        onClick={() => switchMode('signin')}
                      >
                        Sign In Instead
                      </button>
                    )}
                  </div>
                </div>
              )}

              <form onSubmit={handleSignup} className="auth-form">
                <div className="form-group">
                  <label>I am registering as</label>
                  <div className="signup-role-picker" role="radiogroup" aria-label="Account type">
                    <button
                      type="button"
                      role="radio"
                      aria-checked={accountType === 'customer'}
                      className={`signup-role-option ${accountType === 'customer' ? 'active' : ''}`}
                      onClick={() => setAccountType('customer')}
                    >
                      <ShoppingBag size={17} />
                      <span>Customer</span>
                    </button>
                    <button
                      type="button"
                      role="radio"
                      aria-checked={accountType === 'volunteer'}
                      className={`signup-role-option ${accountType === 'volunteer' ? 'active' : ''}`}
                      onClick={() => setAccountType('volunteer')}
                    >
                      <HeartHandshake size={17} />
                      <span>Volunteer</span>
                    </button>
                  </div>
                </div>

                {isVolunteer && (
                  <div className="signup-role-note">
                    <Info size={15} />
                    <span>
                      Volunteer applications are reviewed by the ASHVA team. You will be notified
                      once your account is approved.
                    </span>
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="signup-name">Full Name</label>
                  <div className="input-with-icon">
                    <UserIcon size={18} className="input-icon" />
                    <input
                      id="signup-name"
                      type="text"
                      name="name"
                      autoComplete="name"
                      placeholder="e.g. Vikram Singh"
                      value={formData.name}
                      onChange={handleSignupChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="signup-email">Email Address</label>
                  <div className="input-with-icon">
                    <Mail size={18} className="input-icon" />
                    <input
                      id="signup-email"
                      type="email"
                      name="email"
                      autoComplete="email"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={handleSignupChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="signup-password">Password</label>
                  <div className="input-with-icon has-trailing">
                    <Lock size={18} className="input-icon" />
                    <input
                      id="signup-password"
                      type={showSignupPassword ? 'text' : 'password'}
                      name="password"
                      autoComplete="new-password"
                      placeholder="At least 6 characters"
                      value={formData.password}
                      onChange={handleSignupChange}
                      minLength={6}
                      required
                    />
                    <button
                      type="button"
                      className="input-trailing-btn"
                      onClick={() => setShowSignupPassword((v) => !v)}
                      aria-label={showSignupPassword ? 'Hide password' : 'Show password'}
                    >
                      {showSignupPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                  <span className="field-hint">Use 6 or more characters.</span>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="signup-phone">Contact Number</label>
                    <div className="input-with-icon">
                      <Phone size={18} className="input-icon" />
                      <input
                        id="signup-phone"
                        type="tel"
                        name="contactNumber"
                        autoComplete="tel"
                        placeholder="+91 98765 43210"
                        value={formData.contactNumber}
                        onChange={handleSignupChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="signup-city">City / Zone</label>
                    <div className="input-with-icon">
                      <MapPin size={18} className="input-icon" />
                      <input
                        id="signup-city"
                        type="text"
                        name="city"
                        placeholder="e.g. Mumbai"
                        value={formData.city}
                        onChange={handleSignupChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                <button type="submit" className="auth-submit-btn" disabled={signupLoading}>
                  {signupLoading ? (
                    <>
                      <Loader2 size={18} className="auth-spin" />
                      Creating Account…
                    </>
                  ) : (
                    <>
                      {isVolunteer ? 'Submit Volunteer Application' : 'Register Account'}
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {/* ================= FORGOT PASSWORD ================= */}
          {mode === 'forgot' && (
            <>
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
                <form onSubmit={handleForgot} className="auth-form">
                  <div className="form-group">
                    <label htmlFor="reset-email">Account Email Address</label>
                    <div className="input-with-icon">
                      <Mail size={18} className="input-icon" />
                      <input
                        id="reset-email"
                        type="email"
                        autoComplete="email"
                        placeholder="name@example.com"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="reset-note">
                      Message to Admin <span className="optional-tag">(optional)</span>
                    </label>
                    <textarea
                      id="reset-note"
                      rows="3"
                      className="auth-textarea"
                      placeholder="e.g. I can verify my phone number and recent order…"
                      value={resetNote}
                      onChange={(e) => setResetNote(e.target.value)}
                    />
                  </div>

                  <button type="submit" className="auth-submit-btn" disabled={resetLoading}>
                    {resetLoading ? (
                      <>
                        <Loader2 size={18} className="auth-spin" />
                        Sending Request…
                      </>
                    ) : (
                      <>
                        <KeyRound size={18} />
                        Send Reset Request to Admin
                      </>
                    )}
                  </button>
                </form>
              )}
            </>
          )}

          <div className="auth-card-footer">
            {mode === 'signin' && (
              <p>
                Don't have an account?{' '}
                <button type="button" className="link-switch-btn" onClick={() => switchMode('signup')}>
                  Create one now
                </button>
              </p>
            )}
            {mode === 'signup' && (
              <p>
                Already registered?{' '}
                <button type="button" className="link-switch-btn" onClick={() => switchMode('signin')}>
                  Sign in instead
                </button>
              </p>
            )}
            {mode === 'forgot' && (
              <p>
                Remembered it?{' '}
                <button type="button" className="link-switch-btn" onClick={() => switchMode('signin')}>
                  Back to sign in
                </button>
              </p>
            )}

            <p className="auth-home-row">
              <Link to="/" className="link-switch">
                <Home size={14} /> Back to Home
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AuthCard;
