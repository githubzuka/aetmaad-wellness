import { useState } from 'react';
import { Plus, HelpCircle, MessageCircle, Mail, Phone, Package, Truck, Users, ShieldCheck } from 'lucide-react';
import './HomeFAQ.css';

const FAQ_DATA = [
  {
    id: 'what-is-ashva',
    icon: Package,
    question: 'What is ASHVA Equine Wellness?',
    answer:
      'ASHVA is a natural equine nutrition and community-care initiative dedicated to improving the health and welfare of working horses through balanced nutrition mixes, volunteer outreach and research.',
  },
  {
    id: 'place-order',
    icon: Truck,
    question: 'How do I place an order for the nutrition mix?',
    answer:
      'Browse the Nutrition Mix section, choose a product and add it to your cart. After signing in you can complete the order from checkout, and our team coordinates delivery to your city zone.',
  },
  {
    id: 'delivery-areas',
    icon: Truck,
    question: 'Which areas do you deliver to?',
    answer:
      'We deliver across all major cities where our volunteer shop network is active. If your zone is not yet covered, reach out on WhatsApp and we will try to arrange distribution.',
  },
  {
    id: 'volunteer',
    icon: Users,
    question: 'How can I become a volunteer?',
    answer:
      'Create an account and choose the Volunteer role at signup. Once our admin team reviews and approves your profile, you get access to the volunteer dashboard to manage shops and weekly feedback.',
  },
  {
    id: 'safety',
    icon: ShieldCheck,
    question: 'Is the nutrition mix safe for all working horses?',
    answer:
      'Our mixes are formulated from natural ingredients and are generally well tolerated. We still recommend consulting your veterinarian before any major dietary change, especially for horses with existing conditions.',
  },
  {
    id: 'contact',
    icon: MessageCircle,
    question: 'How can I contact the ASHVA team?',
    answer:
      'You can reach us on WhatsApp or call +91 84220 60195, email enquinemix@gmail.com, message us on Instagram @ashva_enquinemix, or use the Contact Us form on our website.',
  },
];

const HomeFAQ = () => {
  const [openKey, setOpenKey] = useState('0-what-is-ashva');

  // Split the questions so half sit in the left column and half in the right
  const midpoint = Math.ceil(FAQ_DATA.length / 2);
  const columns = [FAQ_DATA.slice(0, midpoint), FAQ_DATA.slice(midpoint)];

  const toggle = (key) => setOpenKey(openKey === key ? null : key);

  return (
    <section id="faq" className="home-faq-section">
      <div className="home-faq-container">
        {/* ---------- Header ---------- */}
        <header className="home-faq-header">
          <span className="home-faq-tag">
            <HelpCircle size={13} /> Support Centre
          </span>
          <h2>
            Frequently Asked <span className="home-faq-accent">Questions</span>
          </h2>
          <p>
            Everything you need to know about our nutrition mixes, ordering, volunteering and
            delivery. Still curious? Our team is one message away.
          </p>
        </header>

        {/* ---------- Two-column accordion ---------- */}
        <div className="home-faq-accordion">
          {columns.map((column, colIdx) => (
            <div className="home-faq-column" key={colIdx}>
              {column.map((faq) => {
                const key = `${colIdx}-${faq.id}`;
                const isOpen = openKey === key;
                const Icon = faq.icon;

                return (
                  <div
                    key={key}
                    className={`home-faq-item ${isOpen ? 'open' : ''}`}
                    style={{ '--faq-delay': `${colIdx * 3 * 70}ms` }}
                  >
                    <button
                      type="button"
                      className="home-faq-question"
                      aria-expanded={isOpen}
                      aria-controls={`faq-panel-${key}`}
                      onClick={() => toggle(key)}
                    >
                      <span className="home-faq-q-icon" aria-hidden="true">
                        <Icon size={17} />
                      </span>
                      <span className="home-faq-q-text">{faq.question}</span>
                      <span className="home-faq-icon" aria-hidden="true">
                        <Plus size={15} />
                      </span>
                    </button>

                    <div
                      id={`faq-panel-${key}`}
                      className="home-faq-answer"
                      role="region"
                      aria-hidden={!isOpen}
                    >
                      <div className="home-faq-answer-inner">
                        <p>{faq.answer}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* ---------- CTA strip ---------- */}
        <div className="home-faq-cta">
          <div className="home-faq-cta-copy">
            <span className="home-faq-cta-badge">We reply fast</span>
            <h3>Still have a question?</h3>
            <p>
              Our team answers WhatsApp messages and emails within a few hours on working days.
            </p>
          </div>

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
            <a href="tel:+918422060195" className="home-faq-btn ghost">
              <Phone size={16} /> Call Helpline
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeFAQ;
