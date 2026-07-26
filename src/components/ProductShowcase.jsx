// src/components/ProductShowcase.jsx
import React from 'react';
import './ProductShowcase.css';

const ProductShowcase = () => {
  const benefits = [
    "Improves energy & endurance",
    "Supports better digestion & nutrient absorption",
    "Strengthens immunity & overall health",
    "Promotes strong hooves & healthy coat",
    "Supports muscle strength & performance"
  ];

  return (
    <section className="product-showcase-section">
      <div className="product-showcase-container">
        
        {/* Left Column: Uncropped Product Container */}
        <div className="showcase-media-side">
          <div className="product-image-card">
            <img 
              src="/images/enquinemix.png" 
              alt="Aetmaad Equine Nutrition Mix" 
              className="product-showcase-img"
            />
          </div>
        </div>

        {/* Right Column: High-End Content */}
        <div className="showcase-content-side">
          <span className="showcase-badge">DAILY SUPPLEMENT</span>
          <h2 className="showcase-brand-title">Equine Nutrition Mix</h2>
          <p className="showcase-brand-tagline">Natural Nutrition. Stronger Every Day.</p>
          
          <p className="showcase-brand-description">
            A scientifically designed nutritional supplement made with natural ingredients that helps working horses maintain energy, stamina, immunity, digestive health, strong hooves and a healthy coat.
          </p>

          <ul className="showcase-benefits-stack">
            {benefits.map((benefit, idx) => (
              <li className="benefit-stack-item" key={idx}>
                <div className="check-icon-circle">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span className="benefit-item-text">{benefit}</span>
              </li>
            ))}
          </ul>

          <button className="btn-shop-showcase">
            Shop Now
            <svg className="shop-cart-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          </button>
        </div>

      </div>
    </section>
  );
};

export default ProductShowcase;