import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import adminService from '../services/adminService';
import shopService from '../services/shopService';
import orderService from '../services/orderService';
import AdminNotifications from '../components/admin/AdminNotifications';
import { Users, Store, ShoppingBag, DollarSign, CheckCircle, XCircle, ShieldCheck, UserCheck, AlertTriangle, RefreshCw, LogOut, CalendarDays } from 'lucide-react';
import AdminEvents from '../components/admin/AdminEvents';
import AdminDonations from '../components/admin/AdminDonations';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  
  const [stats, setStats] = useState(null);
  const [pendingVolunteers, setPendingVolunteers] = useState([]);
  const [allVolunteers, setAllVolunteers] = useState([]);
  const [shops, setShops] = useState([]);
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState(null);
  const [activeTab, setActiveTab] = useState('volunteers'); // 'volunteers' | 'shops' | 'orders' | 'events' | 'donations'
  const [orderFilter, setOrderFilter] = useState('all'); // 'all' | 'bulk' | 'customer'

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, pendingRes, allVolRes, shopsRes, ordersRes] = await Promise.allSettled([
        adminService.getPlatformStats(),
        adminService.getPendingVolunteers(),
        adminService.getVolunteers(),
        shopService.getShops(),
        adminService.getAllOrders(),
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value.success) {
        setStats(statsRes.value.data);
      }
      if (pendingRes.status === 'fulfilled' && pendingRes.value.success) {
        setPendingVolunteers(pendingRes.value.data || []);
      }
      if (allVolRes.status === 'fulfilled' && allVolRes.value.success) {
        setAllVolunteers(allVolRes.value.data || []);
      }
      if (shopsRes.status === 'fulfilled' && shopsRes.value.success) {
        setShops(shopsRes.value.data || []);
      }
      if (ordersRes.status === 'fulfilled' && ordersRes.value.success) {
        setOrders(ordersRes.value.data || []);
      }
    } catch (err) {
      console.error('Error loading admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      setActionMsg({ type: 'success', text: `Order status updated to ${newStatus.toUpperCase()}` });
      fetchData();
    } catch (err) {
      setActionMsg({ type: 'error', text: err.message || 'Failed to update order status' });
    }
    setTimeout(() => setActionMsg(null), 4000);
  };

  // Volunteer Approval / Rejection Action Handler
  const handleVolunteerAction = async (id, status) => {
    try {
      const res = await adminService.updateVolunteerStatus(id, status);
      setActionMsg({ type: 'success', text: `Volunteer status updated to ${status.toUpperCase()}` });
      fetchData();
    } catch (err) {
      setActionMsg({ type: 'error', text: err.message || 'Failed to update volunteer status' });
    }
    setTimeout(() => setActionMsg(null), 4000);
  };

  // Reassign Shop Volunteer
  const handleAssignVolunteer = async (shopId, volunteerId) => {
    try {
      await adminService.assignShopVolunteer(shopId, volunteerId || null);
      setActionMsg({ type: 'success', text: 'Shop volunteer assignment updated!' });
      fetchData();
    } catch (err) {
      setActionMsg({ type: 'error', text: err.message || 'Assignment failed' });
    }
    setTimeout(() => setActionMsg(null), 4000);
  };

  return (
    <div className="admin-dashboard-container">
      
      {/* Top Admin Header */}
      <header className="admin-dash-header">
        <div className="admin-header-brand">
          <div className="admin-logo-badge">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h1>Master Admin Console</h1>
            <p>Welcome back, <strong>{user?.name}</strong> • Platform System Records & Approval Desk</p>
          </div>
        </div>

        <div className="admin-header-actions">
          {/* Admin Weekly Feedback & System Notifications Component */}
          <AdminNotifications />

          <button className="btn-refresh" onClick={fetchData} title="Refresh Data">
            <RefreshCw size={16} />
            Sync Data
          </button>

          <button className="btn-logout-admin" onClick={logout}>
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </header>

      {/* Action Notification Alert */}
      {actionMsg && (
        <div className={`admin-action-alert ${actionMsg.type}`}>
          <span>{actionMsg.text}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="admin-nav-tabs">
        <button 
          className={`tab-btn ${activeTab === 'volunteers' ? 'active' : ''}`}
          onClick={() => setActiveTab('volunteers')}
        >
          <UserCheck size={18} />
          Volunteer Approval Desk
          {pendingVolunteers.length > 0 && (
            <span className="tab-badge">{pendingVolunteers.length}</span>
          )}
        </button>

        <button 
          className={`tab-btn ${activeTab === 'shops' ? 'active' : ''}`}
          onClick={() => setActiveTab('shops')}
        >
          <Store size={18} />
          Platform Shops ({shops.length})
        </button>

        <button 
          className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          <ShoppingBag size={18} />
          Platform Orders ({orders.length})
        </button>

        <button
          className={`tab-btn ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => setActiveTab('events')}
        >
          <CalendarDays size={18} />
          Events Desk
        </button>

        <button
          className={`tab-btn ${activeTab === 'donations' ? 'active' : ''}`}
          onClick={() => setActiveTab('donations')}
        >
          <DollarSign size={18} />
          Donations
        </button>
      </div>

      {/* Main Content Area */}
      <div className="admin-content-section">

        {activeTab === 'events' && <AdminEvents onAction={(message) => { setActionMsg(message); setTimeout(() => setActionMsg(null), 4000); }} />}
        {activeTab === 'donations' && <AdminDonations onAction={(message) => { setActionMsg(message); setTimeout(() => setActionMsg(null), 4000); }} />}

        {/* TAB 1: VOLUNTEER APPROVAL DESK */}
        {activeTab === 'volunteers' && (
          <div className="approval-desk-wrapper">
            <div className="desk-header">
              <h2>Pending Volunteer Applications ({pendingVolunteers.length})</h2>
              <p>Review candidate applications and approve or reject access to zone shop management.</p>
            </div>

            {loading ? (
              <div className="loading-state">Loading volunteer applications...</div>
            ) : pendingVolunteers.length === 0 ? (
              <div className="empty-desk-card">
                <CheckCircle size={40} className="empty-icon" />
                <h3>No Pending Applications</h3>
                <p>All volunteer registrations have been processed.</p>
              </div>
            ) : (
              <div className="applications-grid">
                {pendingVolunteers.map((vol) => (
                  <div key={vol._id} className="applicant-card">
                    <div className="applicant-top">
                      <div className="applicant-avatar">
                        {vol.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3>{vol.name}</h3>
                        <span className="city-pill">{vol.city} Zone</span>
                      </div>
                    </div>

                    <div className="applicant-details">
                      <p><strong>Email:</strong> {vol.email}</p>
                      <p><strong>Contact:</strong> {vol.contactNumber}</p>
                      <p><strong>Applied Date:</strong> {new Date(vol.createdAt).toLocaleDateString()}</p>
                    </div>

                    <div className="applicant-actions">
                      <button 
                        className="btn-approve"
                        onClick={() => handleVolunteerAction(vol._id, 'approved')}
                      >
                        <CheckCircle size={16} />
                        Approve Application
                      </button>
                      
                      <button 
                        className="btn-reject"
                        onClick={() => handleVolunteerAction(vol._id, 'rejected')}
                      >
                        <XCircle size={16} />
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Approved Volunteers Table */}
            <div className="desk-header" style={{ marginTop: '40px' }}>
              <h2>Active / All Volunteers List ({allVolunteers.length})</h2>
            </div>

            <div className="admin-table-wrapper">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Contact</th>
                    <th>City / Zone</th>
                    <th>Status</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {allVolunteers.map((v) => (
                    <tr key={v._id}>
                      <td><strong>{v.name}</strong></td>
                      <td>{v.email}</td>
                      <td>{v.contactNumber}</td>
                      <td>{v.city}</td>
                      <td>
                        <span className={`status-pill ${v.status}`}>{v.status.toUpperCase()}</span>
                      </td>
                      <td>{new Date(v.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: PLATFORM SHOPS */}
        {activeTab === 'shops' && (
          <div className="shops-desk-wrapper">
            <div className="desk-header">
              <h2>All Registered Shops ({shops.length})</h2>
              <p>Assign community volunteers to shops and track shop activity.</p>
            </div>

            <div className="admin-table-wrapper">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Shop Name</th>
                    <th>Owner / Contact</th>
                    <th>City / Zone</th>
                    <th>Address</th>
                    <th>Assigned Volunteer</th>
                    <th>Last Updated</th>
                    <th>Assign Action</th>
                  </tr>
                </thead>
                <tbody>
                  {shops.map((s) => (
                    <tr key={s._id}>
                      <td><strong>{s.name}</strong></td>
                      <td>
                        <div className="font-semibold text-stone-900">{s.ownerName || s.owner || 'N/A'}</div>
                        <div className="sub-text">{s.contactNumber || s.contact || s.phone || 'N/A'}</div>
                      </td>
                      <td>{s.city}</td>
                      <td>{s.address}</td>
                      <td>
                        {s.volunteer ? (
                          <span className="vol-assigned">{s.volunteer.name}</span>
                        ) : (
                          <span className="unassigned">Unassigned</span>
                        )}
                      </td>
                      <td>{s.lastUpdated ? new Date(s.lastUpdated).toLocaleDateString() : 'N/A'}</td>
                      <td>
                        <select 
                          className="assign-select"
                          value={s.volunteer?._id || ''}
                          onChange={(e) => handleAssignVolunteer(s._id, e.target.value)}
                        >
                          <option value="">-- Assign Volunteer --</option>
                          {allVolunteers.filter(v => v.status === 'approved').map((vol) => (
                            <option key={vol._id} value={vol._id}>
                              {vol.name} ({vol.city})
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: PLATFORM ORDERS */}
        {activeTab === 'orders' && (() => {
          const bulkOrdersCount = orders.filter((o) => o.orderType === 'bulk' || o.placedBy === 'volunteer').length;
          const customerOrdersCount = orders.filter((o) => o.orderType !== 'bulk' && o.placedBy !== 'volunteer').length;

          const displayOrders = orders.filter((o) => {
            const isVolBulk = o.orderType === 'bulk' || o.placedBy === 'volunteer';
            if (orderFilter === 'bulk') return isVolBulk;
            if (orderFilter === 'customer') return !isVolBulk;
            return true;
          });

          return (
            <div className="orders-desk-wrapper">
              <div className="desk-header">
                <h2>Platform Orders ({orders.length})</h2>
                <p>Monitor customer retail orders and volunteer shop bulk orders across all zones.</p>
              </div>

              {/* Order Filter Tabs */}
              <div className="order-filter-tabs">
                <button
                  className={`filter-tab-btn ${orderFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setOrderFilter('all')}
                >
                  All Orders ({orders.length})
                </button>
                <button
                  className={`filter-tab-btn ${orderFilter === 'bulk' ? 'active' : ''}`}
                  onClick={() => setOrderFilter('bulk')}
                >
                  Bulk / Volunteer Orders ({bulkOrdersCount})
                </button>
                <button
                  className={`filter-tab-btn ${orderFilter === 'customer' ? 'active' : ''}`}
                  onClick={() => setOrderFilter('customer')}
                >
                  Customer Orders ({customerOrdersCount})
                </button>
              </div>

              <div className="admin-table-wrapper">
                <table className="admin-data-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Target Shop</th>
                      <th>Placed By</th>
                      <th>Order Type</th>
                      <th>Total Amount</th>
                      <th>Status Action</th>
                      <th>Date & Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayOrders.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '30px' }}>
                          No orders match the selected filter criterion.
                        </td>
                      </tr>
                    ) : (
                      displayOrders.map((o) => {
                        const isVolunteer = o.placedBy === 'volunteer' || o.customer?.role === 'volunteer';
                        const shopName = o.shop?.name ? `${o.shop.name} (${o.shop.city || 'Zone'})` : 'Direct Storefront';
                        const placedByName = isVolunteer
                          ? `Volunteer: ${o.customer?.name || 'Volunteer'}`
                          : `Customer: ${o.customer?.name || 'Customer'}`;

                        return (
                          <tr key={o._id}>
                            <td><code>#{o._id.slice(-6).toUpperCase()}</code></td>
                            <td>
                              <strong>{shopName}</strong>
                              {o.shop?.address && <div className="sub-text">{o.shop.address}</div>}
                            </td>
                            <td>
                              <div className={`placed-by-badge ${isVolunteer ? 'volunteer' : 'customer'}`}>
                                {placedByName}
                              </div>
                              {o.customer?.contactNumber && (
                                <div className="sub-text">{o.customer.contactNumber}</div>
                              )}
                            </td>
                            <td>
                              <span className={`order-type-badge ${o.orderType === 'bulk' ? 'bulk' : 'normal'}`}>
                                {o.orderType === 'bulk' ? 'BULK WHOLESALE' : 'RETAIL ORDER'}
                              </span>
                            </td>
                            <td><strong>₹{o.totalAmount.toLocaleString()}</strong></td>
                            <td>
                              <select
                                className={`status-select ${o.status}`}
                                value={o.status || 'pending'}
                                onChange={(e) => handleUpdateOrderStatus(o._id, e.target.value)}
                              >
                                <option value="pending">PENDING</option>
                                <option value="processing">PROCESSING</option>
                                <option value="dispatched">DISPATCHED</option>
                                <option value="shipped">SHIPPED</option>
                                <option value="delivered">DELIVERED</option>
                                <option value="cancelled">CANCELLED</option>
                              </select>
                            </td>
                            <td>{new Date(o.createdAt).toLocaleString()}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })()}

      </div>

    </div>
  );
};

export default AdminDashboard;
