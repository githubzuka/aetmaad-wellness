import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Truck, CreditCard, Lock, AlertTriangle, X, Check, MapPin, User, Phone, ArrowRight, ShieldCheck } from 'lucide-react';
import './PaymentModal.css';

const PaymentModal = ({ cartItems, grandTotal, qualifiesForBulk, onClose, onConfirmOrder }) => {
  const { user } = useAuth();

  // Payment Method Selection: 'COD' (default & active) | 'ONLINE' (disabled)
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [onlineNotice, setOnlineNotice] = useState(false);

  // Delivery Address Form State
  const [shippingAddress, setShippingAddress] = useState({
    name: user?.name || '',
    contactNumber: user?.contactNumber || '',
    address: user?.address || '',
    city: user?.city || 'Mumbai',
    pincode: '400001',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    setShippingAddress((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSelectOnlinePayment = () => {
    setOnlineNotice(true);
    // Maintain COD selection
    setPaymentMethod('COD');
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setError(null);

    if (!cartItems || cartItems.length === 0) {
      setError('Your shopping cart is empty. Please add items to your cart.');
      return;
    }

    if (!shippingAddress.name || !shippingAddress.contactNumber || !shippingAddress.address) {
      setError('Please complete all required delivery address fields.');
      return;
    }

    // Derive shopId from cart items
    const derivedShopId = cartItems[0]?.shopId || (typeof cartItems[0]?.shop === 'object' ? cartItems[0]?.shop?._id : cartItems[0]?.shop) || null;

    setSubmitting(true);

    try {
      // Build clean order payload
      const orderPayload = {
        orderType: qualifiesForBulk ? 'bulk' : 'normal',
        paymentMethod: paymentMethod || 'COD',
        paymentStatus: 'pending',
        shippingAddress: shippingAddress,
        items: cartItems.map((item) => ({
          productId: item._id || item.productId || 'default-equine-mix',
          name: item.name || 'ASHVA Equine Nutrition Mix (10kg)',
          quantity: item.quantity,
          price: item.quantity >= 5 ? (item.bulkPrice || 1200) : (item.retailPrice || 1500),
        })),
        totalAmount: grandTotal,
      };

      if (derivedShopId) {
        orderPayload.shopId = derivedShopId;
      }

      await onConfirmOrder(orderPayload);
    } catch (err) {
      setError(err.message || 'Failed to confirm order with Cash on Delivery.');
      setSubmitting(false);
    }
  };

  return (
    <div className="payment-modal-overlay">
      <div className="payment-modal-card">
        
        {/* Modal Header */}
        <div className="payment-modal-header">
          <div>
            <span className="checkout-step-tag">CHECKOUT STEP 2 OF 2</span>
            <h2>Delivery Address & Payment Selection</h2>
          </div>

          <button type="button" className="btn-close-payment-modal" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="payment-modal-alert error">
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmitOrder} className="payment-modal-body">

          {/* Section 1: Delivery Address Verification */}
          <div className="checkout-section">
            <h3 className="section-title">
              <MapPin size={18} />
              1. Delivery Address Verification
            </h3>

            <div className="address-form-grid">
              <div className="form-group full-width">
                <label>Full Name *</label>
                <div className="input-icon-wrap">
                  <User size={16} className="field-icon" />
                  <input
                    type="text"
                    name="name"
                    placeholder="Recipient Full Name"
                    value={shippingAddress.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Contact Number *</label>
                <div className="input-icon-wrap">
                  <Phone size={16} className="field-icon" />
                  <input
                    type="tel"
                    name="contactNumber"
                    placeholder="+91 98765 43210"
                    value={shippingAddress.contactNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>City / Zone *</label>
                <input
                  type="text"
                  name="city"
                  placeholder="e.g. Mumbai / Pune"
                  value={shippingAddress.city}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group full-width">
                <label>Street Address / House / Landmark *</label>
                <input
                  type="text"
                  name="address"
                  placeholder="House No., Building, Street Name, Area"
                  value={shippingAddress.address}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Pincode / Postal Code *</label>
                <input
                  type="text"
                  name="pincode"
                  placeholder="400001"
                  value={shippingAddress.pincode}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 2: Payment Method Selection */}
          <div className="checkout-section">
            <h3 className="section-title">
              <CreditCard size={18} />
              2. Choose Payment Method
            </h3>

            <div className="payment-options-grid">
              
              {/* Option 1: Cash on Delivery (COD) [Active & Default] */}
              <label 
                className={`payment-option-card active ${paymentMethod === 'COD' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('COD')}
              >
                <div className="option-radio-wrap">
                  <input 
                    type="radio" 
                    name="paymentMethodOption" 
                    value="COD" 
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                  />
                </div>

                <div className="option-icon-box cod">
                  <Truck size={22} />
                </div>

                <div className="option-details">
                  <div className="option-header-row">
                    <span className="option-title">Cash on Delivery (COD)</span>
                    <span className="recommended-badge">DEFAULT & ACTIVE</span>
                  </div>
                  <p className="option-desc">Pay with cash upon delivery of your items to your door or local shop.</p>
                </div>
              </label>

              {/* Option 2: Online Payment (UPI, Cards, Net Banking) [Disabled / Coming Soon] */}
              <div 
                className="payment-option-card disabled"
                onClick={handleSelectOnlinePayment}
              >
                <div className="option-radio-wrap">
                  <input 
                    type="radio" 
                    name="paymentMethodOption" 
                    value="ONLINE" 
                    disabled 
                  />
                </div>

                <div className="option-icon-box online">
                  <Lock size={20} />
                </div>

                <div className="option-details">
                  <div className="option-header-row">
                    <span className="option-title disabled-text">Online Payment (UPI, Cards, Net Banking)</span>
                    <span className="coming-soon-badge">COMING SOON</span>
                  </div>
                  <p className="option-desc">Digital checkout via UPI, Google Pay, PhonePe, and Credit/Debit Cards.</p>
                </div>
              </div>

            </div>

            {/* Informational Warning Banner for Online Payment */}
            <div className="online-notice-banner">
              <AlertTriangle size={18} className="notice-icon" />
              <span>
                <strong>Notice:</strong> Online payments will be available soon! Currently, we are exclusively accepting <strong>Cash on Delivery (COD)</strong> for all retail and shop orders.
              </span>
            </div>
          </div>

          {/* Section 3: Summary & Order Confirmation */}
          <div className="modal-summary-footer">
            <div className="modal-total-display">
              <span className="total-label">Grand Total (COD):</span>
              <span className="total-amount">₹{grandTotal.toLocaleString()}</span>
            </div>

            <button 
              type="submit" 
              className="btn-confirm-cod-order" 
              disabled={submitting || !cartItems || cartItems.length === 0}
            >
              {submitting ? (
                'Transmitting Order...'
              ) : (
                <>
                  Confirm Order with Cash on Delivery
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default PaymentModal;
