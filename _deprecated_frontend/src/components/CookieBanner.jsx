import React, { useState, useEffect } from 'react';

const CookieBanner = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: '#064e3b', color: '#ffffff', padding: '16px 24px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      zIndex: 10000, flexWrap: 'wrap', gap: '12px', boxShadow: '0 -4px 12px rgba(0,0,0,0.15)'
    }}>
      <p style={{ margin: 0, fontSize: '14px', maxWidth: '800px' }}>
        We use cookies to improve your experience on Aetmaad Wellness. By continuing, you agree to our 
        <a href="/privacy-policy" style={{ color: '#34d399', marginLeft: '5px' }}>Privacy Policy</a>.
      </p>
      <button 
        onClick={handleAccept} 
        style={{
          background: '#10b981', color: '#ffffff', border: 'none',
          padding: '10px 24px', borderRadius: '24px', fontWeight: '600', cursor: 'pointer'
        }}
      >
        Accept & Close
      </button>
    </div>
  );
};

export default CookieBanner;