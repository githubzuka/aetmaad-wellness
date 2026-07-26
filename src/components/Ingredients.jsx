// src/components/Ingredients.jsx
import React from 'react';
import './Ingredients.css';

const Ingredients = () => {
  const ingredientsList = [
    { id: 1, name: 'Flax Seeds', img: '/images/flax-seeds.png' },
    { id: 2, name: 'Oats', img: '/images/oats.png' },
    { id: 3, name: 'Barley', img: '/images/barley.png' },
    { id: 4, name: 'Mineral Mix', img: '/images/mineral-mix.png' },
    { id: 5, name: 'Herbal Extracts', img: '/images/herbal-extracts.png' },
    { id: 6, name: 'Pink Salt', img: '/images/pink-salt.png' },
    { id: 7, name: 'Vitamins', img: '/images/vitamins.png' },
    { id: 8, name: 'Trace Minerals', img: '/images/trace-minerals.png' }
  ];

  return (
    <section className="ingredients-section">
      <div className="ingredients-container">
        
        {/* Section Header */}
        <div className="ingredients-header">
          <div className="header-divider-wrapper">
            <span className="line-left"></span>
            <h2 className="header-title-text">Natural Ingredients. Maximum Benefits.</h2>
            <span className="line-right"></span>
          </div>
        </div>

        {/* 8-Column Circular Row */}
        <div className="ingredients-grid">
          {ingredientsList.map((item) => (
            <div className="ingredient-card" key={item.id}>
              <div className="ingredient-image-wrapper">
                <img 
                  src={item.img} 
                  alt={item.name} 
                  className="ingredient-img" 
                  onError={(e) => {
                    // Fallback visual background color if image is loading/missing
                    e.target.style.display = 'none';
                    e.target.parentNode.classList.add('fallback-bg');
                  }}
                />
              </div>
              <p className="ingredient-label">{item.name}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Ingredients;