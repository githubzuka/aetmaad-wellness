import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BackToHome from '../components/common/BackToHome';
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle, Loader2, MessageCircle } from 'lucide-react';

// lucide-react in this project does not export an Instagram icon, so use an inline SVG.
const InstagramIcon = ({ size = 22 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);
import contactService from '../services/contactService';
import './Contact.css';

const CATEGORIES = [
  { value: 'general', label: 'General Enquiry' },
  { value: 'order', label: 'Order / Product' },
  { value: 'volunteer', label: 'Volunteer Programme' },
  { value: 'donation', label: 'Donation' },
  { value: 'complaint', label: 'Complaint / Feedback' },
];

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    category: 'general',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await contactService.submitContact(formData);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Could not send your message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setFormData({ name: '', email: '', phone: '', subject: '', category: 'general', message: '' });
  };

  return (
    <div className="page-wrapper">
      <Header />
      <BackToHome title="Contact Us" />

      <section className="contact-hero-banner">
        <div className="contact-banner-container">
          <span className="contact-tag">GET IN TOUCH</span>
          <h1>Contact ASHVA Wellness</h1>          <p>Have questions about equine nutrition, bulk shop distribution, or volunteer initiatives? We are here to help.</p>
        </div>
      </section>

      <main className="contact-main-container">
        <div className="contact-grid">

          {/* Left Column: Contact Form */}
          <div className="contact-form-card">
            {submitted ? (
              <div className="contact-success-state">
                <CheckCircle2 size={48} className="success-icon" />
                <h2>Message Received!</h2>
                <p>Thank you for reaching out to ASHVA Wellness. Our admin team has been notified and will respond to <strong>{formData.email}</strong> within 24 hours.</p>
                <button className="btn-send-another" onClick={resetForm}>Send Another Message</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-form">
                <h2>Send Us a Message</h2>

                {error && (
                  <div className="contact-form-alert" role="alert">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                  </div>
                )}

                <div className="form-group">
                  <label>Your Full Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Vikram Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="contact-field-row">
                  <div className="form-group">
                    <label>Email Address *</label>
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Contact Number</label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="contact-field-row">
                  <div className="form-group">
                    <label>Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Subject</label>
                    <input
                      type="text"
                      placeholder="e.g. Bulk Shop Order Query"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Message *</label>
                  <textarea
                    rows="4"
                    placeholder="Write your message here..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                  />
                </div>

                <button type="submit" className="btn-submit-contact" disabled={loading}>
                  {loading ? <Loader2 size={16} className="contact-spin" /> : <Send size={16} />}
                  {loading ? 'Sending…' : 'Send Inquiry'}
                </button>
              </form>
            )}
          </div>

          {/* Right Column: Contact Info Cards */}
          <div className="contact-info-column">

            <div className="info-card">
              <div className="info-icon"><Mail size={22} /></div>
              <div>
                <h3>Support &amp; Order Inquiries</h3>
                <p><a href="mailto:enquinemix@gmail.com">enquinemix@gmail.com</a></p>
                <p>We reply within 24 hours</p>
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon"><Phone size={22} /></div>
              <div>
                <h3>Helpline &amp; Volunteer Desk</h3>
                <p><a href="tel:+918422060195">+91 84220 60195</a></p>
                <p>Mon - Sat: 9:00 AM - 7:00 PM IST</p>
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon"><MessageCircle size={22} /></div>
              <div>
                <h3>WhatsApp</h3>
                <p><a href="https://wa.me/918422060195" target="_blank" rel="noopener noreferrer">+91 84220 60195</a></p>
                <p>Quickest way to reach us</p>
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon"><InstagramIcon size={22} /></div>
              <div>
                <h3>Instagram</h3>
                <p>
                  <a href="https://www.instagram.com/ashva_enquinemix?psln=MWtobDJqZHlnczVhN" target="_blank" rel="noopener noreferrer">
                    @ashva_enquinemix
                  </a>
                </p>
                <p>Follow our journey</p>
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon"><MapPin size={22} /></div>
              <div>
                <h3>Headquarters &amp; Research Unit</h3>
                <p>ASHVA Equine Wellness Initiative</p>
              </div>
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
