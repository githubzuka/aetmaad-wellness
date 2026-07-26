// src/pages/Donate.jsx
import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import DonateHero from '../components/Donate/DonateHero';
import DonateImpact from '../components/Donate/DonateImpact';
import DonateFAQ from '../components/Donate/DonateFAQ';

const Donate = () => {
  return (
    <div className="donate-page-wrapper">
      <Header />
      <main>
        <DonateHero />
        <DonateImpact />
        <DonateFAQ />
      </main>
      <Footer />
    </div>
  );
};

export default Donate;