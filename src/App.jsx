// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import ProductShowcase from './components/ProductShowcase';
import Ingredients from './components/Ingredients';
import FeedingGuidelines from './components/FeedingGuidelines';
import ImpactSection from './components/ImpactSection';
import Footer from './components/Footer';

// Pages
import Donate from './pages/Donate';
import Cart from './pages/Cart'; // Imported Cart page

import './App.css';

// Main Home / Landing Page View
const Home = () => (
  <div className="app-wrapper">
    <Header />

    <section id="home">
      <Hero />
    </section>

    <section id="about">
      <Features />
    </section>

    <section id="products">
      <ProductShowcase />
    </section>

    <section id="ingredients">
      <Ingredients />
    </section>

    <FeedingGuidelines />

    <section id="initiative">
      <ImpactSection />
    </section>

    <div id="contact">
      <Footer />
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* Main single-page landing */}
        <Route path="/" element={<Home />} />

        {/* Donate Page route */}
        <Route path="/donate" element={<Donate />} />

        {/* Cart Page route */}
        <Route path="/cart" element={<Cart />} />
      </Routes>
    </Router>
  );
}

export default App;