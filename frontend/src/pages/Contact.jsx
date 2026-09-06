import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Mail, Phone, MapPin, Send, CheckCircle2, MessageSquare } from 'lucide-react';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="page-wrapper">
      <Header />

      <section className="contact-hero-banner">
        <div className="contact-banner-container">
          <span className="contact-tag">GET IN TOUCH</span>
          <h1>Contact ASHVA Wellness</h1>
          <p>Have questions about equine nutrition, bulk shop distribution, or volunteer initiatives? We are here to help.</p>
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
                <p>Thank you for reaching out to ASHVA Wellness. Our team will respond to <strong>{formData.email}</strong> within 24 hours.</p>
                <button className="btn-send-another" onClick={() => setSubmitted(false)}>Send Another Message</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-form">
                <h2>Send Us a Message</h2>

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
                  <label>Subject</label>
                  <input
                    type="text"
                    placeholder="e.g. Bulk Shop Order Query / Volunteer Interest"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  />
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

                <button type="submit" className="btn-submit-contact">
                  <Send size={16} />
                  Send Inquiry
                </button>
              </form>
            )}
          </div>

          {/* Right Column: Contact Info Cards */}
          <div className="contact-info-column">
            
            <div className="info-card">
              <div className="info-icon"><Mail size={22} /></div>
              <div>
                <h3>Support & Order Inquiries</h3>
                <p>support@aetmaad-wellness.org</p>
                <p>orders@aetmaad-wellness.org</p>
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon"><Phone size={22} /></div>
              <div>
                <h3>Helpline & Volunteer Desk</h3>
                <p>+91 (022) 2890-4321</p>
                <p>Mon - Sat: 9:00 AM - 7:00 PM IST</p>
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon"><MapPin size={22} /></div>
              <div>
                <h3>Headquarters & Research Unit</h3>
                <p>ASHVA Equine Wellness Initiative</p>
                <p>Community Distribution Center, Zone 4, India</p>
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
