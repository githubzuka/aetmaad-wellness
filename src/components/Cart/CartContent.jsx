// src/components/Cart/CartContent.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Cart.css';

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

  // Recommended products for empty state quick-add
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

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shippingFee = cartItems.length > 0 ? 150 : 0;
  const grandTotal = subtotal + shippingFee;

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
          <h1 className="cart-title">Your Shopping Cart</h1>
        </div>

        {cartItems.length > 0 ? (
          <div className="cart-content-grid">
            {/* Left Column: Cart Items */}
            <div className="cart-items-list">
              {cartItems.map((item) => (
                <div key={item.id} className="cart-item-card">
                  <div className="cart-item-img-wrapper">
                    <img
                      src={item.image}
                      alt={item.name}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/100?text=AETMAAD';
                      }}
                    />
                  </div>

                  <div className="cart-item-details">
                    <h3 className="cart-item-title">{item.name}</h3>
                    <p className="cart-item-subtext">{item.subtext}</p>
                    <div className="cart-item-price">
                      ₹{item.price.toLocaleString('en-IN')}
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
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column: Order Summary */}
            <div className="cart-summary-card">
              <h2 className="cart-summary-title">Order Summary</h2>

              <div className="cart-summary-row">
                <span>Subtotal ({cartItems.reduce((a, b) => a + b.quantity, 0)} items)</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              <div className="cart-summary-row">
                <span>Estimated Shipping</span>
                <span>{shippingFee === 0 ? 'Free' : `₹${shippingFee}`}</span>
              </div>

              <div className="cart-summary-divider"></div>

              <div className="cart-summary-row cart-total-row">
                <span>Total</span>
                <span>₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>

              <button className="cart-checkout-btn">
                Proceed to Checkout
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>

              <div className="cart-guarantee-note">
                🔒 256-Bit Encrypted & Secure Checkout
              </div>
            </div>
          </div>
        ) : (
          /* Empty Cart State */
          <div className="cart-empty-wrapper">
            <div className="cart-empty-card">
              <div className="cart-empty-badge">AETMAAD WELLNESS</div>
              
              <div className="cart-empty-icon-container">
                <div className="cart-empty-icon-glow"></div>
                <svg className="cart-empty-svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
              </div>

              <h2 className="cart-empty-title">Your Cart is Currently Empty</h2>
              <p className="cart-empty-subtitle">
                Explore our scientifically formulated equine nutrition blends designed for performance, vitality, and overall equine well-being.
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
                          e.target.src = 'https://via.placeholder.com/150?text=AETMAAD';
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
                          + Add to Cart
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