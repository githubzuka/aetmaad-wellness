import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Features from '../components/Features';
import ProductShowcase from '../components/ProductShowcase';
import FeedingGuidelines from '../components/FeedingGuidelines';
import ImpactSection from '../components/ImpactSection';
import UpcomingEvents from '../components/UpcomingEvents';
import Footer from '../components/Footer';

const Home = () => {
  return (
    <div className="app-wrapper">
      <Header />
      <section id="home"><Hero /></section>
      <section id="about"><Features /></section>
      <section id="products"><ProductShowcase /></section>
      <UpcomingEvents />
      <section id="initiative"><ImpactSection /></section>
      <FeedingGuidelines />
      <div id="contact"><Footer /></div>
    </div>
  );
};

export default Home;
