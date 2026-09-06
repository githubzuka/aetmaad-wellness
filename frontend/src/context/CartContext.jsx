import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem('ashva_cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch {
      return [];
    }
  });

  // Sync cart state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('ashva_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  /**
   * Add item to cart or increment quantity if already exists
   */
  const addToCart = useCallback((product, quantity = 1, options = {}) => {
    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item._id === product._id);
      const extractedShopId = product.shopId || (typeof product.shop === 'object' ? product.shop?._id : product.shop) || null;
      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
          shopId: updated[existingIndex].shopId || extractedShopId,
          ...options,
        };
        return updated;
      } else {
        return [
          ...prevItems,
          {
            _id: product._id,
            name: product.name,
            retailPrice: product.retailPrice || 1500,
            bulkPrice: product.bulkPrice || 1200,
            image: product.image || '/images/enquinemix.png',
            shop: product.shop,
            shopId: extractedShopId,
            quantity: quantity,
            ...options,
          },
        ];
      }
    });
  }, []);

  /**
   * Update quantity of a specific item
   */
  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) => (item._id === productId ? { ...item, quantity } : item))
    );
  }, []);

  /**
   * Remove item from cart
   */
  const removeFromCart = useCallback((productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item._id !== productId));
  }, []);

  /**
   * Clear all items from cart
   */
  const clearCart = useCallback(() => {
    setCartItems([]);
    localStorage.removeItem('ashva_cart');
  }, []);

  // Compute total item count
  const totalItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Subtotal calculations with bulk pricing logic (e.g. >= 5 units qualifies for bulk price)
  const cartSubtotal = cartItems.reduce((sum, item) => {
    const unitPrice = item.quantity >= 5 ? (item.bulkPrice || item.retailPrice * 0.8) : item.retailPrice;
    return sum + unitPrice * item.quantity;
  }, 0);

  const value = {
    cartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalItemCount,
    cartSubtotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
