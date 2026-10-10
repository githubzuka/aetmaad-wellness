import React, { useState } from 'react';
import { Plus, Minus, HelpCircle, MessageCircle, Mail } from 'lucide-react';
import './HomeFAQ.css';

const FAQ_DATA = [
  {
    question: 'What is ASHVA Equine Wellness?',
    answer:
      'ASHVA is a natural equine nutrition and community-care initiative dedicated to improving the health and welfare of working horses through balanced nutrition mixes, volunteer outreach and research.',
  },
  {
    question: 'How do I place an order for the nutrition mix?',
    answer:
      'Browse the Nutrition Mix section, choose a product and add it to your cart. After signing in you can complete the order from checkout, and our team coordinates delivery to your city zone.',
  },
  {
    question: 'Which areas do you deliver to?',
    answer:
      'We deliver across all major cities where our volunteer shop network is active. If your zone is not yet covered, reach out on WhatsApp and we will try to arrange distribution.',
  },
  {
    question: 'How can I become a volunteer?',
    answer:
      'Create an account and choose the Volunteer role at signup. Once our admin team reviews and approves your profile, you get access to the volunteer dashboard to manage shops and weekly feedback.',
  },
  {
    question: 'Is the nutrition mix safe for all working horses?',
    answer:
      'Our mixes are formulated from natural ingredients and are generally well tolerated. We still recommend consulting your veterinarian before any major dietary change, especially for horses with existing conditions.',
  },
  {
    question: 'How can I contact the ASHVA team?',
    answer:
      'You can reach us on WhatsApp or call +91 84220 60195, email enquinemix@gmail.com, message us on Instagram @ashva_enquinemix, or use the Contact Us form on our website.',
  },
];

const HomeFAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (index) => setOpenIndex(openIndex === index ? null : index);

  return (
    <section id="faq" className="home-faq-section">
      <div className="home-faq-container">
        <div className="home-faq-header">
          <span className="home-faq-tag">
            <HelpCircle size={14} /> SUPPORT
          </span>
          <h2>Frequently Asked Questions</h2>
          <p>
            Everything you need to know about our nutrition mixes, ordering, volunteering and
            delivery. Still curious? Our team is one message away.
          </p>
        </div>

        <div className="home-faq-accordion">
          {FAQ_DATA.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`home-faq-item ${isOpen ? 'open' : ''}`}
              >
                <button
                  type="button"
                  className="home-faq-question"
                  aria-expanded={isOpen}
                  onClick={() => toggle(idx)}
                >
                  <span className="home-faq-q-text">{faq.question}</span>
                  <span className="home-faq-icon" aria-hidden="true">
                    {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                  </span>
                </button>
                {isOpen && (
                  <div className="home-faq-answer">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="home-faq-cta">
          <p>Still have a question?</p>
          <div className="home-faq-cta-actions">
            <a
              href="https://wa.me/918422060195"
              target="_blank"
              rel="noopener noreferrer"
              className="home-faq-btn whatsapp"
            >
              <MessageCircle size={16} /> WhatsApp Us
            </a>
            <a href="mailto:enquinemix@gmail.com" className="home-faq-btn email">
              <Mail size={16} /> Email Us
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeFAQ;
