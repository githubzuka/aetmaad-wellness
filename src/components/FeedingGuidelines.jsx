import React from 'react';
import './FeedingGuidelines.css';

const FeedingGuidelines = () => {
  const guidelines = [
    {
      phase: "Light Work / Maintenance",
      badge: "Rest & Light Work",
      description: "Ideal for horses in rest, trail riding, or light training schedules.",
      cards: [
        {
          weight: "300 kg",
          category: "Light Weight",
          amount: "150g - 200g",
          frequency: "Split into 2 meals",
          heading: "Light Weight Maintenance",
          hoverTip: "Provides light daily nutritional support suitable for trail horses and rested ponies to maintain healthy energy levels without unwanted weight gain."
        },
        {
          weight: "400 kg",
          category: "Medium Weight",
          amount: "200g - 250g",
          frequency: "Split into 2 meals",
          heading: "Medium Weight Maintenance",
          hoverTip: "Balanced feed portion tailored for leisure horses in regular light exercise, ensuring steady gut health, coat sheen, and sustained energy."
        },
        {
          weight: "500 kg",
          category: "Standard Weight",
          amount: "250g - 300g",
          frequency: "Split into 2 meals",
          heading: "Standard Maintenance Care",
          hoverTip: "Optimal daily baseline dosage for adult pleasure horses in light activity, supporting muscle tone, digestion, and overall metabolic stability."
        },
        {
          weight: "600 kg+",
          category: "Heavy Weight",
          amount: "300g - 350g",
          frequency: "Split into 2 meals",
          heading: "Heavy & Draft Maintenance",
          hoverTip: "Sufficient baseline intake engineered specifically for larger warmbloods and draft breeds requiring core vitality and joint support."
        }
      ]
    },
    {
      phase: "Moderate to Heavy Performance",
      badge: "Active Performance",
      description: "Engineered for active competition, intensive training, or heavy workload.",
      cards: [
        {
          weight: "300 kg",
          category: "Light Weight",
          amount: "250g - 300g",
          frequency: "Split into 2-3 meals",
          heading: "Light Performance Boost",
          hoverTip: "Targeted high-metabolism replenishment for active light breeds, fueling cellular repair, muscular endurance, and quick post-workout recovery."
        },
        {
          weight: "400 kg",
          category: "Medium Weight",
          amount: "300g - 400g",
          frequency: "Split into 2-3 meals",
          heading: "Medium Athletic Support",
          hoverTip: "Enhanced nutrition formula designed for performance horses in daily training, optimizing muscle recovery, stamina, and electrolyte balance."
        },
        {
          weight: "500 kg",
          category: "Standard Weight",
          amount: "400g - 500g",
          frequency: "Split into 2-3 meals",
          heading: "Standard Peak Performance",
          hoverTip: "Heavy-duty nutritional support ideal for competition jumping, dressage, and eventing to maintain peak athletic condition and strength."
        },
        {
          weight: "600 kg+",
          category: "Heavy Weight",
          amount: "500g - 600g",
          frequency: "Split into 2-3 meals",
          heading: "Heavy Workload Recovery",
          hoverTip: "Maximum metabolic support and high nutrient density engineered for large draft working horses subjected to strenuous physical demand."
        }
      ]
    }
  ];

  return (
    <section className="feeding-section">
      <div className="feeding-container">
        
        {/* Aesthetic Header */}
        <div className="feeding-header">
          <div className="header-divider-wrapper">
            <span className="line-left"></span>
            <h2 className="header-title-text">Feeding Guidelines</h2>
            <span className="line-right"></span>
          </div>
          <p className="feeding-subtitle">
            Optimized daily intake tailored specifically to your horse's activity level and body weight.
          </p>
        </div>

        {/* Main Grid Section */}
        <div className="feeding-phases-wrapper">
          {guidelines.map((group, groupIdx) => (
            <div className="feeding-phase-block" key={groupIdx}>
              
              <div className="phase-header-inline">
                <span className="panel-badge">{group.badge}</span>
                <h3 className="phase-title">{group.phase}</h3>
                <p className="phase-desc">{group.description}</p>
              </div>

              {/* Responsive Mini Cards Grid */}
              <div className="cards-grid">
                {group.cards.map((card, cardIdx) => (
                  <div className="horse-card" key={cardIdx} tabIndex={0}>
                    
                    {/* Default Card View */}
                    <div className="horse-card-header">
                      <span className="horse-weight">{card.weight}</span>
                      <span className="horse-category">{card.category}</span>
                    </div>

                    <div className="horse-card-body">
                      <div className="amount-display">
                        <span className="amount-number">{card.amount}</span>
                        <span className="per-day">/ day</span>
                      </div>
                      <div className="frequency-pill">
                        <svg className="clock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        <span>{card.frequency}</span>
                      </div>
                    </div>

                    {/* Smooth Light Hover Overlay */}
                    <div className="card-hover-info">
                      <div className="hover-badge-tag">Guidelines</div>
                      <h4 className="hover-heading">{card.heading}</h4>
                      <p className="hover-text">{card.hoverTip}</p>
                    </div>

                  </div>
                ))}
              </div>

            </div>
          ))}
        </div>

        {/* Advisory Banner */}
        <div className="advisory-panel">
          <div className="advisory-accent-dot"></div>
          <p className="advisory-message">
            <strong>Important Advisory:</strong> Always introduce new wellness supplements gradually over a period of 7–10 days. Ensure consistent access to clean, fresh water at all times.
          </p>
        </div>

      </div>
    </section>
  );
};

export default FeedingGuidelines;