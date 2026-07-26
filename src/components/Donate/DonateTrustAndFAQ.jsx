import React, { useState } from 'react';
import './DonateTrustAndFAQ.css';

const DonateTrustAndFAQ = () => {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqData = [
    {
      question: 'Is my donation tax-deductible under 80G?',
      answer: 'Yes! All donations made to Aetmaad Wellness / Working Horses Initiative are eligible for tax deduction under Section 80G of the Income Tax Act. A formal tax receipt will be emailed to you after payment verification.',
    },
    {
      question: 'How do I get my tax receipt after paying via GPay / UPI?',
      answer: 'Once you complete your payment via QR code or UPI, fill out the donor modal form with your name, email, and PAN number. Our team verifies the transaction and sends the receipt to your registered email within 24-48 hours.',
    },
    {
      question: 'Can I set up a recurring monthly donation?',
      answer: 'Yes! You can toggle to "Monthly Support" on our donation options. If using direct UPI, you can also set up an AutoPay mandate inside Google Pay, PhonePe, or Paytm.',
    },
    {
      question: 'Is my personal and payment data secure?',
      answer: 'Absolutely. We do not store any sensitive banking credentials. All payments are processed directly through bank-grade UPI protocols on your own payment app.',
    },
  ];

  const breakdownData = [
    {
      amount: '₹500',
      title: 'Emergency Nutrition',
      description: 'Provides 1 week of high-energy feed, clean water, and supplements for a rescued equine.',
    },
    {
      amount: '₹1,500',
      title: 'Veterinary Medical Kit',
      description: 'Covers essential wound dressings, antibiotics, vaccines, and pain relief medication.',
    },
    {
      amount: '₹5,000',
      title: 'Full Rescue & Rehabilitation',
      description: 'Funds comprehensive medical care, shelter, and full rehabilitation for an injured working horse.',
    },
  ];

  return (
    <section className="donate-extra-section">
      {/* --- 1. TAX & TRANSPARENCY BANNER --- */}
      <div className="donate-transparency-banner">
        <div className="transparency-card">
          <div className="transparency-icon">🛡️</div>
          <div className="transparency-content">
            <h3>100% Secure & Tax Deductible</h3>
            <p>
              Your contributions are tax-exempt under <strong>Section 80G</strong>. 
              We maintain full financial transparency with audited annual reports.
            </p>
          </div>
        </div>
      </div>

      {/* --- 2. WHERE YOUR MONEY GOES --- */}
      <div className="donate-breakdown-container">
        <div className="section-header">
          <h2>Where Your Money Goes</h2>
          <p>Every rupee directly impacts animal welfare and community healthcare.</p>
        </div>

        <div className="breakdown-grid">
          {breakdownData.map((item, idx) => (
            <div key={idx} className="breakdown-card">
              <div className="breakdown-amount">{item.amount}</div>
              <h4>{item.title}</h4>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* --- 3. FREQUENTLY ASKED QUESTIONS --- */}
      <div className="donate-faq-container">
        <div className="section-header">
          <h2>Frequently Asked Questions</h2>
          <p>Have questions about donating or tax receipts?</p>
        </div>

        <div className="faq-accordion">
          {faqData.map((faq, idx) => (
            <div 
              key={idx} 
              className={`faq-item ${openFaq === idx ? 'open' : ''}`}
              onClick={() => toggleFaq(idx)}
            >
              <div className="faq-question">
                <span>{faq.question}</span>
                <span className="faq-icon">{openFaq === idx ? '−' : '+'}</span>
              </div>
              {openFaq === idx && (
                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DonateTrustAndFAQ;