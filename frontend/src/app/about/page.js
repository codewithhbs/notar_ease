'use client';

import { motion } from 'framer-motion';
import { Shield, Globe, Gavel, Users, Zap, Award, IndianRupee, CheckCircle } from 'lucide-react';
// import Header from '@/components/Header';
// import Footer from '@/components/Footer';

export default function Page() {
  return (
    <>

      {/* Hero Section */}
      <section className="relative bg-linear-to-b from-indigo-50 to-white py-14">
        <div className="container mx-auto px-6 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl md:text-4xl font-extrabold text-gray-900 mb-3"
          >
            About Om Documentation
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className=" text-gray-700 max-w-4xl mx-auto leading-relaxed"
          >
            India's First & Only Court-Approved Online e-Notary Platform
            <br />
            Making legal notarization simple, fast, and accessible from anywhere
            in the world.
          </motion.p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-6 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="bg-linear-to-br from-indigo-50 to-blue-50 p-10 rounded-3xl shadow-xl"
            >
              <h2 className="text-2xl font-bold text-indigo-700 mb-6 flex items-center gap-3">
                <Zap className="w-10 h-10" /> Our Mission
              </h2>
              <p className="text-base text-gray-700 leading-relaxed">
                To eliminate the hassle of physical notarization by providing a
                100% digital, secure, and court-accepted online notary service
                that saves time, money, and travel for millions of Indians and
                NRIs worldwide.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="bg-linear-to-br from-blue-50 to-indigo-50 p-10 rounded-3xl shadow-xl"
            >
              <h2 className="text-2xl font-bold text-blue-700 mb-6 flex items-center gap-3">
                <Globe className="w-10 h-10" /> Our Vision
              </h2>
              <p className="text-base text-gray-700 leading-relaxed">
                To become the most trusted and widely used digital notarization
                platform in India and for the global Indian diaspora — making
                legal processes truly borderless and paperless.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Story & Journey */}
      {/* <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6 text-center max-w-5xl">
          <h2 className="text-2xl md:text-4xl font-bold mb-12">
            Our Journey So Far
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { year: "2022", desc: "Idea born during COVID lockdowns" },
              {
                year: "2023",
                desc: "Platform launched with first notary panel",
              },
              {
                year: "2024",
                desc: "Supreme Court & High Courts approve online notarization",
              },
              {
                year: "2025",
                desc: "10,000+ documents notarized • 50+ countries served",
              },
            ].map((milestone, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition"
              >
                <div className="text-4xl font-bold text-indigo-600 mb-4">
                  {milestone.year}
                </div>
                <p className="text-gray-700">{milestone.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Why We Started */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl md:text-4xl font-bold mb-10">
              Why We Started Omm Documentation
            </h2>
            <p className=" text-gray-700 leading-relaxed">
              During the pandemic, thousands of NRIs were stuck abroad unable to
              notarize affidavits and Power of Attorney documents for property,
              banking, and legal matters in India. Traditional notarization
              required physical presence, courier, and weeks of waiting.
            </p>
            <p className=" text-gray-700 mt-8 leading-relaxed">
              We saw this pain and built{" "}
              <span className="font-bold text-indigo-600">Omm Documentation</span> — a
              fully digital platform that connects you with licensed Indian
              notaries via video call, verifies identity in real-time, and
              delivers court-ready notarized documents instantly.
            </p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      {/* <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            Meet Our Leadership
          </h2>
          <div className="grid md:grid-cols-3 gap-10 max-w-5xl mx-auto">
            {[
              {
                name: "Adv. Anand Kumar",
                role: "Founder & CEO",
                desc: "Senior Advocate, Delhi High Court • 15+ years in legal tech",
              },
              {
                name: "Adv. Neha Sharma",
                role: "Co-Founder & CTO",
                desc: "Ex-Google • Built secure platforms for 100M+ users",
              },
              {
                name: "CA Aditya Singh",
                role: "Head of Operations",
                desc: "15+ years managing legal compliance & notary networks",
              },
            ].map((member, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                className="bg-white rounded-2xl shadow-xl overflow-hidden"
              >
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-64" />{" "}
                <div className="p-8 text-center">
                  <h3 className="text-2xl font-bold">{member.name}</h3>
                  <p className="text-indigo-600 font-semibold mt-2">
                    {member.role}
                  </p>
                  <p className="text-gray-600 mt-4 text-sm">{member.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Trust & Stats */}
      <section className="py-20 bg-indigo-600 text-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-10 text-center">
            {[
              {
                icon: CheckCircle,
                stat: "10,000+",
                label: "Documents Notarized",
              },
              { icon: Users, stat: "200+", label: "Law Firms Trust Us" },
              { icon: Globe, stat: "50+", label: "Countries Served" },
              { icon: Award, stat: "100%", label: "Court Acceptance Rate" },
            ].map((item, i) => (
              <div key={i}>
                <item.icon className="w-16 h-16 mx-auto mb-4" />
                <div className="text-2xl font-bold">{item.stat}</div>
                <p className="text-lg mt-2 opacity-90">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-4xl font-bold mb-4">
            Ready to Experience the Future of Notarization?
          </h2>
          <p className="text-2xl text-gray-700 mb-12">
            Join thousands who have already gone digital with Omm Documentation
          </p>
          <a
            href="/#book"
            className="inline-flex items-center gap-3 px-12 py-4 bg-linear-to-r from-indigo-600 to-blue-700 text-white font-bold text-base rounded-full hover:shadow-2xl transition transform hover:scale-105"
          >
            <Gavel className="w-8 h-8" />
            Book Your First Notarization Now
          </a>
        </div>
      </section>
    </>
  );
}