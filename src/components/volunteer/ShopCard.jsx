import React from 'react';
import { Store, MapPin, User, Calendar, ShoppingCart, MessageSquarePlus, Edit3, Trash2, AlertTriangle } from 'lucide-react';

const ShopCard = ({
  shop,
  onOrderDirectly,
  onOpenFeedback,
  onEdit,
  onDelete,
  canEdit = true,
}) => {
  if (!shop) return null;

  // Resolve Owner Name with fallbacks
  const ownerName =
    shop.ownerName ||
    shop.owner ||
    (typeof shop.volunteer === 'object' ? shop.volunteer?.name : null) ||
    'N/A';

  // Resolve Contact Number with fallbacks
  const contactNumber =
    shop.contactNumber ||
    shop.contact ||
    shop.phone ||
    (typeof shop.volunteer === 'object' ? shop.volunteer?.contactNumber : null) ||
    'N/A';

  // Calculate days since last updated
  const calculateDaysAgo = (dateString) => {
    if (!dateString) return { days: 0, text: '0 days ago', isStale: false };
    const lastDate = new Date(dateString);
    const diffTime = Math.abs(new Date() - lastDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return {
      days: diffDays,
      text: `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`,
      isStale: diffDays >= 5,
    };
  };

  const updateInfo = calculateDaysAgo(shop.lastUpdated);
  const formattedDate = shop.lastUpdated
    ? new Date(shop.lastUpdated).toLocaleDateString()
    : new Date().toLocaleDateString();

  return (
    <div className={`shop-card ${updateInfo.isStale ? 'is-stale' : ''}`}>
      {updateInfo.isStale && (
        <span className="stale-ribbon">
          <AlertTriangle size={11} /> Needs Update
        </span>
      )}

      <div>
        {/* Header / Icon */}
        <div className="shop-card-top">
          <div className="shop-icon-circle">
            <Store size={22} />
          </div>
          <div className="shop-title-block">
            <h3 className="shop-name">{shop.name}</h3>
            <span className="shop-address">
              <MapPin size={13} className="shop-address-icon" />
              {shop.address}, {shop.city}
            </span>
          </div>
        </div>

        {/* Info Box (Owner & Last Updated) */}
        <div className="shop-meta-list">
          <p className="shop-meta-row">
            <User size={14} className="shop-meta-icon" />
            <span className="shop-meta-label">Owner / Contact:</span>
            <strong className="shop-meta-value">{ownerName}</strong>
            <span className="shop-meta-contact">({contactNumber})</span>
          </p>

          <p className="shop-meta-row">
            <Calendar size={14} className="shop-meta-icon" />
            <span className="shop-meta-label">Last Updated:</span>
            <span className="shop-meta-value">{formattedDate}</span>
            <span className={`update-pill ${updateInfo.isStale ? 'is-stale' : 'is-fresh'}`}>
              <span className="update-pill-dot"></span>
              {updateInfo.text}
            </span>
          </p>
        </div>
      </div>

      {/* Actions & Buttons */}
      <div className="shop-card-actions">
        <button
          type="button"
          onClick={() => onOrderDirectly && onOrderDirectly(shop)}
          className="btn-direct-order"
        >
          <ShoppingCart size={16} />
          <span>Order for Shop Directly</span>
        </button>

        <div className="shop-secondary-btns">
          <button
            type="button"
            onClick={() => onOpenFeedback && onOpenFeedback(shop)}
            className="btn-shop-feedback"
          >
            <MessageSquarePlus size={14} />
            <span>Weekly Feedback</span>
          </button>

          {canEdit && onEdit && (
            <button
              type="button"
              onClick={() => onEdit(shop)}
              className="btn-edit-shop"
              title="Edit Shop"
              aria-label="Edit Shop"
            >
              <Edit3 size={15} />
            </button>
          )}

          {canEdit && onDelete && (
            <button
              type="button"
              onClick={() => onDelete(shop._id)}
              className="btn-remove-shop"
              title="Delete Shop"
              aria-label="Delete Shop"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopCard;
