'use client';

import { motion } from 'framer-motion';
import { Shield, Globe, Gavel, Users, Zap, Award, IndianRupee, CheckCircle } from 'lucide-react';

const PRIMARY = '#005F5A';
const PRIMARY_DARK = '#004845';
const PRIMARY_LIGHT = '#E6F4F3';
const ACCENT = '#00A896';

export default function Page() {
  return (
    <div style={{ fontFamily: "'Cormorant Garamond', 'Georgia', serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

        :root {
          --primary: #005F5A;
          --primary-dark: #004845;
          --primary-light: #E6F4F3;
          --accent: #00A896;
          --gold: #C9A84C;
        }

        .about-hero {
          position: relative;
          background: linear-gradient(135deg, #003D39 0%, #005F5A 50%, #007A73 100%);
          overflow: hidden;
          padding: 100px 0 80px;
        }

        .about-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle at 20% 50%, rgba(0,168,150,0.15) 0%, transparent 60%),
                            radial-gradient(circle at 80% 20%, rgba(201,168,76,0.1) 0%, transparent 50%);
        }

        .about-hero::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 80px;
          background: white;
          clip-path: ellipse(55% 100% at 50% 100%);
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(201,168,76,0.2);
          border: 1px solid rgba(201,168,76,0.5);
          color: #C9A84C;
          padding: 6px 18px;
          border-radius: 100px;
          font-size: 12px;
          font-family: 'DM Sans', sans-serif;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-weight: 600;
          margin-bottom: 24px;
        }

        .hero-badge::before {
          content: '';
          width: 6px;
          height: 6px;
          background: #C9A84C;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.3); }
        }

        .divider-ornament {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          margin: 16px 0 32px;
        }

        .divider-ornament::before,
        .divider-ornament::after {
          content: '';
          flex: 1;
          max-width: 80px;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--gold));
        }

        .divider-ornament::after {
          background: linear-gradient(90deg, var(--gold), transparent);
        }

        .mission-card {
          background: white;
          border-radius: 24px;
          padding: 48px 40px;
          box-shadow: 0 4px 40px rgba(0,95,90,0.08);
          border: 1px solid rgba(0,95,90,0.1);
          position: relative;
          overflow: hidden;
        }

        .mission-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, var(--primary), var(--accent));
        }

        .vision-card::before {
          background: linear-gradient(90deg, var(--gold), #E8C56A);
        }

        .icon-wrap {
          width: 56px;
          height: 56px;
          background: var(--primary-light);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
        }

        .vision-card .icon-wrap {
          background: #FBF5E6;
        }

        .story-section {
          position: relative;
          background: #FAFAFA;
          padding: 80px 0;
        }

        .story-section::before {
          content: '"';
          position: absolute;
          top: -20px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 180px;
          color: var(--primary);
          opacity: 0.06;
          font-family: 'Cormorant Garamond', serif;
          line-height: 1;
          pointer-events: none;
        }

        .stats-section {
          background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 100%);
          padding: 80px 0;
          position: relative;
          overflow: hidden;
        }

        .stats-section::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: 
            radial-gradient(circle at 10% 90%, rgba(201,168,76,0.12) 0%, transparent 50%),
            radial-gradient(circle at 90% 10%, rgba(0,168,150,0.12) 0%, transparent 50%);
        }

        .stat-card {
          text-align: center;
          position: relative;
          z-index: 1;
          padding: 32px 24px;
          border-radius: 20px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          backdrop-filter: blur(4px);
          transition: transform 0.3s ease, background 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-6px);
          background: rgba(255,255,255,0.1);
        }

        .stat-icon {
          width: 56px;
          height: 56px;
          background: rgba(201,168,76,0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          border: 1px solid rgba(201,168,76,0.3);
        }

        .cta-section {
          padding: 80px 0;
          background: white;
          position: relative;
          overflow: hidden;
        }

        .cta-section::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at center, rgba(0,95,90,0.04) 0%, transparent 70%);
        }

        .cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 18px 48px;
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
          color: white;
          font-family: 'DM Sans', sans-serif;
          font-weight: 600;
          font-size: 15px;
          border-radius: 100px;
          text-decoration: none;
          letter-spacing: 0.02em;
          transition: all 0.3s ease;
          box-shadow: 0 8px 32px rgba(0,95,90,0.3);
          position: relative;
          overflow: hidden;
        }

        .cta-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, transparent, rgba(255,255,255,0.08));
        }

        .cta-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 16px 48px rgba(0,95,90,0.4);
        }

        .section-eyebrow {
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 12px;
        }

        .serif-heading {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 700;
          color: #1a1a1a;
          line-height: 1.15;
        }

        .sans-body {
          font-family: 'DM Sans', sans-serif;
          font-weight: 400;
          color: #5a5a5a;
          line-height: 1.8;
        }
      `}</style>

      {/* Hero Section */}
      <section className="about-hero">
        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="hero-badge">India's First Court-Approved Platform</div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.7 }}
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: 700,
              color: 'white',
              lineHeight: 1.15,
              marginBottom: '20px'
            }}
          >
            About Om Documentation
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.7 }}
            style={{
              fontFamily: "'DM Sans', sans-serif",
              color: 'rgba(255,255,255,0.8)',
              maxWidth: '580px',
              margin: '0 auto',
              fontSize: '16px',
              lineHeight: 1.8
            }}
          >
            Making legal notarization simple, fast, and accessible —
            from anywhere in the world.
          </motion.p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section style={{ padding: '80px 0', background: 'white' }}>
        <div className="container mx-auto px-6">
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <p className="section-eyebrow">What Drives Us</p>
            <h2 className="serif-heading" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)' }}>
              Purpose & Direction
            </h2>
            <div className="divider-ornament">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="#C9A84C">
                <path d="M7 0L8.5 5.5L14 7L8.5 8.5L7 14L5.5 8.5L0 7L5.5 5.5Z"/>
              </svg>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mission-card"
            >
              <div className="icon-wrap">
                <Zap size={24} color={PRIMARY} />
              </div>
              <h2 className="serif-heading" style={{ fontSize: '1.6rem', color: PRIMARY, marginBottom: '16px' }}>
                Our Mission
              </h2>
              <p className="sans-body">
                To eliminate the hassle of physical notarization by providing a
                100% digital, secure, and court-accepted online notary service
                that saves time, money, and travel for millions of Indians and
                NRIs worldwide.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="mission-card vision-card"
            >
              <div className="icon-wrap">
                <Globe size={24} color="#C9A84C" />
              </div>
              <h2 className="serif-heading" style={{ fontSize: '1.6rem', color: '#8B6914', marginBottom: '16px' }}>
                Our Vision
              </h2>
              <p className="sans-body">
                To become the most trusted and widely used digital notarization
                platform in India and for the global Indian diaspora — making
                legal processes truly borderless and paperless.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why We Started */}
      <section className="story-section">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <p className="section-eyebrow">Our Story</p>
            <h2 className="serif-heading" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', marginBottom: '16px' }}>
              Why We Started Omm Documentation
            </h2>
            <div className="divider-ornament">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="#C9A84C">
                <path d="M7 0L8.5 5.5L14 7L8.5 8.5L7 14L5.5 8.5L0 7L5.5 5.5Z"/>
              </svg>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="sans-body"
              style={{ fontSize: '16px' }}
            >
              During the pandemic, thousands of NRIs were stuck abroad unable to
              notarize affidavits and Power of Attorney documents for property,
              banking, and legal matters in India. Traditional notarization
              required physical presence, courier, and weeks of waiting.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              style={{
                marginTop: '32px',
                padding: '32px 40px',
                background: PRIMARY_LIGHT,
                borderRadius: '20px',
                borderLeft: `4px solid ${PRIMARY}`,
              }}
            >
              <p className="sans-body" style={{ fontSize: '16px', color: '#3a3a3a' }}>
                We saw this pain and built{' '}
                <strong style={{ color: PRIMARY, fontFamily: "'Cormorant Garamond', serif", fontSize: '18px', fontWeight: 700 }}>
                  Omm Documentation
                </strong>{' '}
                — a fully digital platform that connects you with licensed Indian
                notaries via video call, verifies identity in real-time, and
                delivers court-ready notarized documents instantly.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust & Stats */}
      <section className="stats-section">
        <div className="container mx-auto px-6 relative z-10">
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '12px' }}>
              Trusted Results
            </p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', color: 'white', lineHeight: 1.2 }}>
              Numbers That Speak
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { icon: CheckCircle, stat: '10,000+', label: 'Documents Notarized' },
              { icon: Users, stat: '200+', label: 'Law Firms Trust Us' },
              { icon: Globe, stat: '50+', label: 'Countries Served' },
              { icon: Award, stat: '100%', label: 'Court Acceptance Rate' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="stat-card"
              >
                <div className="stat-icon">
                  <item.icon size={24} color="#C9A84C" />
                </div>
                <div style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '2.4rem',
                  fontWeight: 700,
                  color: 'white',
                  lineHeight: 1
                }}>
                  {item.stat}
                </div>
                <p style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '13px',
                  color: 'rgba(255,255,255,0.7)',
                  marginTop: '10px',
                  letterSpacing: '0.02em'
                }}>
                  {item.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="cta-section">
        <div className="container mx-auto px-6 text-center relative z-10">
          <p className="section-eyebrow">Get Started Today</p>
          <h2 className="serif-heading" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', marginBottom: '16px' }}>
            Ready to Experience the Future<br />of Notarization?
          </h2>
          <p className="sans-body" style={{ maxWidth: '480px', margin: '0 auto 48px', fontSize: '16px' }}>
            Join thousands who have already gone digital with Omm Documentation
          </p>
          <a href="/#book" className="cta-btn">
            <Gavel size={20} />
            Book Your First Notarization Now
          </a>
        </div>
      </section>
    </div>
  );
}