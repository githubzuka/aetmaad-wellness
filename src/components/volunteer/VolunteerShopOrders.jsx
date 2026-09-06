import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingBag, RefreshCw, AlertCircle, Clock, MapPin } from 'lucide-react';
import orderService from '../../services/orderService';

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
    switch (s) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Pending
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 border border-sky-200">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></span>
            Processing
          </span>
        );
      case 'dispatched':
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
            Dispatched
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Delivered
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-700 border border-neutral-200">
            {s.toUpperCase()}
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-sm">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-neutral-100">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
            <ShoppingBag className="text-emerald-700" size={22} />
            <span>Shop Orders History</span>
          </h2>
          <p className="text-xs text-neutral-500 font-medium mt-0.5">
            Tracking bulk nutrition and supply orders placed by you for registered shops.
          </p>
        </div>

        <button
          onClick={() => fetchVolunteerOrders(false)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 font-medium text-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw size={13} />
          <span>Refresh List</span>
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-sm font-medium text-neutral-500 animate-pulse">
          Loading shop order records...
        </div>
      ) : orders.length === 0 ? (
        <div className="py-12 text-center bg-neutral-50/70 rounded-2xl border border-dashed border-neutral-200 p-8">
          <ShoppingBag size={40} className="mx-auto text-neutral-300 mb-3" />
          <h3 className="text-base font-bold text-neutral-800">No Bulk Orders Placed Yet</h3>
          <p className="text-xs text-neutral-500 max-w-md mx-auto mt-1">
            Click "Order for Shop Directly" on any assigned shop card to place wholesale feed orders.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-neutral-200/80">
          <table className="w-full text-left text-xs text-neutral-700">
            <thead className="bg-neutral-50/90 text-neutral-900 font-bold uppercase text-[11px] tracking-wider border-b border-neutral-200">
              <tr>
                <th className="py-3.5 px-4">Order ID</th>
                <th className="py-3.5 px-4">Shop & Location</th>
                <th className="py-3.5 px-4">Order Date</th>
                <th className="py-3.5 px-4">Item Summary</th>
                <th className="py-3.5 px-4">Total Amount</th>
                <th className="py-3.5 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {orders.map((order) => {
                const shopName = order.shop?.name || 'Assigned Shop';
                const shopCity = order.shop?.city || '';
                const orderDate = new Date(order.createdAt).toLocaleString();

                return (
                  <tr key={order._id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-neutral-900">
                      #{order._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-neutral-900">{shopName}</div>
                      {shopCity && (
                        <div className="text-[11px] text-neutral-500 flex items-center gap-1 mt-0.5">
                          <MapPin size={11} className="text-rose-500" />
                          {shopCity}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4 text-neutral-500 font-medium">
                      <div className="flex items-center gap-1">
                        <Clock size={12} className="text-neutral-400" />
                        <span>{orderDate}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="font-medium text-neutral-800">
                            {item.name || 'ASHVA Equine Mix'} <span className="text-neutral-500 font-normal">x {item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-extrabold text-sm text-emerald-900">
                        ₹{order.totalAmount?.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      {getStatusBadge(order.status)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};

export default VolunteerShopOrders;
