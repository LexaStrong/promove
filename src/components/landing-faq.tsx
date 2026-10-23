'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle, ArrowRight } from 'lucide-react';
import { siteFaqs } from '@/lib/site';

export default function LandingFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(prev => (prev === idx ? null : idx));
  };

  return (
    <section id="faq" className="pm-landing-section" style={{ background: 'var(--pm-bg-subtle)' }}>
      <div className="pm-container" style={{ maxWidth: 900 }}>
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--pm-space-10)' }}>
          <div className="pm-landing-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <HelpCircle size={15} />
            Frequently Asked Questions • Answer Engine Index
          </div>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)',
            fontWeight: 800,
            marginBottom: 'var(--pm-space-3)',
            color: 'var(--pm-text)',
            letterSpacing: '-0.02em',
          }}>
            Questions About <span style={{ color: 'var(--pm-blue-600)' }}>ProMove Ghana</span>
          </h2>
          <p style={{
            fontSize: '1rem',
            color: 'var(--pm-text-secondary)',
            maxWidth: 600,
            margin: '0 auto',
            lineHeight: 1.6,
          }}>
            Everything you need to know about tracking daily revenue, offline vehicle logging, DVLA compliance, and getting in touch.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--pm-space-3)' }}>
          {siteFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.question}
                className="pm-card"
                style={{
                  padding: 0,
                  overflow: 'hidden',
                  border: isOpen ? '1px solid var(--pm-blue-600)' : '1px solid var(--pm-border)',
                  transition: 'border-color var(--pm-transition), box-shadow var(--pm-transition)',
                }}
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  aria-expanded={isOpen}
                  style={{
                    width: '100%',
                    padding: 'var(--pm-space-5) var(--pm-space-6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 'var(--pm-space-4)',
                    background: 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    color: 'var(--pm-text)',
                    fontSize: '1rem',
                    fontWeight: 600,
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{
                      color: isOpen ? 'var(--pm-blue-600)' : 'var(--pm-text-muted)',
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      width: 24,
                    }}>
                      0{idx + 1}
                    </span>
                    {faq.question}
                  </span>
                  <ChevronDown
                    size={20}
                    style={{
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform var(--pm-transition)',
                      color: isOpen ? 'var(--pm-blue-600)' : 'var(--pm-text-muted)',
                      flexShrink: 0,
                    }}
                  />
                </button>

                {isOpen && (
                  <div
                    style={{
                      padding: '0 var(--pm-space-6) var(--pm-space-6) calc(var(--pm-space-6) + 36px)',
                      color: 'var(--pm-text-secondary)',
                      fontSize: '0.9375rem',
                      lineHeight: 1.6,
                      animation: 'fadeIn 0.2s ease',
                    }}
                  >
                    <p style={{ margin: 0 }}>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Help Prompt */}
        <div style={{
          marginTop: 'var(--pm-space-8)',
          textAlign: 'center',
          fontSize: '0.875rem',
          color: 'var(--pm-text-muted)',
        }}>
          Still have questions? Reach out to us directly at{' '}
          <a href="#contact" style={{ color: 'var(--pm-blue-600)', fontWeight: 600 }}>
            our 24/7 Ghana support channels <ArrowRight size={14} style={{ display: 'inline', verticalAlign: 'middle' }} />
          </a>
        </div>
      </div>
    </section>
  );
}
