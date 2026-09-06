import { useState, useEffect, useCallback } from 'react';
import orderService from '../services/orderService.js';

export const useOrders = (autoFetch = true) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(autoFetch);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await orderService.getMyOrders();
      if (res.success) {
        setOrders(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchOrders();
    }
  }, [autoFetch, fetchOrders]);

  const placeOrder = async (orderPayload) => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await orderService.createOrder(orderPayload);
      if (res.success) {
        if (autoFetch) await fetchOrders();
        return res.data;
      }
    } catch (err) {
      setError(err.message || 'Order placement failed');
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const placeVolunteerOrder = async (orderPayload) => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await orderService.createVolunteerOrder(orderPayload);
      if (res.success) {
        if (autoFetch) await fetchOrders();
        return res.data;
      }
    } catch (err) {
      setError(err.message || 'Volunteer order placement failed');
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (orderId, status) => {
    setError(null);
    try {
      const res = await orderService.updateOrderStatus(orderId, status);
      if (res.success) {
        setOrders((prev) =>
          prev.map((ord) => (ord._id === orderId ? { ...ord, status: res.data.status } : ord))
        );
        return res.data;
      }
    } catch (err) {
      setError(err.message || 'Failed to update order status');
      throw err;
    }
  };

  return {
    orders,
    loading,
    submitting,
    error,
    refetchOrders: fetchOrders,
    placeOrder,
    placeVolunteerOrder,
    updateStatus,
  };
};

export default useOrders;
