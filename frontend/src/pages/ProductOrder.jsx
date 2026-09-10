import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import productService from '../services/productService';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ShoppingBag, ArrowLeft, Plus, Minus, Check, Sparkles, ShieldCheck, Truck, Package } from 'lucide-react';
import './ProductOrder.css';

const ProductOrder = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [orderNote, setOrderNote] = useState('');
  const [addedSuccess, setAddedSuccess] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await productService.getProductById(productId);
        if (res.success && res.data) {
          setProduct(res.data);
        } else {
          throw new Error('Product not found');
        }
      } catch (err) {
        console.error('Failed to load product by ID:', err);
        // Fallback product details if ID fails or is default
        setProduct({
          _id: productId || 'default-equine-mix',
          name: 'ASHVA Equine Nutrition Mix (10kg)',
          description: 'Natural daily nutritional supplement specially formulated to improve stamina, digestion, immunity, hoof strength, and coat health for working and performance horses.',
          retailPrice: 1500,
          bulkPrice: 1200,
          image: '/images/enquinemix.png',
          stock: 200,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleQuantityChange = (delta) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <Header />
        <div className="loading-container">Loading product details...</div>
        <Footer />
      </div>
    );
  }

  if (!product) return null;

  // Real-Time Subtotal Engine Logic: Bulk pricing threshold (>= 5 units)
  const isBulkTier = quantity >= 5;
  const unitPrice = isBulkTier ? product.bulkPrice : product.retailPrice;
  const subtotal = unitPrice * quantity;
  const retailSubtotal = product.retailPrice * quantity;
  const savings = isBulkTier ? retailSubtotal - subtotal : 0;

  const handleAddToCart = () => {
    addToCart(product, quantity, { isBulkTier, orderNote });
    setAddedSuccess(true);
    setTimeout(() => {
      navigate('/cart');
    }, 800);
  };

  return (
    <div className="page-wrapper">
      <Header />

      <main className="product-order-container">
        
        <Link to="/products" className="back-catalog-link">
          <ArrowLeft size={16} /> Back to Products Catalog
        </Link>

        <div className="order-grid">
          
          {/* Left Column: Product Image Frame */}
          <div className="product-media-column">
            <div className="large-image-frame">
              <img
                src={product.image || '/images/enquinemix.png'}
                alt={product.name}
                className="main-product-img"
              />
            </div>

            <div className="product-perks-stack">
              <div className="perk-item">
                <ShieldCheck size={20} className="perk-icon" />
                <span>100% Natural Organic Blend</span>
              </div>
              <div className="perk-item">
                <Truck size={20} className="perk-icon" />
                <span>Fast Zone Delivery to Local Shops</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Order Configurator */}
          <div className="product-details-column">
            <span className="category-badge">FORMULATED DAILY SUPPLEMENT</span>
            <h1 className="product-main-title">{product.name}</h1>
            
            <p className="product-main-desc">{product.description}</p>

            {/* Pricing Tiers Box */}
            <div className="pricing-tiers-box">
              <div className={`tier-card ${!isBulkTier ? 'active' : ''}`}>
                <span className="tier-label">Retail Rate (1-4 Bags)</span>
                <span className="tier-price">₹{product.retailPrice} / bag</span>
              </div>

              <div className={`tier-card bulk ${isBulkTier ? 'active' : ''}`}>
                <div className="tier-badge-row">
                  <Sparkles size={14} />
                  <span>Bulk Wholesale Tier (5+ Bags)</span>
                </div>
                <span className="tier-price gold">₹{product.bulkPrice} / bag</span>
              </div>
            </div>

            {/* Live Savings Alert Banner */}
            {isBulkTier && (
              <div className="savings-alert-banner">
                <Sparkles size={18} />
                <span><strong>Bulk Discount Unlocked!</strong> You save ₹{savings.toLocaleString()} on this order!</span>
              </div>
            )}

            {/* Interactive Quantity Selector */}
            <div className="quantity-selector-section">
              <label>Select Quantity (Bags):</label>
              
              <div className="quantity-controls">
                <button
                  type="button"
                  className="qty-btn"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  <Minus size={18} />
                </button>

                <input
                  type="number"
                  className="qty-input"
                  min="1"
                  max="500"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                />

                <button
                  type="button"
                  className="qty-btn"
                  onClick={() => handleQuantityChange(1)}
                >
                  <Plus size={18} />
                </button>
              </div>

              {quantity < 5 && (
                <p className="bulk-hint">Add <strong>{5 - quantity} more bag(s)</strong> to unlock ₹{product.bulkPrice}/bag bulk wholesale rate!</p>
              )}
            </div>

            {/* Real-Time Subtotal Engine Card */}
            <div className="subtotal-engine-card">
              <div className="subtotal-row">
                <span>Unit Price Applied:</span>
                <strong>₹{unitPrice} / bag</strong>
              </div>
              <div className="subtotal-row total">
                <span>Calculated Subtotal:</span>
                <span className="grand-subtotal">₹{subtotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Action Button */}
            <button
              className={`btn-add-to-cart-main ${addedSuccess ? 'success' : ''}`}
              onClick={handleAddToCart}
            >
              {addedSuccess ? (
                <>
                  <Check size={20} />
                  Added to Cart! Redirecting...
                </>
              ) : (
                <>
                  <ShoppingBag size={20} />
                  Add to Cart & Proceed
                </>
              )}
            </button>

          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
};

export default ProductOrder;
