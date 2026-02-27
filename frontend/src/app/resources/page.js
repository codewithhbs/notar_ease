'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Gavel, 
  Globe, 
  Clock, 
  Users, 
  Shield, 
  Download, 
  CheckCircle,
  ExternalLink,
  Mail,
  ArrowRight,
  Star
} from 'lucide-react';

export default function Page() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <>
      <div className="min-h-screen bg-linear-to-b from-slate-50 to-white">
        {/* Hero Section */}
        {/* <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="relative container mx-auto px-6 py-24 md:py-32">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-4xl mx-auto text-center"
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Resources & Guides
              </h1>
              <p className="text-xl md:text-2xl opacity-95 max-w-3xl mx-auto">
                Everything you need to know about online e-Notarisation in India – court orders, document guides, pricing, and legal acceptance proof.
              </p>
            </motion.div>
          </div>
        </section> */}

        {/* Quick Links Grid */}
        <section className="container mx-auto px-6 py-16">
          <motion.div 
            variants={staggerChildren}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {[
              { icon: Gavel, title: "Court Acceptance Orders", desc: "Compilation of judicial orders accepting Omm Documentation documents", link: "/Omm Documentation orders compilation 25JUL2024.pdf", color: "blue" },
              { icon: FileText, title: "Supported Document Types", desc: "Full list of affidavits, PoA, agreements, NOCs & more", color: "indigo" },
              { icon: Globe, title: "Global Signing Guide", desc: "How NRIs & foreigners can notarise from anywhere", color: "purple" },
              { icon: Shield, title: "Security & Compliance", desc: "How we ensure legal validity and data protection", color: "green" },
              { icon: Download, title: "Stamp Paper Info", desc: "When stamp paper is required & how we handle it", link: "/StampPaper.pdf", color: "amber" },
              { icon: Clock, title: "Pricing & Plans", desc: "Transparent pricing for Aadhaar, DSC & International users", color: "rose" }
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={fadeIn}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className={`bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-2xl transition-shadow`}
              >
                <div className={`w-14 h-14 rounded-xl bg-${item.color}-100 flex items-center justify-center mb-6`}>
                  <item.icon className={`w-8 h-8 text-${item.color}-600`} />
                </div>
                <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                <p className="text-gray-600 mb-6">{item.desc}</p>
                {item.link ? (
                  <a href={item.link} target="_blank" rel="noopener noreferrer" className={`text-${item.color}-600 font-medium flex items-center gap-2 hover:gap-3 transition-all`}>
                    Download <ExternalLink className="w-4 h-4" />
                  </a>
                ) : (
                  <a href="#pricing" className={`text-${item.color}-600 font-medium flex items-center gap-2 hover:gap-3 transition-all`}>
                    Learn more <ArrowRight className="w-4 h-4" />
                  </a>
                )}
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Court Orders Section */}
        <section className="bg-gray-50 py-20">
          <div className="container mx-auto px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center max-w-4xl mx-auto mb-12"
            >
              <h2 className="text-4xl font-bold mb-6">Court-Accepted e-Notarisation</h2>
              <p className="text-xl text-gray-700">
                Omm Documentation is the <span className="font-bold text-indigo-600">only platform in India</span> whose online-notarised documents have been repeatedly accepted by Indian courts.
              </p>
            </motion.div>

            <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-10 text-center">
              <Gavel className="w-20 h-20 text-indigo-600 mx-auto mb-6" />
              <h3 className="text-3xl font-bold mb-6">Official Judicial Orders Compilation</h3>
              <p className="text-lg text-gray-600 mb-10 max-w-3xl mx-auto">
                Download the latest compilation (July 2024) of court orders from High Courts and District Courts across India that have accepted documents e-notarised on Omm Documentation.
              </p>
              <a
                href="/Omm Documentation orders compilation 25JUL2024.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-indigo-600 text-white px-8 py-5 rounded-xl font-semibold text-lg hover:bg-indigo-700 transition-all hover:shadow-lg"
              >
                <Download className="w-6 h-6" />
                Download Court Orders PDF
              </a>
            </div>
          </div>
        </section>

        {/* Document Types */}
        <section className="container mx-auto px-6 py-20">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">Documents You Can Notarise Online</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              "Affidavits & Declarations",
              "Power of Attorney (PoA)",
              "Vakalatnama",
              "No Objection Certificates (NOC)",
              "Rent & Lease Agreements",
              "NDA & Commercial Contracts",
              "Bank Forms & Declarations",
              "Immigration Letters & Forms",
              "Pleadings & Legal Notices"
            ].map((doc, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 bg-linear-to-r from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-100"
              >
                <CheckCircle className="w-10 h-10 text-indigo-600 shrink-0" />
                <span className="text-lg font-medium">{doc}</span>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Pricing Summary */}
        <section id="pricing" className="bg-linear-to-b from-gray-50 to-white py-20">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">Transparent Pricing</h2>
            <div className="grid md:grid-cols-3 gap-10 max-w-5xl mx-auto">
              {[
                {
                  name: "Aadhaar eSign",
                  price: "₹1,000",
                  original: "₹2,000",
                  bestFor: "Indian residents with Aadhaar",
                  features: ["50% OFF", "Mobile-linked Aadhaar required", "+₹500–₹2,000 for extra signers"]
                },
                {
                  name: "DSC Signing",
                  price: "₹5,000",
                  bestFor: "Users with USB Digital Signature",
                  features: ["Class 3 DSC token needed", "Up to 2 signers included", "Higher tiers for more signers"]
                },
                {
                  name: "NE-KYC (International)",
                  price: "$100 USD",
                  original: "$200",
                  bestFor: "NRIs & foreigners (no Aadhaar/DSC)",
                  features: ["50% OFF", "Passport-based KYC", "Book via email"]
                }
              ].map((plan, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -10 }}
                  className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-100 hover:border-indigo-300 transition-all"
                >
                  {plan.original && <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">50% OFF</span>}
                  <h3 className="text-2xl font-bold mt-4">{plan.name}</h3>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-indigo-600">{plan.price}</span>
                    {plan.original && <span className="text-gray-400 line-through ml-3">{plan.original}</span>}
                  </div>
                  <p className="text-gray-600 mt-3">{plan.bestFor}</p>
                  <ul className="mt-6 space-y-3">
                    {plan.features.map((f, fi) => (
                      <li key={fi} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-gray-700">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <a href="/" className="mt-8 w-full bg-indigo-600 text-white py-4 rounded-xl font-semibold text-center block hover:bg-indigo-700 transition">
                    Get Started
                  </a>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Footer */}
        {/* <section className="bg-indigo-700 text-white py-20">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-4xl font-bold mb-6">Ready to Notarise Online?</h2>
            <p className="text-xl mb-10 max-w-2xl mx-auto opacity-90">
              Join thousands of users who have already experienced India's first court-accepted e-notarisation platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <a href="" className="bg-white text-indigo-700 px-10 py-5 rounded-xl font-bold text-lg hover:bg-gray-100 transition flex items-center gap-3">
                Start Notarisation <ArrowRight />
              </a>
              <a href="mailto:omdocument33@gmail.com" className="border-2 border-white px-10 py-5 rounded-xl font-bold text-lg hover:bg-white hover:text-indigo-700 transition flex items-center gap-3">
                <Mail className="w-6 h-6" /> Contact Support
              </a>
            </div>
          </div>
        </section> */}
      </div>
    </>
  );
}