import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, User, HeartHandshake, ShieldCheck, ArrowRight } from 'lucide-react';
import './SignInModal.css';

/**
 * Role chooser opened from the header "Sign In" button.
 * Every portal is reachable from here: customers & volunteers sign in at
 * /login, administrators at /admin.
 */
const OPTIONS = [
  {
    key: 'customer',
    to: '/login',
    icon: User,
    title: 'Customer',
    desc: 'Order nutrition products and track your deliveries.',
  },
  {
    key: 'volunteer',
    to: '/login',
    icon: HeartHandshake,
    title: 'Volunteer',
    desc: 'Manage your city zone shops and submit weekly feedback.',
  },
  {
    key: 'admin',
    to: '/admin',
    icon: ShieldCheck,
    title: 'Administrator',
    desc: 'Access the management console, approvals and alerts.',
  },
];

const SignInModal = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="signin-modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="signin-modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="signin-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="signin-modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="signin-modal-header">
          <span className="signin-modal-logo">ASHVA</span>
          <h2 id="signin-modal-title">Sign In</h2>
          <p>Choose how you want to continue.</p>
        </div>

        <div className="signin-modal-options">
          {OPTIONS.map((opt) => {
            const Icon = opt.icon;
            return (
              <Link
                key={opt.key}
                to={opt.to}
                className={`signin-option ${opt.key}`}
                onClick={onClose}
              >
                <div className="signin-option-icon">
                  <Icon size={20} />
                </div>
                <div className="signin-option-copy">
                  <strong>{opt.title}</strong>
                  <span>{opt.desc}</span>
                </div>
                <ArrowRight size={17} className="signin-option-arrow" />
              </Link>
            );
          })}
        </div>

        <div className="signin-modal-footer">
          <span>New to ASHVA?</span>
          <Link to="/signup" onClick={onClose} className="signin-modal-register">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignInModal;
