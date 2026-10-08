import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Database, Lock, UserCheck, Cookie, RefreshCw, Mail, Scale } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './LegalPage.css';

const LAST_UPDATED = 'October 2026';

const PrivacyPolicy = () => (
  <div className="page-wrapper legal-page-wrapper">
    <Header />

    <section className="legal-hero">
      <div className="legal-hero-inner">
        <span className="legal-hero-tag">LEGAL</span>
        <h1>Privacy Policy</h1>
        <p>
          How ASHVA Wellness collects, uses, stores and protects your personal information across
          our storefront, volunteer programme and donation platform.
        </p>
        <span className="legal-updated">
          <RefreshCw size={13} /> Last updated: {LAST_UPDATED}
        </span>
      </div>
    </section>

    <main className="legal-main">
      <div className="legal-back-row">
        <Link to="/" className="legal-back-btn">
          <ArrowLeft size={15} /> Back to Home
        </Link>
      </div>

      <div className="legal-content">
        <section className="legal-card">
          <div className="legal-card-head">
            <div className="legal-card-icon green"><ShieldCheck size={20} /></div>
            <h2>1. Our Commitment</h2>
          </div>
          <p>
            Your privacy matters to us. This policy explains what information we collect, why we
            collect it, how we use it, and the choices you have. We only collect what we genuinely
            need to deliver our equine nutrition products, coordinate community shops, and manage
            our volunteer and donation programmes.
          </p>
        </section>

        <section className="legal-card">
          <div className="legal-card-head">
            <div className="legal-card-icon blue"><Database size={20} /></div>
            <h2>2. Information We Collect</h2>
          </div>
          <ul className="legal-list">
            <li><strong>Account details:</strong> your name, email address, contact number, city/zone and address.</li>
            <li><strong>Order details:</strong> items purchased, quantities, order totals, payment method and delivery information.</li>
            <li><strong>Volunteer details:</strong> your city zone, application status, registered shops and the weekly shop feedback you submit.</li>
            <li><strong>Donation details:</strong> donor name, email, phone number, PAN (where provided for a receipt) and donation amount.</li>
            <li><strong>Messages you send us:</strong> content of contact enquiries, event proposals and replies exchanged with our admin team.</li>
            <li><strong>Technical information:</strong> your browser type, device information, and security logs such as login attempts and IP address.</li>
          </ul>
        </section>

        <section className="legal-card">
          <div className="legal-card-head">
            <div className="legal-card-icon amber"><Scale size={20} /></div>
            <h2>3. How We Use Your Information</h2>
          </div>
          <ul className="legal-list">
            <li>To create and manage your account and verify your identity.</li>
            <li>To process, fulfil and deliver your orders, and to handle customer support.</li>
            <li>To review volunteer applications and coordinate shop activity in your city zone.</li>
            <li>To issue donation receipts and maintain accurate contribution records.</li>
            <li>To notify you about upcoming events, order status changes and admin messages.</li>
            <li>To detect, investigate and prevent fraudulent, abusive or malicious activity.</li>
            <li>To improve the platform and understand how it is used.</li>
          </ul>
          <p className="legal-note">
            We do <strong>not</strong> sell your personal information to third parties.
          </p>
        </section>

        <section className="legal-card">
          <div className="legal-card-head">
            <div className="legal-card-icon green"><Lock size={20} /></div>
            <h2>4. How We Protect Your Data</h2>
          </div>
          <ul className="legal-list">
            <li>Passwords are one-way hashed and are never stored or displayed in plain text.</li>
            <li>Access to dashboards is restricted by role — customers, volunteers and administrators each see only what they are permitted to see.</li>
            <li>All authenticated requests require a signed access token that expires automatically.</li>
            <li>Repeated failed logins and suspicious traffic are rate-limited and logged.</li>
            <li>Suspicious or malicious activity is surfaced to our administrators in real time.</li>
          </ul>
        </section>

        <section className="legal-card">
          <div className="legal-card-head">
            <div className="legal-card-icon blue"><UserCheck size={20} /></div>
            <h2>5. Your Rights</h2>
          </div>
          <p>You have the right to:</p>
          <ul className="legal-list">
            <li>Access the personal information we hold about you.</li>
            <li>Request correction of inaccurate or incomplete information.</li>
            <li>Request deletion of your account and associated data, subject to legal record-keeping obligations.</li>
            <li>Withdraw consent for non-essential communications at any time.</li>
          </ul>
          <p>
            To exercise any of these rights, please reach out through our{' '}
            <Link to="/contact" className="legal-inline-link">Contact page</Link> or contact us by email.
          </p>
        </section>

        <section className="legal-card">
          <div className="legal-card-head">
            <div className="legal-card-icon amber"><Cookie size={20} /></div>
            <h2>6. Cookies &amp; Local Storage</h2>
          </div>
          <p>
            We use your browser’s local storage to keep you signed in and to remember your session
            between page reloads. We do not use this to track you across other websites. Analytics,
            where enabled, is used in aggregate form only.
          </p>
        </section>

        <section className="legal-card">
          <div className="legal-card-head">
            <div className="legal-card-icon green"><Lock size={20} /></div>
            <h2>7. Data Retention</h2>
          </div>
          <p>
            We retain your information for as long as your account remains active, and for as long
            as necessary to comply with legal, tax and accounting obligations relating to orders
            and donations. Security logs are retained for a limited period for investigation
            purposes.
          </p>
        </section>

        <section className="legal-card">
          <div className="legal-card-head">
            <div className="legal-card-icon blue"><RefreshCw size={20} /></div>
            <h2>8. Changes to This Policy</h2>
          </div>
          <p>
            We may update this Privacy Policy from time to time. Any change will be reflected by the
            “last updated” date at the top of this page. We encourage you to review this page
            periodically.
          </p>
        </section>

        <section className="legal-card">
          <div className="legal-card-head">
            <div className="legal-card-icon amber"><Mail size={20} /></div>
            <h2>9. Contact Us</h2>
          </div>
          <p>
            If you have any question about this Privacy Policy or how your data is handled, please
            reach us through our <Link to="/contact" className="legal-inline-link">Contact page</Link>{' '}
            and our team will respond promptly.
          </p>
        </section>
      </div>
    </main>

    <Footer />
  </div>
);

export default PrivacyPolicy;
