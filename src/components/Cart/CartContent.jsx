import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Cart.css';

const FREE_SHIPPING_THRESHOLD = 3500;

const CartContent = () => {
  const navigate = useNavigate();

  // Active cart state
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: 'Premium Equine Nutrition Mix',
      subtext: 'Daily Vitality Support (5 kg)',
      price: 1850,
      quantity: 1,
      image: '/images/enquinemix.png',
    },
    {
      id: 2,
      name: 'Working Horse Mineral & Hoof Booster',
      subtext: 'Hoof Strength & Joint Care (2 kg)',
      price: 950,
      quantity: 2,
      image: '/images/enquinemix.png',
    },
  ]);

  // Promo code state
  const [promoInput, setPromoInput] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');

  // Checkout state
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  // Recommended products
  const recommendedProducts = [
    {
      id: 101,
      name: 'Vitality Equine Formula',
      subtext: 'Daily Balanced Nutrition (5 kg)',
      price: 1850,
      image: '/images/enquinemix.png',
    },
    {
      id: 102,
      name: 'Hoof & Joint Care Mineral',
      subtext: 'Targeted Strength Support (2 kg)',
      price: 950,
      image: '/images/enquinemix.png',
    },
    {
      id: 103,
      name: 'Working Horse Recovery Mix',
      subtext: 'Electrolytes & Muscle Support (3 kg)',
      price: 1400,
      image: '/images/enquinemix.png',
    },
  ];

  const addRecommendedToCart = (product) => {
    setCartItems((prevItems) => {
      const exists = prevItems.find((item) => item.id === product.id);
      if (exists) {
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prevItems,
        {
          id: product.id,
          name: product.name,
          subtext: product.subtext,
          price: product.price,
          quantity: 1,
          image: product.image,
        },
      ];
    });
  };

  const updateQuantity = (id, delta) => {
    setCartItems((prevItems) =>
      prevItems
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeItem = (id) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const handleApplyPromo = (e) => {
    e.preventDefault();
    setPromoError('');
    setPromoSuccess('');

    const cleanCode = promoInput.trim().toUpperCase();
    if (cleanCode === 'ASVA10') {
      setDiscountPercent(10);
      setPromoSuccess('10% ASVA VIP discount applied!');
    } else if (cleanCode === 'EQUINE15') {
      setDiscountPercent(15);
      setPromoSuccess('15% Equestrian discount applied!');
    } else {
      setPromoError('Invalid coupon code. Try ASVA10.');
    }
  };

  const handleCheckout = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setOrderComplete(true);
      setCartItems([]);
    }, 1800);
  };

  // Pricing calculations
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const discountedSubtotal = subtotal - discountAmount;
  const shippingFee = cartItems.length === 0 ? 0 : discountedSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 150;
  const grandTotal = discountedSubtotal + shippingFee;

  // Free shipping progress calculation
  const progressToFreeShipping = Math.min(
    100,
    Math.round((discountedSubtotal / FREE_SHIPPING_THRESHOLD) * 100)
  );
  const amountNeededForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - discountedSubtotal);

  return (
    <section className="cart-page">
      <div className="cart-container">
        {/* Header Breadcrumb */}
        <div className="cart-header">
          <button className="cart-back-btn" onClick={() => navigate(-1)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Store
          </button>
          <div className="cart-title-row">
            <h1 className="cart-title">Your Shopping Cart</h1>
            {cartItems.length > 0 && (
              <span className="cart-count-badge">
                {cartItems.reduce((acc, item) => acc + item.quantity, 0)} Items
              </span>
            )}
          </div>
        </div>

        {orderComplete ? (
          /* Order Confirmation Screen */
          <div className="cart-success-card">
            <div className="cart-success-icon-wrapper">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <h2 className="cart-success-title">Order Placed Successfully!</h2>
            <p className="cart-success-sub">
              Thank you for choosing ASVA. We are preparing your premium equine nutrition shipment.
            </p>
            <button className="cart-btn-primary" onClick={() => navigate('/')}>
              Continue Shopping
            </button>
          </div>
        ) : cartItems.length > 0 ? (
          <div className="cart-content-grid">
            {/* Left Column: Items and Shipping Progress */}
            <div className="cart-main-section">
              {/* Free Shipping Progress Indicator */}
              <div className="cart-shipping-banner">
                <div className="cart-shipping-info">
                  <svg className="shipping-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="3" width="15" height="13" rx="2" ry="2"></rect>
                    <polyline points="16 8 20 8 23 11 23 16 16 16 16 8"></polyline>
                    <circle cx="5.5" cy="18.5" r="2.5"></circle>
                    <circle cx="18.5" cy="18.5" r="2.5"></circle>
                  </svg>
                  {amountNeededForFreeShipping === 0 ? (
                    <p className="cart-shipping-unlocked">You qualify for <strong>FREE Premium Shipping</strong>!</p>
                  ) : (
                    <p>
                      Add <strong>₹{amountNeededForFreeShipping.toLocaleString('en-IN')}</strong> more to unlock <strong>FREE Shipping</strong>
                    </p>
                  )}
                </div>
                <div className="cart-progress-bar-bg">
                  <div
                    className="cart-progress-bar-fill"
                    style={{ width: `${progressToFreeShipping}%` }}
                  ></div>
                </div>
              </div>

              {/* Cart Items List */}
              <div className="cart-items-list">
                {cartItems.map((item) => (
                  <div key={item.id} className="cart-item-card">
                    <div className="cart-item-img-wrapper">
                      <img
                        src={item.image}
                        alt={item.name}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/images/enquinemix.png';
                        }}
                      />
                    </div>

                    <div className="cart-item-details">
                      <div className="cart-item-tag">ASVA FORMULA</div>
                      <h3 className="cart-item-title">{item.name}</h3>
                      <p className="cart-item-subtext">{item.subtext}</p>
                      <div className="cart-item-price">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        {item.quantity > 1 && (
                          <span className="cart-item-unit-price"> (₹{item.price.toLocaleString('en-IN')} / unit)</span>
                        )}
                      </div>
                    </div>

                    <div className="cart-item-actions">
                      <div className="cart-qty-control">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <button
                        className="cart-remove-btn"
                        onClick={() => removeItem(item.id)}
                        aria-label="Remove item"
                        title="Remove Item"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Order Summary & Checkout */}
            <div className="cart-summary-card">
              <h2 className="cart-summary-title">Order Summary</h2>

              <form className="cart-promo-form" onSubmit={handleApplyPromo}>
                <div className="cart-promo-input-group">
                  <input
                    type="text"
                    placeholder="Promo Code (e.g., ASVA10)"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                  />
                  <button type="submit">Apply</button>
                </div>
                {promoError && <p className="cart-promo-msg error">{promoError}</p>}
                {promoSuccess && <p className="cart-promo-msg success">{promoSuccess}</p>}
              </form>

              <div className="cart-summary-divider"></div>

              <div className="cart-summary-row">
                <span>Subtotal ({cartItems.reduce((a, b) => a + b.quantity, 0)} items)</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              {discountPercent > 0 && (
                <div className="cart-summary-row cart-discount-row">
                  <span>Discount ({discountPercent}%)</span>
                  <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="cart-summary-row">
                <span>Estimated Shipping</span>
                <span>{shippingFee === 0 ? <strong className="free-tag">FREE</strong> : `₹${shippingFee}`}</span>
              </div>

              <div className="cart-summary-divider"></div>

              <div className="cart-summary-row cart-total-row">
                <span>Total</span>
                <span>₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>

              <button
                className={`cart-checkout-btn ${isProcessing ? 'loading' : ''}`}
                onClick={handleCheckout}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <span className="cart-spinner"></span>
                ) : (
                  <>
                    <span>Proceed to Checkout</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </>
                )}
              </button>

              <div className="cart-features-list">
                <div className="cart-feature-item">
                  <svg className="feature-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  <span>256-Bit Encrypted Secure Payment</span>
                </div>
                <div className="cart-feature-item">
                  <svg className="feature-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    <path d="M9 12l2 2 4-4"></path>
                  </svg>
                  <span>100% Scientifically Certified Formulations</span>
                </div>
                <div className="cart-feature-item">
                  <svg className="feature-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="3" width="15" height="13" rx="2" ry="2"></rect>
                    <polyline points="16 8 20 8 23 11 23 16 16 16 16 8"></polyline>
                    <circle cx="5.5" cy="18.5" r="2.5"></circle>
                    <circle cx="18.5" cy="18.5" r="2.5"></circle>
                  </svg>
                  <span>Express Dispatch Across India</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Empty Cart State */
          <div className="cart-empty-wrapper">
            <div className="cart-empty-card">
              <div className="cart-empty-badge">ASVA EQUINE</div>

              <div className="cart-empty-icon-container">
                <div className="cart-empty-icon-glow"></div>
                <svg className="cart-empty-svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
              </div>

              <h2 className="cart-empty-title">Your Cart is Currently Empty</h2>
              <p className="cart-empty-subtitle">
                Explore our scientifically formulated equine nutrition blends designed for peak athletic performance, vitality, and overall equine well-being.
              </p>

              <div className="cart-empty-cta-group">
                <Link to="/#products" className="cart-btn-primary">
                  <span>Explore All Products</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </Link>
                <Link to="/#initiative" className="cart-btn-secondary">
                  Our Initiative
                </Link>
              </div>
            </div>

            {/* Quick-Add Recommended Products Section */}
            <div className="cart-suggestions-section">
              <div className="cart-suggestions-header">
                <h3>Popular Equine Essentials</h3>
                <p>Quickly add our top-rated formulations to your order</p>
              </div>

              <div className="cart-suggestions-grid">
                {recommendedProducts.map((prod) => (
                  <div key={prod.id} className="cart-suggestion-card">
                    <div className="suggestion-img-box">
                      <img
                        src={prod.image}
                        alt={prod.name}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/images/enquinemix.png';
                        }}
                      />
                    </div>
                    <div className="suggestion-info">
                      <h4>{prod.name}</h4>
                      <p>{prod.subtext}</p>
                      <div className="suggestion-bottom">
                        <span className="suggestion-price">₹{prod.price.toLocaleString('en-IN')}</span>
                        <button
                          className="suggestion-add-btn"
                          onClick={() => addRecommendedToCart(prod)}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                          </svg>
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default CartContent;