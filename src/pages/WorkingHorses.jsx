import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ImpactSection from '../components/ImpactSection';
import FeedingGuidelines from '../components/FeedingGuidelines';
import { Heart, ShieldCheck, Award, Users, CheckCircle2, ArrowRight } from 'lucide-react';
import './WorkingHorses.css';

const WorkingHorses = () => {
  return (
    <div className="page-wrapper">
      <Header />

      {/* Hero Banner */}
      <section className="initiative-hero-banner">
        <div className="initiative-banner-container">
          <span className="initiative-tag">ASHVA COMMUNITY MISSION</span>
          <h1>Working Horses Initiative</h1>
          <p>
            Dedicated to improving health, stamina, nutrition, rescue care, and clean water access for working mules and horses across rural and urban communities.
          </p>

          <div className="initiative-cta-row">
            <Link to="/donate" className="btn-init-donate">
              <Heart size={18} />
              Support & Donate Now
            </Link>

            <Link to="/products" className="btn-init-feed">
              Order Feed & Nutrition
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Key Mission Pillars */}
      <section className="pillars-section">
        <div className="pillars-container">
          <div className="pillar-card">
            <div className="pillar-icon"><ShieldCheck size={28} /></div>
            <h3>Daily Nutrition Mixes</h3>
            <p>Formulated with essential vitamins and natural proteins to prevent exhaustion and joint decay in working animals.</p>
          </div>

          <div className="pillar-card">
            <div className="pillar-icon"><Users size={28} /></div>
            <h3>Community Volunteers</h3>
            <p>Empowering local village volunteers to monitor horse health, maintain distribution points, and manage shop stock.</p>
          </div>

          <div className="pillar-card">
            <div className="pillar-icon"><Award size={28} /></div>
            <h3>Veterinary & Care Support</h3>
            <p>Partnering with certified veterinary experts to deliver hoof care, emergency medical aid, and shelter assistance.</p>
          </div>
        </div>
      </section>

      {/* Embedded Impact & Guidelines Sections */}
      <ImpactSection />
      <FeedingGuidelines />

      <Footer />
    </div>
  );
};

export default WorkingHorses;
