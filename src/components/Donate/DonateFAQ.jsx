import React, { useState } from 'react';
import './DonateFAQ.css';

const DonateFAQ = () => {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqData = [
    {
      question: 'Is my donation tax-deductible under Section 80G?',
      answer: 'Yes! All donations made to Aetmaad Wellness / Working Horses Initiative are eligible for tax exemption under Section 80G of the Income Tax Act. A formal tax receipt will be sent to your registered email.',
    },
    {
      question: 'How do I get my tax receipt after paying via UPI / GPay?',
      answer: 'Once you scan the QR code and complete your payment, fill in your details (including your PAN number) in the donation modal. Our team verifies the transaction and emails your tax receipt within 24–48 hours.',
    },
    {
      question: 'Can I set up a recurring monthly donation?',
      answer: 'Yes! You can toggle to "Monthly Support" inside the donation modal. When making payment via UPI, you can also set up an AutoPay mandate in Google Pay, PhonePe, or Paytm.',
    },
    {
      question: 'Is my payment secure?',
      answer: 'Direct UPI transactions occur safely within your own preferred bank/UPI app (Google Pay, PhonePe, Paytm, BHIM). We do not collect or store any of your bank account credentials or PINs.',
    },
    {
      question: 'Who should I contact if I face an issue with my donation?',
      answer: 'If you have any questions or require immediate support regarding your contribution, please reach out to our team at support@aetmaadwellness.org with your transaction details.',
    },
  ];

  return (
    <section className="donate-faq-section">
      <div className="donate-faq-container">
        <div className="section-header">
          <h2>Frequently Asked Questions</h2>
          <p>Everything you need to know about donations, UPI payments, and tax receipts.</p>
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

export default DonateFAQ;