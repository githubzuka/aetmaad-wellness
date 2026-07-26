// src/pages/Cart.jsx
import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CartContent from '../components/Cart/CartContent'; 

const Cart = () => {
  return (
    <div className="cart-page-wrapper">
      <Header />
      <main>
        <CartContent />
      </main>
      <Footer />
    </div>
  );
};

export default Cart;