import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingBag, RefreshCw, AlertCircle, Clock, MapPin, Move } from 'lucide-react';
import orderService from '../../services/orderService';
import './VolunteerShopOrders.css'; // Standard CSS Import

const VolunteerShopOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchVolunteerOrders = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setError(null);
    try {
      const res = await orderService.getMyVolunteerOrders();
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
        setError(err.response?.data?.message || err.message || 'Failed to load volunteer shop orders.');
        setOrders([]);
      }
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVolunteerOrders(false);

    const interval = setInterval(() => {
      fetchVolunteerOrders(true);
    }, 15000);

    return () => clearInterval(interval);
  }, [fetchVolunteerOrders]);

  const getStatusBadge = (status) => {
    const s = (status || 'pending').toLowerCase();
    const classMap = {
      pending: 'badge-pending',
      processing: 'badge-processing',
      dispatched: 'badge-dispatched',
      shipped: 'badge-dispatched',
      delivered: 'badge-delivered',
      cancelled: 'badge-cancelled'
    };

    const badgeClass = classMap[s] || 'badge-pending';

    return (
      <span className={`badge ${badgeClass}`}>
        <span className="badge-dot"></span>
        {s.charAt(0).toUpperCase() + s.slice(1)}
      </span>
    );
  };

  return (
  <div className="volunteer-management-container">

      {/* Header */}
      <div className="shop-orders-header">
        <div>
          <h2 className="shop-orders-title">
            <ShoppingBag style={{ color: '#047857' }} size={22} />
            <span>Shop Orders History</span>
          </h2>
          <p className="shop-orders-subtitle">
            Tracking bulk nutrition and supply orders placed by you for registered shops.
          </p>
        </div>

        <button onClick={() => fetchVolunteerOrders(false)} className="btn-refresh">
                          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          <span>Refresh List</span>
        </button>
      </div>

      {error && (
        <div className="error-alert-box">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="loading-state">
          Loading shop order records...
        </div>
      ) : orders.length === 0 ? (
        <div className="empty-state-box">
          <ShoppingBag size={40} className="empty-icon" />
          <h3>No Bulk Orders Placed Yet</h3>
          <p>
            Click "Order for Shop Directly" on any assigned shop card to place wholesale feed orders.
          </p>
        </div>
      ) : (
        <>
          <div className="orders-scroll-hint">
            <Move size={13} /> Swipe sideways to see all columns
          </div>

          {/* Tabular view on every screen size — scrolls horizontally on mobile */}
          <div className="desktop-orders-table">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Shop & Location</th>
                  <th>Order Date</th>
                  <th>Item Summary</th>
                  <th>Total Amount</th>
                  <th style={{ textAlign: 'right' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const shopName = order.shop?.name || 'Assigned Shop';
                  const shopCity = order.shop?.city || '';
                  const orderDate = new Date(order.createdAt).toLocaleString();

                  return (
                    <tr key={order._id}>
                      <td className="order-id-cell">
                        #{order._id.slice(-6).toUpperCase()}
                      </td>
                      <td>
                        <div className="table-shop-name">{shopName}</div>
                        {shopCity && (
                          <div className="table-subtext">
                            <MapPin size={11} style={{ color: '#f43f5e' }} /> {shopCity}
                          </div>
                        )}
                      </td>
                      <td className="table-date-cell">
                        <div className="table-subtext">
                          <Clock size={12} /> {orderDate}
                        </div>
                      </td>
                      <td>
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="table-item-row">
                            {item.name || 'ASHVA Equine Mix'} <span className="table-item-qty">x {item.quantity}</span>
                          </div>
                        ))}
                      </td>
                      <td>
                        <span className="amount-text">₹{order.totalAmount?.toLocaleString()}</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {getStatusBadge(order.status)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

    </div>
  );
};

export default VolunteerShopOrders;