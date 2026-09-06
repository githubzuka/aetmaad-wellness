import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import shopService from '../services/shopService';
import orderService from '../services/orderService';
import ShopCard from '../components/volunteer/ShopCard';
import WeeklyFeedbackModal from '../components/volunteer/WeeklyFeedbackModal';
import VolunteerShopOrders from '../components/volunteer/VolunteerShopOrders';
import { MapPin, Store, Plus, AlertTriangle, CheckCircle, Clock, LogOut, RefreshCw, X, Package, ShoppingBag } from 'lucide-react';
import './VolunteerDashboard.css';

const VolunteerDashboard = () => {
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState('shops'); // 'shops' | 'orders'
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState(null);

  // Shop Form Modal state (Add / Edit)
  const [isShopModalOpen, setIsShopModalOpen] = useState(false);
  const [editingShopId, setEditingShopId] = useState(null);
  const [shopFormData, setShopFormData] = useState({
    name: '',
    address: '',
    city: user?.city || '',
    contactNumber: '',
    ownerName: '',
  });

  // Direct Shop Order Modal State
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [targetShop, setTargetShop] = useState(null);
  const [orderFormData, setOrderFormData] = useState({
    quantity: 5,
    orderType: 'bulk', // 'normal' | 'bulk'
    notes: '',
  });

  // Weekly Feedback Modal State
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackTargetShop, setFeedbackTargetShop] = useState(null);

  const volunteerCity = user?.city || 'Mumbai';

  const fetchShops = async () => {
    setLoading(true);
    try {
      const res = await shopService.getShops({ city: volunteerCity });
      if (res.success) {
        setShops(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching volunteer shops:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  // Calculate shops needing weekly updates (lastUpdated > 7 days ago)
  const staleShops = shops.filter((shop) => {
    if (!shop.lastUpdated) return true;
    const daysSinceUpdate = (Date.now() - new Date(shop.lastUpdated).getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceUpdate >= 7;
  });

  // Open Modal for Add/Edit Shop
  const openAddShopModal = () => {
    setEditingShopId(null);
    setShopFormData({
      name: '',
      address: '',
      city: volunteerCity,
      contactNumber: '',
      ownerName: '',
    });
    setIsShopModalOpen(true);
  };

  const openEditShopModal = (shop) => {
    setEditingShopId(shop._id);
    setShopFormData({
      name: shop.name,
      address: shop.address,
      city: shop.city,
      contactNumber: shop.contactNumber || shop.contact || shop.phone || '',
      ownerName: shop.ownerName || shop.owner || '',
    });
    setIsShopModalOpen(true);
  };

  // Submit Add/Edit Shop Form
  const handleSaveShop = async (e) => {
    e.preventDefault();
    try {
      if (editingShopId) {
        await shopService.updateShop(editingShopId, shopFormData);
        setActionMsg({ type: 'success', text: `Shop "${shopFormData.name}" updated successfully!` });
      } else {
        await shopService.createShop(shopFormData);
        setActionMsg({ type: 'success', text: `New shop "${shopFormData.name}" registered in ${volunteerCity} zone!` });
      }
      setIsShopModalOpen(false);
      fetchShops();
    } catch (err) {
      setActionMsg({ type: 'error', text: err.message || 'Failed to save shop.' });
    }
    setTimeout(() => setActionMsg(null), 4000);
  };

  // Open Weekly Feedback Modal
  const openFeedbackModal = (shop) => {
    setFeedbackTargetShop(shop);
    setIsFeedbackModalOpen(true);
  };

  const handleFeedbackSuccess = (updatedTimestamp) => {
    setActionMsg({
      type: 'success',
      text: `Weekly feedback submitted for ${feedbackTargetShop?.name}. Admin notified & timer reset!`,
    });
    fetchShops();
    setTimeout(() => setActionMsg(null), 4000);
  };

  // Delete Shop Action
  const handleDeleteShop = async (shopId, shopName) => {
    if (!window.confirm(`Are you sure you want to remove "${shopName}"?`)) return;
    try {
      await shopService.deleteShop(shopId);
      setActionMsg({ type: 'success', text: `Shop "${shopName}" removed.` });
      fetchShops();
    } catch (err) {
      setActionMsg({ type: 'error', text: err.message || 'Delete failed.' });
    }
    setTimeout(() => setActionMsg(null), 4000);
  };

  // Open Direct Order Modal
  const openDirectOrderModal = (shop) => {
    setTargetShop(shop);
    setOrderFormData({
      quantity: 5,
      orderType: 'bulk',
      notes: `Direct volunteer order for ${shop.name}`,
    });
    setIsOrderModalOpen(true);
  };

  // Submit Direct Shop Order
  const handlePlaceDirectOrder = async (e) => {
    e.preventDefault();
    if (!targetShop) return;

    const unitPrice = orderFormData.orderType === 'bulk' ? 1200 : 1500;
    const qty = Number(orderFormData.quantity) || 1;

    try {
      await orderService.createVolunteerOrder({
        shopId: targetShop._id,
        orderType: orderFormData.orderType || 'bulk',
        placedBy: 'volunteer',
        items: [
          {
            productId: 'default-equine-mix',
            name: 'ASHVA Equine Nutrition Mix (10kg)',
            quantity: qty,
            price: unitPrice,
          },
        ],
        totalAmount: unitPrice * qty,
        paymentMethod: 'COD',
      });

      setActionMsg({
        type: 'success',
        text: `Direct ${orderFormData.orderType.toUpperCase()} order placed successfully for ${targetShop.name}!`,
      });
      setIsOrderModalOpen(false);
    } catch (err) {
      setActionMsg({ type: 'error', text: err.message || 'Failed to place direct shop order.' });
    }
    setTimeout(() => setActionMsg(null), 4000);
  };

  return (
    <div className="volunteer-dashboard-container">
      
      {/* Top Banner Header */}
      <header className="volunteer-dash-header">
        <div className="volunteer-header-info">
          <div className="volunteer-avatar-badge">
            <Store size={28} />
          </div>
          <div>
            <div className="zone-pill-row">
              <span className="zone-badge">📍 CITY ZONE: {volunteerCity.toUpperCase()}</span>
              <span className="status-badge approved">APPROVED VOLUNTEER</span>
            </div>
            <h1>Volunteer Shop Desk</h1>
            <p>Managing community distribution points in <strong>{volunteerCity}</strong> • Logged in as {user?.name}</p>
          </div>
        </div>

        <div className="volunteer-header-actions">
          <button className="btn-add-shop-main" onClick={openAddShopModal}>
            <Plus size={18} />
            Add New Shop
          </button>

          <button className="btn-logout-vol" onClick={logout}>
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </header>

      {/* Action Notification Alert */}
      {actionMsg && (
        <div className={`volunteer-action-alert ${actionMsg.type}`}>
          <span>{actionMsg.text}</span>
        </div>
      )}

      {/* WEEKLY UPDATE ALERT BANNER */}
      {staleShops.length > 0 && (
        <div className="weekly-update-alert-banner">
          <div className="banner-left">
            <div className="banner-alert-icon">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3>Weekly Update Reminder ({staleShops.length} Shops Pending)</h3>
              <p>The following shops in <strong>{volunteerCity}</strong> haven't had inventory or status updates in over 7 days:</p>
            </div>
          </div>

          <div className="stale-shops-quick-actions">
            {staleShops.map((s) => (
              <button 
                key={s._id} 
                className="btn-quick-update-shop"
                onClick={() => openFeedbackModal(s)}
              >
                <RefreshCw size={14} />
                Feedback for {s.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Zone Overview Cards */}
      <div className="volunteer-metrics-row">
        <div className="metric-box">
          <Store size={22} className="metric-icon" />
          <div>
            <span className="metric-num">{shops.length}</span>
            <span className="metric-lbl">Assigned Shops</span>
          </div>
        </div>

        <div className="metric-box">
          <CheckCircle size={22} className="metric-icon green" />
          <div>
            <span className="metric-num">{shops.length - staleShops.length}</span>
            <span className="metric-lbl">Up-to-Date Shops</span>
          </div>
        </div>

        <div className="metric-box">
          <Clock size={22} className="metric-icon orange" />
          <div>
            <span className="metric-num">{staleShops.length}</span>
            <span className="metric-lbl">Needs Weekly Update</span>
          </div>
        </div>
      </div>

      {/* Main Segmented Tab Navigation Control */}
      <div className="inline-flex p-1 bg-neutral-100 rounded-xl border border-neutral-200/60 mb-6 gap-1">
        <button
          onClick={() => setActiveTab('shops')}
          className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-all cursor-pointer ${
            activeTab === 'shops'
              ? 'bg-white text-neutral-900 font-semibold shadow-xs'
              : 'text-neutral-500 hover:text-neutral-800 font-medium transition-colors'
          }`}
        >
          <Store size={16} className={activeTab === 'shops' ? 'text-emerald-700' : 'text-neutral-400'} />
          <span>Assigned City Shops ({shops.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-all cursor-pointer ${
            activeTab === 'orders'
              ? 'bg-white text-neutral-900 font-semibold shadow-xs'
              : 'text-neutral-500 hover:text-neutral-800 font-medium transition-colors'
          }`}
        >
          <ShoppingBag size={16} className={activeTab === 'orders' ? 'text-emerald-700' : 'text-neutral-400'} />
          <span>Shop Orders History</span>
        </button>
      </div>

      {/* TAB 1: Assigned Shops Grid */}
      {activeTab === 'shops' && (
        <>
          <div className="shops-section-header">
            <h2>Assigned City Shops ({shops.length})</h2>
            <button className="btn-add-shop-secondary" onClick={openAddShopModal}>
              <Plus size={16} />
              Register Shop
            </button>
          </div>

          {loading ? (
            <div className="volunteer-loading">Loading zone shops...</div>
          ) : shops.length === 0 ? (
            <div className="empty-shops-card">
              <Store size={48} className="empty-icon" />
              <h3>No Shops Registered in {volunteerCity}</h3>
              <p>Click "Add New Shop" above to register your first local shop distribution point.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {shops.map((shop) => (
                <ShopCard
                  key={shop._id}
                  shop={shop}
                  onOrderDirectly={openDirectOrderModal}
                  onOpenFeedback={openFeedbackModal}
                  onEdit={openEditShopModal}
                  onDelete={(id) => handleDeleteShop(id, shop.name)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* TAB 2: Volunteer Shop Orders Section */}
      {activeTab === 'orders' && <VolunteerShopOrders />}

      {/* MODAL 1: ADD / EDIT SHOP */}
      {isShopModalOpen && (
        <div className="vol-modal-overlay">
          <div className="vol-modal-card">
            <div className="vol-modal-header">
              <h3>{editingShopId ? 'Edit Shop Information' : 'Register New Local Shop'}</h3>
              <button className="btn-close-modal" onClick={() => setIsShopModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveShop} className="vol-modal-form">
              <div className="form-group">
                <label>Shop Name</label>
                <input
                  type="text"
                  placeholder="e.g. Shop 1 / Royal Equine Feeds"
                  value={shopFormData.name}
                  onChange={(e) => setShopFormData({ ...shopFormData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Owner Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Patel"
                  value={shopFormData.ownerName}
                  onChange={(e) => setShopFormData({ ...shopFormData, ownerName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Contact Number</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={shopFormData.contactNumber}
                  onChange={(e) => setShopFormData({ ...shopFormData, contactNumber: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  placeholder="Shop #12, Station Road"
                  value={shopFormData.address}
                  onChange={(e) => setShopFormData({ ...shopFormData, address: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>City / Zone</label>
                <input
                  type="text"
                  value={shopFormData.city}
                  onChange={(e) => setShopFormData({ ...shopFormData, city: e.target.value })}
                  required
                />
              </div>

              <div className="vol-modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setIsShopModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-save-shop">Save Shop Details</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: DIRECT ORDER FOR SHOP */}
      {isOrderModalOpen && targetShop && (
        <div className="vol-modal-overlay">
          <div className="vol-modal-card">
            <div className="vol-modal-header">
              <h3>Direct Shop Order: {targetShop.name}</h3>
              <button className="btn-close-modal" onClick={() => setIsOrderModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handlePlaceDirectOrder} className="vol-modal-form">
              <div className="target-shop-summary">
                <p>📍 <strong>Shop:</strong> {targetShop.name} ({targetShop.city})</p>
                <p>👤 <strong>Volunteer:</strong> {user?.name}</p>
              </div>

              <div className="form-group">
                <label>Order Mode ("Bulk me order karne ke liye")</label>
                <select
                  value={orderFormData.orderType}
                  onChange={(e) => setOrderFormData({ ...orderFormData, orderType: e.target.value })}
                >
                  <option value="bulk">Bulk Order (Distributor Wholesale Pricing)</option>
                  <option value="normal">Standard Retail Order</option>
                </select>
              </div>

              <div className="form-group">
                <label>Product</label>
                <div className="selected-prod-box">
                  <Package size={20} />
                  <div>
                    <strong>ASHVA Equine Nutrition Mix (10kg Bag)</strong>
                    <span className="price-tag">
                      {orderFormData.orderType === 'bulk' ? '₹1,200/bag (Bulk Rate)' : '₹1,500/bag (Retail Rate)'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Quantity (Bags)</label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={orderFormData.quantity}
                  onChange={(e) => setOrderFormData({ ...orderFormData, quantity: e.target.value })}
                  required
                />
              </div>

              <div className="order-total-preview">
                <span>Total Amount:</span>
                <span className="total-num">
                  ₹{((orderFormData.orderType === 'bulk' ? 1200 : 1500) * Number(orderFormData.quantity)).toLocaleString()}
                </span>
              </div>

              <div className="vol-modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setIsOrderModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-submit-order">Place Order for Shop Now</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: WEEKLY SHOP FEEDBACK */}
      <WeeklyFeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        shop={feedbackTargetShop}
        onSuccess={handleFeedbackSuccess}
      />

    </div>
  );
};

export default VolunteerDashboard;
