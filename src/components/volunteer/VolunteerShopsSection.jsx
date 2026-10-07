import React, { useState, useEffect, useCallback } from 'react';
import { 
  Store, 
  ShoppingBag, 
  RefreshCw, 
  AlertCircle, 
  Clock, 
  MapPin, 
  Package, 
  User, 
  Calendar, 
  PlusCircle, 
  MessageSquare, 
  Edit3, 
  Trash2 
} from 'lucide-react';
import orderService from '../../services/orderService';
import './VolunteerShopOrders.css';

const VolunteerShopOrders = ({ 
  assignedShops = [
    {
      _id: '1',
      name: 'abc',
      address: '97/I, Naya nagar, morland road, Mumbai',
      ownerName: 'xyz',
      contactPhone: '+917715079304',
      updatedAt: '2026-09-25T00:00:00.000Z'
    }
  ],
  onOrderDirectly = () => {},
  onWeeklyFeedback = () => {},
  onEditShop = () => {},
  onDeleteShop = () => {}
}) => {
  const [activeTab, setActiveTab] = useState('shops'); // 'shops' | 'orders'
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch shop order records
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

  // Status Badge Helper
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
      
      {/* Tab Navigation Header */}
      <div className="tabs-header">
        <button 
          className={`tab-btn ${activeTab === 'shops' ? 'active' : ''}`}
          onClick={() => setActiveTab('shops')}
        >
          <Store size={18} />
          <span>Assigned City Shops ({assignedShops.length})</span>
        </button>

        <button 
          className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          <ShoppingBag size={18} />
          <span>Shop Orders History</span>
        </button>
      </div>

      {/* TAB 1: Assigned City Shops */}
      {activeTab === 'shops' && (
        <div className="tab-content-section">
          <div className="section-title-bar">
            <h2>Assigned City Shops ({assignedShops.length})</h2>
          </div>

          {assignedShops.length === 0 ? (
            <div className="empty-state-box">
              <Store size={40} className="empty-icon" />
              <h3>No Shops Assigned</h3>
              <p>You currently do not have any shops assigned to your zone.</p>
            </div>
          ) : (
            <div className="shops-grid">
              {assignedShops.map((shop) => (
                <div key={shop._id} className="shop-card">
                  {/* Shop Card Header */}
                  <div className="shop-card-header">
                    <div className="shop-title-area">
                      <div className="shop-avatar-icon">
                        <Store size={20} />
                      </div>
                      <h3 className="shop-name">{shop.name}</h3>
                    </div>
                    <div className="shop-header-actions">
                      <button 
                        className="btn-icon-action" 
                        title="Edit Shop"
                        onClick={() => onEditShop(shop)}
                      >
                        <Edit3 size={15} />
                      </button>
                      <button 
                        className="btn-icon-action danger" 
                        title="Delete Shop"
                        onClick={() => onDeleteShop(shop._id)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Shop Details */}
                  <div className="shop-card-body">
                    <div className="shop-info-row">
                      <MapPin size={15} className="info-icon pin-icon" />
                      <span>{shop.address || 'Address not specified'}</span>
                    </div>

                    <div className="shop-info-row">
                      <User size={15} className="info-icon" />
                      <span>
                        Owner / Contact: <strong>{shop.ownerName || 'N/A'}</strong> ({shop.contactPhone || 'No contact'})
                      </span>
                    </div>

                    <div className="shop-info-row">
                      <Calendar size={15} className="info-icon" />
                      <span>
                        Last Updated: {new Date(shop.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Shop Card Actions */}
                  <div className="shop-card-footer">
                    <button 
                      className="btn-shop-action primary"
                      onClick={() => onOrderDirectly(shop)}
                    >
                      <PlusCircle size={15} />
                      <span>Order for Shop Directly</span>
                    </button>

                    <button 
                      className="btn-shop-action secondary"
                      onClick={() => onWeeklyFeedback(shop)}
                    >
                      <MessageSquare size={15} />
                      <span>Weekly Feedback</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Shop Orders History */}
      {activeTab === 'orders' && (
        <div className="tab-content-section">
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
            <div className="loading-state">Loading shop order records...</div>
          ) : orders.length === 0 ? (
            <div className="empty-state-box">
              <ShoppingBag size={40} className="empty-icon" />
              <h3>No Bulk Orders Placed Yet</h3>
              <p>Click "Order for Shop Directly" on any assigned shop card to place wholesale feed orders.</p>
            </div>
          ) : (
            <>
              {/* Mobile View */}
              <div className="mobile-orders-list">
                {orders.map((order) => {
                  const shopName = order.shop?.name || 'Assigned Shop';
                  const shopCity = order.shop?.city || '';
                  const orderDate = new Date(order.createdAt).toLocaleString();

                  return (
                    <div key={order._id} className="order-card-mobile">
                      <div className="order-card-header">
                        <span className="order-id">#{order._id.slice(-6).toUpperCase()}</span>
                        {getStatusBadge(order.status)}
                      </div>

                      <div>
                        <div className="mobile-shop-name">{shopName}</div>
                        <div className="mobile-shop-meta">
                          {shopCity && (
                            <span className="meta-item">
                              <MapPin size={12} style={{ color: '#f43f5e' }} /> {shopCity}
                            </span>
                          )}
                          <span className="meta-item">
                            <Clock size={12} /> {orderDate}
                          </span>
                        </div>
                      </div>

                      <div className="order-items-box">
                        <div className="items-box-label">
                          <Package size={12} /> ITEMS
                        </div>
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="item-row">
                            <span>{item.name || 'ASHVA Equine Mix'}</span>
                            <span className="item-qty">x {item.quantity}</span>
                          </div>
                        ))}
                      </div>

                      <div className="mobile-card-footer">
                        <span>Total Amount</span>
                        <span className="amount-text">₹{order.totalAmount?.toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop Table View */}
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
                          <td style={{ fontFamily: 'monospace', fontWeight: '700' }}>
                            #{order._id.slice(-6).toUpperCase()}
                          </td>
                          <td>
                            <div style={{ fontWeight: '700', color: '#171717' }}>{shopName}</div>
                            {shopCity && (
                              <div className="table-subtext">
                                <MapPin size={11} style={{ color: '#f43f5e' }} /> {shopCity}
                              </div>
                            )}
                          </td>
                          <td style={{ color: '#737373' }}>
                            <div className="table-subtext">
                              <Clock size={12} /> {orderDate}
                            </div>
                          </td>
                          <td>
                            {order.items?.map((item, idx) => (
                              <div key={idx} style={{ fontWeight: '500', color: '#262626' }}>
                                {item.name || 'ASHVA Equine Mix'} <span style={{ color: '#737373', fontWeight: '400' }}>x {item.quantity}</span>
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
                      )}
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

    </div>
  );
};

export default VolunteerShopOrders;