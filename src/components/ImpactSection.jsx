// src/components/ImpactSection.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Heart, HeartHandshake } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import './ImpactSection.css';

const ImpactSection = () => {
  const navigate = useNavigate(); // Hook for programmatic navigation
  const [impactStats, setImpactStats] = useState(null);
  const [statsStatus, setStatsStatus] = useState('loading');

  const handleDonateClick = () => {
    navigate('/donate'); // Navigates to the /donate page
  };

  useEffect(() => {
    let isMounted = true;

    const loadImpactStats = async () => {
      try {
        const response = await axiosClient.get('/api/impact/stats');
        if (isMounted && response.data?.success) {
          setImpactStats(response.data.data);
          setStatsStatus('live');
        }
      } catch (error) {
        if (isMounted) setStatsStatus('fallback');
      }
    };

    loadImpactStats();
    return () => { isMounted = false; };
  }, []);

  const stats = impactStats
    ? [
        { number: impactStats.volunteers, label: 'Approved Volunteers' },
        { number: impactStats.shops, label: 'Community Shops' },
        { number: impactStats.products, label: 'Nutrition Products' },
        { number: impactStats.orders, label: 'Orders Supported' },
      ]
    : [
        { number: '24', label: 'Approved Volunteers' },
        { number: '18', label: 'Community Shops' },
        { number: '6', label: 'Nutrition Products' },
        { number: '258', label: 'Orders Supported' },
      ];

  return (
    <section className="impact-section">
      <div className="impact-container">
        
        {/* Main Hero Card */}
        <div className="impact-hero-card">
          {/* Solid Left Green Content Block */}
          <div className="impact-content-block">
            <span className="impact-sub-tag">MAKE AN IMPACT</span>
            <h2 className="impact-heading">
              Help a Working Horse Live a Better Life
            </h2>
            <p className="impact-text">
              Your support helps provide nutrition, medical care, rescue, shelter and clean water to working horses in need.
            </p>
            <button className="btn-donate-impact" onClick={handleDonateClick}>
              Donate Now <Heart size={15} aria-hidden="true" />
            </button>
          </div>

          {/* Right Image Block with Feathered Left Edge */}
          <div className="impact-image-block">
            <img 
              src="/images/impacts.png"
              alt="Help a Working Horse" 
              className="impact-photo"
            />
          </div>
        </div>

        {/* 2x2 Stats Grid */}
        <div className="impact-stats-grid" aria-live="polite">
          {stats.map((stat, idx) => (
            <div className="stat-box" key={idx}>
              <h3 className="stat-number">{stat.number}</h3>
              <p className="stat-label">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className={`impact-data-status ${statsStatus}`}>
          <span className="impact-status-dot" aria-hidden="true" />
          {statsStatus === 'live' ? 'Live community impact data' : statsStatus === 'loading' ? 'Loading latest impact data' : 'Impact data will update when the database is available'}
        </div>

        <div className="volunteer-invite-card">
          <div className="volunteer-invite-icon">
            <HeartHandshake size={22} />
          </div>
          <div className="volunteer-invite-copy">
            <span className="volunteer-invite-tag">JOIN THE INITIATIVE</span>
            <h3>Help your local working horses</h3>
            <p>Become a volunteer and support nutrition, shop coordination, and care in your city.</p>
          </div>
          <Link to="/volunteer" state={{ mode: 'apply' }} className="volunteer-invite-link">
            Apply Now
            <ArrowRight size={17} />
          </Link>
        </div>

      </div>
    </section>
  );
};

export default ImpactSection;