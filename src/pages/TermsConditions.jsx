import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, ShieldCheck, Scale, AlertTriangle, RefreshCw, Mail } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './LegalPage.css';

const LAST_UPDATED = 'October 2026';

const TermsConditions = () => (
  <div className="page-wrapper legal-page-wrapper">
    <Header />

    <section className="legal-hero">
      <div className="legal-hero-inner">
        <span className="legal-hero-tag">LEGAL</span>
        <h1>Terms &amp; Conditions</h1>
        <p>
          The rules that govern your use of the ASHVA Wellness platform, including our
          nutrition products, community shop network, volunteer programme and donations.
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
            <div className="legal-card-icon blue"><FileText size={20} /></div>
            <h2>1. Acceptance of These Terms</h2>
          </div>
          <p>
            By accessing or using the ASHVA Wellness website, placing an order, registering an
            account, applying to become a volunteer, or making a donation, you agree to be bound
            by these Terms &amp; Conditions and by our Privacy Policy. If you do not agree with any
            part of these terms, please do not use the platform.
          </p>
          <p>
            These terms apply to all visitors, registered customers, volunteers, shop partners and
            administrators who access the platform.
          </p>
        </section>

        <section className="legal-card">
          <div className="legal-card-head">
            <div className="legal-card-icon green"><ShieldCheck size={20} /></div>
            <h2>2. Our Mission &amp; Products</h2>
          </div>
          <p>
            ASHVA Wellness is dedicated to improving the health and welfare of working horses
            through natural nutrition and community support. We supply equine nutrition mixes
            through our own storefront and through a network of registered community shops and
            approved volunteers.
          </p>
          <ul className="legal-list">
            <li>Product descriptions, weights and packaging are indicative and may be refined over time.</li>
            <li>Nutrition products are supplements and are not a substitute for veterinary treatment.</li>
            <li>For any medical concern affecting an animal, always consult a qualified veterinarian.</li>
          </ul>
        </section>

        <section className="legal-card">
          <div className="legal-card-head">
            <div className="legal-card-icon amber"><Scale size={20} /></div>
            <h2>3. Orders, Pricing &amp; Payment</h2>
          </div>
          <p>
            Prices shown on the platform are in Indian Rupees (₹) and may change without prior
            notice. Bulk and wholesale pricing is available to approved volunteers and community
            shop partners and is displayed where applicable.
          </p>
          <ul className="legal-list">
            <li>An order is confirmed only after it has been successfully recorded on our platform.</li>
            <li>We may cancel or refuse an order where stock is unavailable, details are incorrect, or fraud is suspected.</li>
            <li>Cash on Delivery (COD) and online payment options are offered where available.</li>
            <li>Delivery timelines are estimates and may vary by city, zone and availability.</li>
          </ul>
        </section>

        <section className="legal-card">
          <div className="legal-card-head">
            <div className="legal-card-icon green"><ShieldCheck size={20} /></div>
            <h2>4. Accounts &amp; Volunteer Programme</h2>
          </div>
          <p>
            You are responsible for keeping your login credentials confidential and for all
            activity that occurs under your account. You agree to provide accurate information
            when registering.
          </p>
          <ul className="legal-list">
            <li>Volunteer applications are reviewed and must be approved by an administrator before access to the Volunteer Desk is granted.</li>
            <li>Approved volunteers may register shops in their assigned city zone and submit weekly shop updates.</li>
            <li>Volunteers must submit accurate weekly feedback for shops they are responsible for.</li>
            <li>We may suspend or revoke access where information is found to be false, misleading or misused.</li>
          </ul>
        </section>

        <section className="legal-card">
          <div className="legal-card-head">
            <div className="legal-card-icon amber"><AlertTriangle size={20} /></div>
            <h2>5. Acceptable Use &amp; Prohibited Activity</h2>
          </div>
          <p>
            You agree not to misuse the platform. The following are strictly prohibited and may be
            reported and acted upon, including suspension of your account and notification of the
            relevant authorities:
          </p>
          <ul className="legal-list">
            <li>Attempting to gain unauthorised access to any account, dashboard or database.</li>
            <li>Submitting false, fraudulent or misleading information or shop feedback.</li>
            <li>Interfering with, overloading or probing the security of our systems.</li>
            <li>Using automated tools to scrape, bulk-register or abuse the platform.</li>
            <li>Impersonating an administrator, volunteer, shop partner or another customer.</li>
          </ul>
          <p className="legal-note">
            All such activity is logged and surfaced to our administrators in real time.
          </p>
        </section>

        <section className="legal-card">
          <div className="legal-card-head">
            <div className="legal-card-icon blue"><FileText size={20} /></div>
            <h2>6. Donations</h2>
          </div>
          <p>
            Donations made through the platform support the welfare, nutrition and care of working
            horses. Donations are voluntary and non-refundable once processed. Where a donation
            receipt is requested, we will issue one against the details you provide.
          </p>
        </section>

        <section className="legal-card">
          <div className="legal-card-head">
            <div className="legal-card-icon green"><ShieldCheck size={20} /></div>
            <h2>7. Limitation of Liability</h2>
          </div>
          <p>
            The platform and its content are provided on an “as is” and “as available” basis. To
            the extent permitted by law, ASHVA Wellness is not liable for any indirect, incidental
            or consequential loss arising from your use of the platform, from reliance on any
            information provided, or from temporary unavailability of the service.
          </p>
        </section>

        <section className="legal-card">
          <div className="legal-card-head">
            <div className="legal-card-icon amber"><RefreshCw size={20} /></div>
            <h2>8. Changes to These Terms</h2>
          </div>
          <p>
            We may update these Terms &amp; Conditions from time to time. The “last updated” date at
            the top of this page will reflect any change. Continued use of the platform after an
            update constitutes acceptance of the revised terms.
          </p>
        </section>

        <section className="legal-card">
          <div className="legal-card-head">
            <div className="legal-card-icon blue"><Mail size={20} /></div>
            <h2>9. Contact Us</h2>
          </div>
          <p>
            For any question about these Terms &amp; Conditions, please reach us through our{' '}
            <Link to="/contact" className="legal-inline-link">Contact page</Link>.
          </p>
        </section>
      </div>
    </main>

    <Footer />
  </div>
);

export default TermsConditions;
