import React from 'react';
import { Store, MapPin, User, Calendar, ShoppingCart, MessageSquarePlus, Edit3, Trash2 } from 'lucide-react';

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
    <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between w-full max-w-sm">
      <div>
        {/* Header / Icon */}
        <div className="flex items-start gap-3.5 mb-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Store size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-bold text-neutral-900 tracking-tight leading-snug truncate">
              {shop.name}
            </h3>
            <p className="text-xs text-neutral-500 font-medium flex items-center gap-1 mt-0.5 truncate">
              <MapPin size={13} className="text-rose-500 shrink-0" />
              <span>{shop.address}, {shop.city}</span>
            </p>
          </div>
        </div>

        {/* Info Box (Owner & Last Updated) */}
        <div className="bg-neutral-50/70 rounded-xl p-3 my-4 space-y-2 border border-neutral-100 text-xs">
          <div className="flex items-center text-neutral-700 font-medium truncate">
            <User size={14} className="text-neutral-400 mr-2 shrink-0" />
            <span className="text-neutral-500 mr-1">Owner / Contact:</span>
            <strong className="font-semibold text-neutral-900 truncate">
              {ownerName}
            </strong>
            <span className="text-neutral-500 ml-1">({contactNumber})</span>
          </div>

          <div className="flex items-center text-neutral-700 font-medium">
            <Calendar size={14} className="text-neutral-400 mr-2 shrink-0" />
            <span className="text-neutral-500 mr-1">Last Updated:</span>
            <span className="text-neutral-800 font-semibold mr-1.5">{formattedDate}</span>
            
            <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
              updateInfo.isStale 
                ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${updateInfo.isStale ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
              {updateInfo.text}
            </span>
          </div>
        </div>
      </div>

      {/* Actions & Buttons */}
      <div className="space-y-2.5 pt-2 border-t border-neutral-100">
        <button
          onClick={() => onOrderDirectly && onOrderDirectly(shop)}
          className="w-full py-2.5 px-4 bg-emerald-900 hover:bg-emerald-800 active:scale-[0.99] text-white font-medium text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <ShoppingCart size={16} />
          <span>Order for Shop Directly</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenFeedback && onOpenFeedback(shop)}
            className="flex-1 py-2 px-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-medium text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-neutral-200/60 cursor-pointer"
          >
            <MessageSquarePlus size={14} className="text-amber-700" />
            <span>Weekly Feedback</span>
          </button>

          {canEdit && onEdit && (
            <button
              onClick={() => onEdit(shop)}
              className="p-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl border border-neutral-200/60 transition-colors cursor-pointer"
              title="Edit Shop"
            >
              <Edit3 size={15} />
            </button>
          )}

          {canEdit && onDelete && (
            <button
              onClick={() => onDelete(shop._id)}
              className="p-2 text-neutral-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl border border-neutral-200/60 transition-colors cursor-pointer"
              title="Delete Shop"
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
