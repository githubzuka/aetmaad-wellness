import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import orderService from '../services/orderService';
import { ShoppingBag, Clock, CheckCircle2, Truck, AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import './MyOrders.css';

const MyOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setError(null);
    try {
      const res = await orderService.getMyOrders();
      if (res && res.success && Array.isArray(res.data)) {
        setOrders(res.data);
      } else if (Array.isArray(res?.data)) {
        setOrders(res.data);
      } else if (Array.isArray(res)) {
        setOrders(res);
      } else {
        setOrders([]);
      }
    } catch (err) {
      if (!isSilent) {
        setError(err.response?.data?.message || err.message || 'Failed to load order history.');
        setOrders([]);
      }
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders(false);

    // 12-second polling interval for live order status synchronization
    const pollInterval = setInterval(() => {
      fetchOrders(true);
    }, 12000);

    // Dynamic refetch when window gains focus
    const handleFocus = () => {
      fetchOrders(true);
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchOrders]);

  return (
    <div className="my-orders-page">
      <div className="my-orders-container">
        
        <header className="my-orders-header">
          <div>
            <Link to="/" className="back-link">← Return to Storefront</Link>
            <h1>My Order History & Status</h1>
            <p>Track your standard retail and bulk nutrition orders for <strong>{user?.name}</strong>.</p>
          </div>

          <button className="btn-refresh-orders" onClick={fetchOrders}>
            <RefreshCw size={16} />
            Refresh
          </button>
        </header>

        {error && (
          <div className="orders-error-alert">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="orders-loading">Loading order records...</div>
        ) : orders.length === 0 ? (
          <div className="empty-orders-card">
            <ShoppingBag size={48} className="empty-icon" />
            <h3>No Orders Placed Yet</h3>
            <p>You haven't placed any retail or bulk feed orders yet.</p>
            <Link to="/#products" className="btn-start-shopping">Browse Nutrition Products</Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order._id} className="order-item-card">
                
                <div className="order-card-header">
                  <div>
                    <span className="order-id-tag">ORDER #{order._id.slice(-6).toUpperCase()}</span>
                    <span className="order-date">Placed on {new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="order-header-right">
                    <span className={`order-type-tag ${order.orderType}`}>
                      {order.orderType === 'bulk' ? '📦 BULK WHOLESALE' : '🛒 RETAIL ORDER'}
                    </span>
                    <span className={`order-status-badge ${order.status}`}>
                      {order.status?.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Items List */}
                <div className="order-items-table">
                  {order.items?.map((item, idx) => {
                    const itemName = item.name || item.product?.name || 'ASHVA Equine Nutrition Mix (10kg)';
                    const unitPrice = item.unitPrice || item.price || item.product?.retailPrice || 1500;
                    const itemSubtotal = item.subtotal || (unitPrice * item.quantity);

                    return (
                      <div key={idx} className="order-item-row">
                        <span className="item-name">{itemName}</span>
                        <span className="item-qty">Qty: {item.quantity}</span>
                        <span className="item-price">₹{itemSubtotal.toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Order Footer & Total */}
                <div className="order-card-footer">
                  <div className="payment-status">
                    <span>Payment Status: <strong>{order.paymentStatus?.toUpperCase() || 'COMPLETED'}</strong></span>
                  </div>

                  <div className="order-total-box">
                    <span>Total Amount:</span>
                    <strong className="total-price">₹{order.totalAmount}</strong>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default MyOrders;
