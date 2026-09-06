import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import orderService from '../services/orderService';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PaymentModal from '../components/Cart/PaymentModal';
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, Sparkles, CheckCircle2, AlertCircle, Lock, Truck, CreditCard } from 'lucide-react';
import './Cart.css';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, clearCart, cartSubtotal, totalItemCount } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orderPlaced, setOrderPlaced] = useState(null);

  // Bulk discount & subtotal calculations
  const totalBags = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const qualifiesForBulk = totalBags >= 5;
  const estimatedTax = Math.round(cartSubtotal * 0.05); // 5% GST
  const grandTotal = cartSubtotal + estimatedTax;

  // Trigger Payment Modal or Login Redirect
  const handleOpenPaymentStep = () => {
    setError(null);

    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/cart' } });
      return;
    }

    if (cartItems.length === 0) return;

    setIsPaymentModalOpen(true);
  };

  // Callback from PaymentModal on "Confirm Order with Cash on Delivery"
  const handleConfirmOrder = async (orderPayload) => {
    setLoading(true);
    setError(null);

    try {
      const res = await orderService.createOrder(orderPayload);
      const createdOrder = res.data || { 
        _id: `ASHVA-${Date.now().toString().slice(-6)}`,
        paymentMethod: 'COD',
        paymentStatus: 'pending',
        totalAmount: grandTotal,
      };

      setOrderPlaced(createdOrder);
      setIsPaymentModalOpen(false);
      clearCart();
    } catch (err) {
      setError(err.message || 'Checkout failed. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <Header />

      <main className="cart-main-container">
        
        <Link to="/products" className="back-link">
          <ArrowLeft size={16} /> Continue Shopping
        </Link>

        <h1 className="cart-title">Shopping Cart ({totalItemCount} Items)</h1>

        {/* ORDER PLACED SUCCESS SCREEN */}
        {orderPlaced ? (
          <div className="cart-order-success">
            <div className="success-icon-badge">
              <CheckCircle2 size={48} />
            </div>
            <h2>Order Confirmed!</h2>
            
            <p className="order-num-text">
              Order ID: <strong>#{orderPlaced._id?.slice(-6).toUpperCase()}</strong>
            </p>

            <div className="cod-success-summary-box">
              <div className="cod-badge-row">
                <Truck size={18} />
                <span>PAYMENT METHOD: <strong>CASH ON DELIVERY (COD)</strong></span>
              </div>
              <p>Total Payable Amount on Delivery: <strong>₹{grandTotal.toLocaleString()}</strong></p>
              <p className="recipient-name">Recipient: <strong>{user?.name}</strong></p>
            </div>

            <p className="order-desc">
              Thank you! Your order has been transmitted to our zone distribution hub. Our delivery partner will contact you before arriving with your Cash on Delivery package.
            </p>

            <div className="cart-success-actions">
              <Link to="/orders" className="btn-view-orders">
                View My Orders History
              </Link>
              <Link to="/products" className="btn-continue">
                Back to Products
              </Link>
            </div>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="empty-cart-card">
            <ShoppingCart size={48} className="empty-icon" />
            <h3>Your Shopping Cart is Empty</h3>
            <p>You haven't added any nutrition mixes or supplements yet.</p>
            <Link to="/products" className="btn-browse-catalog">
              Browse Products Catalog
            </Link>
          </div>
        ) : (
          <div className="cart-layout-grid">
            
            {/* Left Column: Itemized Cart Table */}
            <div className="cart-items-column">
              
              {qualifiesForBulk && (
                <div className="bulk-active-banner">
                  <Sparkles size={18} />
                  <span>🎉 <strong>Wholesale Bulk Discount Active!</strong> Applied on total cart volume ({totalBags} Bags).</span>
                </div>
              )}

              <div className="cart-items-list">
                {cartItems.map((item) => {
                  const isItemBulk = item.quantity >= 5 || qualifiesForBulk;
                  const itemUnitPrice = isItemBulk ? (item.bulkPrice || 1200) : (item.retailPrice || 1500);
                  const itemTotal = itemUnitPrice * item.quantity;

                  return (
                    <div key={item._id} className="cart-item-row">
                      
                      <div className="cart-item-img-box">
                        <img src={item.image || '/images/enquinemix.png'} alt={item.name} />
                      </div>

                      <div className="cart-item-details">
                        <h3>{item.name}</h3>
                        <span className="unit-price-label">
                          Unit Price: ₹{itemUnitPrice} {isItemBulk && <strong className="bulk-tag">(Bulk Rate)</strong>}
                        </span>
                      </div>

                      {/* Quantity Controls */}
                      <div className="cart-item-qty-controls">
                        <button
                          type="button"
                          className="cart-qty-btn"
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        >
                          <Minus size={14} />
                        </button>
                        
                        <span className="cart-qty-num">{item.quantity}</span>

                        <button
                          type="button"
                          className="cart-qty-btn"
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      {/* Item Total & Delete */}
                      <div className="cart-item-price-actions">
                        <span className="item-subtotal-val">₹{itemTotal.toLocaleString()}</span>
                        
                        <button
                          type="button"
                          className="btn-remove-item"
                          onClick={() => removeFromCart(item._id)}
                          title="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>

              <button className="btn-clear-cart" onClick={clearCart}>
                Clear Entire Cart
              </button>
            </div>

            {/* Right Column: Order Summary & Checkout Trigger */}
            <div className="cart-summary-column">
              <div className="cart-summary-card">
                <h2>Order Summary</h2>

                {error && (
                  <div className="cart-error-alert">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                  </div>
                )}

                <div className="summary-row">
                  <span>Cart Items ({totalItemCount}):</span>
                  <span>₹{cartSubtotal.toLocaleString()}</span>
                </div>

                <div className="summary-row">
                  <span>Estimated Taxes (5% GST):</span>
                  <span>₹{estimatedTax.toLocaleString()}</span>
                </div>

                {qualifiesForBulk && (
                  <div className="summary-row savings">
                    <span>Bulk Wholesale Discount:</span>
                    <span className="savings-val">APPLIED</span>
                  </div>
                )}

                <div className="summary-row grand-total">
                  <span>Grand Total:</span>
                  <span className="grand-total-val">₹{grandTotal.toLocaleString()}</span>
                </div>

                {/* Available Payment Method Teaser Badge */}
                <div className="payment-method-teaser">
                  <span className="cod-badge-small">
                    <Truck size={14} /> Cash on Delivery (COD) Available
                  </span>
                  <span className="online-badge-small muted">
                    <Lock size={12} /> Online Payment (Coming Soon)
                  </span>
                </div>

                <button
                  className="btn-place-order-main"
                  onClick={handleOpenPaymentStep}
                  disabled={cartItems.length === 0}
                >
                  {!isAuthenticated ? (
                    'Sign In to Complete Checkout'
                  ) : (
                    'Proceed to Payment & Address'
                  )}
                </button>

                <div className="checkout-security-tag">
                  <Lock size={14} />
                  <span>Encrypted Direct Order Dispatch</span>
                </div>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* CHECKOUT PAYMENT & ADDRESS SELECTION MODAL */}
      {isPaymentModalOpen && (
        <PaymentModal
          cartItems={cartItems}
          grandTotal={grandTotal}
          qualifiesForBulk={qualifiesForBulk}
          onClose={() => setIsPaymentModalOpen(false)}
          onConfirmOrder={handleConfirmOrder}
        />
      )}

      <Footer />
    </div>
  );
};

export default Cart;