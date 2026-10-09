import { useState, useEffect, useCallback } from 'react';
import shopService from '../services/shopService.js';

/**
 * Custom hook for managing Shop list fetching, filtering, and mutations
 * @param {Object} [initialFilters] - { city: 'Mumbai', search: '' }
 */
export const useShops = (initialFilters = {}) => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);

  const fetchShops = useCallback(async (customParams) => {
    setLoading(true);
    setError(null);
    try {
      const params = customParams || filters;
      const res = await shopService.getShops(params);
      if (res.success) {
        setShops(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch shops');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchShops();
  }, [fetchShops]);

  const addShop = async (shopData) => {
    setError(null);
    try {
      const res = await shopService.createShop(shopData);
      if (res.success) {
        await fetchShops(); // Refresh list
        return res.data;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const editShop = async (id, shopData) => {
    setError(null);
    try {
      const res = await shopService.updateShop(id, shopData);
      if (res.success) {
        await fetchShops(); // Refresh list
        return res.data;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const removeShop = async (id) => {
    setError(null);
    try {
      const res = await shopService.deleteShop(id);
      if (res.success) {
        setShops((prev) => prev.filter((s) => s._id !== id));
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    shops,
    loading,
    error,
    filters,
    setFilters,
    refetchShops: fetchShops,
    addShop,
    editShop,
    removeShop,
  };
};

export default useShops;
