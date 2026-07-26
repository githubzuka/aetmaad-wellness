import React, { useState } from 'react';
import './DonateModal.css';

const DonateModal = ({ isOpen, onClose, selectedAmount, isMonthly }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    panNumber: '',
  });

  const [showQRView, setShowQRView] = useState(false);
  const [paymentSubmitted, setPaymentSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 1. REPLACE THIS WITH YOUR ACTUAL GPAY / UPI ID
  const YOUR_UPI_ID = 'zuveriakazi2808-1@okhdfcbank'; // e.g. 9876543210@okaxis or yourname@okhdfcbank
  const RECIPIENT_NAME = 'Working Horses Initiative';

  // NPCI-compliant UPI Link for Mobile Tap
  const upiString = `upi://pay?pa=${YOUR_UPI_ID}&pn=${encodeURIComponent(RECIPIENT_NAME)}&am=${selectedAmount}&cu=INR&tn=${encodeURIComponent('Donation')}`;

  const handleProceedToQR = (e) => {
    e.preventDefault();
    setShowQRView(true);
  };

  const handleResetModal = () => {
    setShowQRView(false);
    setPaymentSubmitted(false);
    onClose();
  };

  return (
    <div className="donatemodal-overlay" onClick={handleResetModal}>
      <div className="donatemodal-container" onClick={(e) => e.stopPropagation()}>
        <button className="donatemodal-close-btn" onClick={handleResetModal}>×</button>

        {!paymentSubmitted ? (
          !showQRView ? (
            /* --- STEP 1: USER DETAILS FORM --- */
            <>
              <div className="donatemodal-header">
                <span className="donatemodal-badge">
                  {isMonthly ? 'Monthly Support' : 'One-Time Support'}
                </span>
                <h2>Complete Your Donation</h2>
                <div className="donatemodal-amount-display">
                  ₹{Number(selectedAmount || 0).toLocaleString('en-IN')}
                  <span className="donatemodal-frequency">{isMonthly ? '/ month' : ''}</span>
                </div>
              </div>

              <form onSubmit={handleProceedToQR} className="donatemodal-form">
                <div className="donatemodal-field">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={formData.fullName}
                    onChange={handleChange}
                  />
                </div>

                <div className="donatemodal-field">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="rahul@example.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                <div className="donatemodal-row">
                  <div className="donatemodal-field">
                    <label>Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="donatemodal-field">
                    <label>PAN Number (Optional)</label>
                    <input
                      type="text"
                      name="panNumber"
                      maxLength="10"
                      placeholder="ABCDE1234F"
                      value={formData.panNumber}
                      onChange={handleChange}
                      style={{ textTransform: 'uppercase' }}
                    />
                  </div>
                </div>

                <button type="submit" className="donatemodal-pay-btn">
                  Proceed to Pay ₹{Number(selectedAmount || 0).toLocaleString('en-IN')}
                </button>
              </form>
            </>
          ) : (
            /* --- STEP 2: QR CODE FROM PUBLIC FOLDER & UPI DETAILS --- */
            <div className="donatemodal-qr-container">
              <div className="donatemodal-header">
                <h2>Scan & Pay via UPI</h2>
                <p style={{ fontSize: '13px', color: '#666', margin: '4px 0 8px' }}>
                  Scan using <strong>GPay, PhonePe, Paytm, or BHIM</strong>
                </p>
                <div className="donatemodal-amount-display">
                  ₹{Number(selectedAmount || 0).toLocaleString('en-IN')}
                </div>
              </div>

              {/* Direct reference to public/images/qr-code.png */}
              <div className="donatemodal-qr-box">
                <img 
                  src="/images/image.png" 
                  alt="Payment QR Code" 
                  className="donatemodal-qr-image"
                />
              </div>

             

              <button
                type="button"
                className="donatemodal-pay-btn"
                style={{ marginTop: '14px' }}
                onClick={() => setPaymentSubmitted(true)}
              >
                I Have Completed the Payment
              </button>
            </div>
          )
        ) : (
          /* --- STEP 3: SUCCESS CONFIRMATION --- */
          <div className="donatemodal-success">
            <div className="donatemodal-success-icon">✓</div>
            <h2>Thank You for Your Support!</h2>
            <p>Your contribution of <strong>₹{Number(selectedAmount).toLocaleString('en-IN')}</strong> has been recorded.</p>
            <p className="donatemodal-receipt-note">A receipt confirmation will be sent to <u>{formData.email}</u>.</p>
            <button className="donatemodal-pay-btn" onClick={handleResetModal}>
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DonateModal;