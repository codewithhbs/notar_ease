'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import DemoMeetingModel from '../components/DemoMeetingModel/DemoMeetingModel'

import {
  Upload,
  Video,
  FileCheck,
  Clock,
  Shield,
  Globe,
  Truck,
  ChevronLeft,
  ChevronRight,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Menu,
  X,
  ChevronDown,
  ArrowRight,
  CheckCircle,
  ScrollText,
  FileSignature,
  Briefcase,
  Plane,
  Pen,
  Scale
} from 'lucide-react';
import Image from 'next/image';

const Home = () => {
  const [openFaq, setOpenFaq] = useState(null);
  const [openDemo, setOpenDemo] = useState(false);

  return (
    <div className="min-h-screen bg-white">

      <section className="relative h-screen flex items-center justify-center overflow-hidden">

        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="https://res.cloudinary.com/duxsqzrot/image/upload/v1771828101/2ab23c4f-b182-4d85-bcc5-fab1652e56a4_axssoq.jpg"
            alt="Online Notary"
            fill
            priority
            className="object-cover scale-105"
          />

          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/70" />
        </div>

        {/* Center Content */}
        <div className="relative z-10 text-center px-6 max-w-4xl">

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight tracking-tight">
            Legally Binding.<br />
            Digitally Secured.
            <span className="block text-yellow-400 mt-4">
              Your Notary, Anytime.
            </span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
            Secure online notarization with complete legal compliance —
            fast, safe, and available 24/7.
          </p>

          <div className="mt-10">
            <button onClick={() => setOpenDemo(true)} className="bg-yellow-500 hover:bg-yellow-600 text-black px-10 py-4 rounded-full text-lg font-semibold shadow-2xl transition-all duration-300 hover:scale-105">
              Book a Demo →
            </button>
          </div>

          {/* Scroll Down Indicator */}
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 text-white/60 animate-bounce">
            ↓ Scroll
          </div>

        </div>

      </section>



      {/* Our Process Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Our Process</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We unwore your process/lanc accovances a tire-bop-e dansility<br />
              secure to digitally momny and your assistaners.
            </p>
          </div>

          {/* Process Steps */}
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting Lines */}
            <div className="hidden md:block absolute top-12 left-[16.66%] right-[16.66%] h-0.5 bg-gradient-to-r from-[#1a5c5a] via-[#1a5c5a] to-[#d4a574]"></div>

            {/* Step 1 */}
            <div className="text-center relative">
              <div className="w-24 h-24 bg-[#1a5c5a] rounded-full flex items-center justify-center mx-auto mb-6 relative z-10">
                <Upload className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">1. Upload Documents</h3>
              <p className="text-gray-600 text-sm">
                Upload documents on ye wi web<br />
                process, and document. In your<br />
                documents.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center relative">
              <div className="w-24 h-24 bg-[#1a5c5a] rounded-full flex items-center justify-center mx-auto mb-6 relative z-10">
                <Video className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">2. Connect via Video</h3>
              <p className="text-gray-600 text-sm">
                Your Notary s an do access via<br />
                video, connect dinks with upload<br />
                documents.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center relative">
              <div className="w-24 h-24 bg-[#d4a574] rounded-full flex items-center justify-center mx-auto mb-6 relative z-10">
                <FileCheck className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">3. Receive Digital Seal</h3>
              <p className="text-gray-600 text-sm">
                Receive digital seal to come digital<br />
                seal on-or ambowal dalocations and<br />
                your yourssalet.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-[#f5ebe0]">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-16">Why Choose Us</h2>

          <div className="grid md:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="bg-[#1a5c5a] text-white rounded-lg p-8 text-center">
              <Pen className="w-16 h-16 mx-auto mb-4 text-[#d4a574]" strokeWidth={1.5} />
              <h3 className="text-xl font-bold mb-3">Fully Online Process</h3>
              <p className="text-sm text-gray-300">
                No printing or scanning. Complete your notarisation end-to-end online using Omm Documentation.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#f5ebe0] border-2 border-[#d4a574] rounded-lg p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Globe className="w-16 h-16 text-[#1a5c5a]" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold mb-3">Sign from Anywhere</h3>
              <p className="text-sm text-gray-700">
                Whether you're abroad or in India, digitally sign and notarise your documents securely.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#1a5c5a] text-white rounded-lg p-8 text-center">
              <Shield className="w-16 h-16 mx-auto mb-4 text-[#d4a574]" strokeWidth={1.5} />
              <h3 className="text-xl font-bold mb-3">Trusted & Legally Compliant</h3>
              <p className="text-sm text-gray-300">
                Maintain full legal validity with secure records, verifiable audit trails and compliance with Indian law.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-[#f5ebe0] border-2 border-[#d4a574] rounded-lg p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Scale className="w-16 h-16 text-[#1a5c5a]" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold mb-3">Accepted by Indian Courts</h3>
              <p className="text-sm text-gray-700">
                Omm Documentation notarised files have been accepted in multiple judicial matters across India.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-6">

          {/* Section Heading */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Choose Your Verification Method
            </h2>
            <p className="text-gray-500 mt-4 max-w-2xl mx-auto">
              Secure, legally compliant digital notarization options tailored to your needs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">

            {/* ========== Aadhaar (Featured) ========== */}
            <motion.div
              whileHover={{ y: -8 }}
              className="relative bg-white rounded-2xl shadow-xl border border-indigo-100"
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#1a5c5a] text-white px-6 py-1 rounded-full text-sm font-semibold shadow-lg">
                Most Popular
              </div>

              <div className="p-10">
                <h3 className="text-xl font-semibold text-[#1a5c5a">
                  Aadhaar e-Sign
                </h3>

                <div className="mt-6 mb-8">
                  <span className="text-5xl font-bold text-gray-900">
                    ₹1,000
                  </span>
                  <span className="text-gray-500 text-sm"> / document</span>
                </div>

                <ul className="space-y-4 text-gray-600 mb-8">
                  <li className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-[#1a5c5a]" />
                    Mobile-linked Aadhaar required
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-[#1a5c5a]" />
                    Max 10MB file size
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-[#1a5c5a]" />
                    1 Page Included
                  </li>
                </ul>
                <ul className="text-sm text-gray-600 space-y-2 mb-8">
                  <li>• Price includes 1 PDF page</li>
                  <li>• Every additional page costs ₹100</li>
                  <li>• Charges auto-added based on total pages</li>
                </ul>
                <a
                  href="/"
                  className="block w-full bg-[#1a5c5a] hover:bg-[#1a5c5a] text-white text-center font-semibold py-4 rounded-xl transition-all duration-300"
                >
                  Get Started →
                </a>

                <p className="text-xs text-gray-400 mt-6">
                  Additional pages ₹100 per page
                </p>
              </div>
            </motion.div>

            {/* ========== DSC ========== */}
            <motion.div
              whileHover={{ y: -8 }}
              className="bg-white rounded-2xl shadow-md border border-gray-200"
            >
              <div className="p-10">
                <h3 className="text-xl font-semibold text-gray-900">
                  DSC (Digital Signature)
                </h3>

                <div className="mt-6 mb-8">
                  <span className="text-5xl font-bold text-gray-900">
                    ₹3,000
                  </span>
                  <span className="text-gray-500 text-sm"> / document</span>
                </div>

                <ul className="space-y-4 text-gray-600 mb-8">
                  <li className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-gray-800" />
                    USB-based DSC required
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-gray-800" />
                    Max 10MB file size
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-gray-800" />
                    1 Page Included
                  </li>
                </ul>
                <ul className="text-sm text-gray-600 space-y-2 mb-8">
                  <li>• Price includes 1 PDF page</li>
                  <li>• Every additional page costs ₹100</li>
                  <li>• Charges auto-added based on total pages</li>
                </ul>
                <a
                  href="/"
                  className="block w-full bg-gray-900 hover:bg-black text-white text-center font-semibold py-4 rounded-xl transition"
                >
                  Get Started →
                </a>

                <p className="text-xs text-gray-400 mt-6">
                  Additional pages ₹100 per page
                </p>
              </div>
            </motion.div>

            {/* ========== NE-KYC ========== */}
            <motion.div
              whileHover={{ y: -8 }}
              className="bg-white rounded-2xl shadow-md border border-green-200"
            >
              <div className="p-10">
                <h3 className="text-xl font-semibold text-green-700">
                  NE-KYC (International)
                </h3>

                <div className="mt-6 mb-8">
                  <span className="text-5xl font-bold text-gray-900">
                    $35
                  </span>
                  <span className="text-gray-500 text-sm"> / document</span>
                </div>

                <ul className="space-y-4 text-gray-600 mb-8">
                  <li className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Passport required
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Live KYC video meeting
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    1 Page Included
                  </li>
                </ul>
                <ul className="text-sm text-gray-600 space-y-2 mb-8">
                  <li>• Price includes 1 PDF page</li>
                  <li>• Every additional page costs USD $1</li>
                  <li>• Charges auto-added based on total pages</li>
                </ul>
                <a
                  href="/"
                  className="block w-full bg-green-600 hover:bg-green-700 text-white text-center font-semibold py-4 rounded-xl transition"
                >
                  Get Started →
                </a>

                <p className="text-xs text-gray-400 mt-6">
                  Additional pages $1 per page
                </p>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      <section className="relative py-24 bg-gradient-to-b from-white via-indigo-50/40 to-white overflow-hidden">

        {/* Subtle Background Glow */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-200 rounded-full blur-3xl opacity-20" />

        <div className="relative max-w-7xl mx-auto px-6">

          {/* Header */}
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-block px-4 py-1 text-xs font-semibold tracking-widest uppercase text-[#1a5c5a] bg-indigo-50 rounded-full">
              Supported Documents
            </span>

            <h2 className="mt-6 text-3xl md:text-5xl font-bold text-gray-900 leading-tight">
              Sign & Notarise Documents

            </h2>

          </div>

          {/* Cards */}
          <div className="mt-20 grid md:grid-cols-2 lg:grid-cols-4 gap-8">

            {[
              {
                icon: ScrollText,
                title: "Legal / Litigation",
                color: "indigo",
                items: [
                  "Affidavits",
                  "Vakalatnamas",
                  "Powers of Attorney",
                  "Court pleadings",
                ],
              },
              {
                icon: FileSignature,
                title: "Agreements",
                color: "emerald",
                items: [
                  "Rent agreements",
                  "Commercial contracts",
                  "NDAs",
                  "Standard agreements",
                ],
              },
              {
                icon: Briefcase,
                title: "Business & Financial",
                color: "amber",
                items: [
                  "Bank documents",
                  "Declarations",
                  "NOCs",
                  "Compliance papers",
                ],
              },
              {
                icon: Plane,
                title: "Immigration",
                color: "sky",
                items: [
                  "Visa letters",
                  "Forms & annexures",
                  "ID proofs",
                  "Supporting docs",
                ],
              },
            ].map((doc, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 250, damping: 18 }}
                className="group relative bg-white border border-gray-200 rounded-xl p-8 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                {/* Icon */}
                <div className={`w-14 h-14 flex items-center justify-center rounded-xl mb-6
            bg-${doc.color}-50 border border-${doc.color}-100`}>
                  <doc.icon className={`w-6 h-6 text-${doc.color}-600`} />
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {doc.title}
                </h3>

                <ul className="space-y-2 text-sm text-gray-600">
                  {doc.items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[#1a5c5a]" />
                      {item}
                    </li>
                  ))}
                </ul>

                {/* Hover Accent Line */}
                <div className="absolute bottom-0 left-0 h-1 w-0 bg-[#1a5c5a] transition-all duration-300 group-hover:w-full rounded-b-4xl" />
              </motion.div>
            ))}

          </div>

        </div>
      </section>


      {/* ========== FAQ ========== */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">

          {/* Heading */}
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Frequently Asked Questions
          </h2>

          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* LEFT SIDE - FAQ */}
            <div>
              {[
                {
                  q: "Is online notarization legally valid in India?",
                  a: "Yes. The Supreme Court and multiple High Courts have upheld the validity of electronically notarized documents.",
                },
                {
                  q: "Can I notarize documents from abroad?",
                  a: "Absolutely. NRIs from UAE, USA, UK, Canada, Singapore, Australia, etc. use our platform daily.",
                },
                {
                  q: "How long does the process take?",
                  a: "The entire process takes 15-30 minutes including video verification.",
                },
                {
                  q: "Do I need to visit any office?",
                  a: "No. Everything is 100% online. No printing, scanning, or courier required.",
                },
              ].map((faq, i) => (
                <div key={i} className="mb-5">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full text-left p-6 bg-white rounded-2xl shadow-md flex justify-between items-center font-semibold hover:bg-gray-100 transition"
                  >
                    {faq.q}
                    <ChevronDown
                      className={`w-5 h-5 transition-transform duration-300 ${openFaq === i ? "rotate-180" : ""
                        }`}
                    />
                  </button>

                  {openFaq === i && (
                    <div className="p-6 bg-indigo-50 rounded-2xl mt-2 text-gray-700">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* RIGHT SIDE - IMAGE */}
            <div className="relative hidden lg:block">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=2070"
                  alt="Online Notary Support"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Decorative Blur Glow */}
              <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-indigo-300 rounded-full blur-3xl opacity-40" />
            </div>

          </div>
        </div>
      </section>

      {/* Client Testimonial Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-16">Client Testimonial</h2>

          <div className="relative">
            {/* Left Arrow */}
            <button className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100">
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </button>

            {/* Testimonials Grid */}
            <div className="grid md:grid-cols-3 gap-8 px-12">
              {/* Testimonial 1 */}
              <div className="text-center">
                <img
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face"
                  alt="Dush A."
                  className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-gray-200"
                />
                <p className="text-sm text-gray-700 mb-4 italic">
                  "Legally Binding changes the third contour egreocomtanlosih with experience and through no obisso ton your hempors."
                </p>
                <h4 className="font-bold">Dush A.</h4>
                <p className="text-sm text-gray-500">Provessicator</p>
              </div>

              {/* Testimonial 2 */}
              <div className="text-center">
                <img
                  src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&h=150&fit=crop&crop=face"
                  alt="Anna"
                  className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-gray-200"
                />
                <p className="text-sm text-gray-700 mb-4 italic">
                  "I have one ereon of our closers we to promatomly great country to assoletion we barrinow Tmrepa contact with the clients."
                </p>
                <h4 className="font-bold">Anna</h4>
                <p className="text-sm text-gray-500">Business lemal</p>
              </div>

              {/* Testimonial 3 */}
              <div className="text-center">
                <img
                  src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face"
                  alt="Susanne Ulaana"
                  className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-gray-200"
                />
                <p className="text-sm text-gray-700 mb-4 italic">
                  "We'x amading onaine the seal aero increased an embedded eegland, a emst confiru what find your consulant while."
                </p>
                <h4 className="font-bold">Susanne Ulaana</h4>
                <p className="text-sm text-gray-500">Conser</p>
              </div>
            </div>

            {/* Right Arrow */}
            <button className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100">
              <ChevronRight className="w-6 h-6 text-gray-600" />
            </button>

            {/* Dots Indicator */}
            <div className="flex justify-center gap-2 mt-8">
              <div className="w-2 h-2 rounded-full bg-gray-400"></div>
              <div className="w-2 h-2 rounded-full bg-gray-300"></div>
              <div className="w-2 h-2 rounded-full bg-gray-300"></div>
              <div className="w-2 h-2 rounded-full bg-gray-300"></div>
            </div>
          </div>
        </div>
      </section>



      {openDemo && <DemoMeetingModel onClose={() => setOpenDemo(false)} />}
    </div>
  );
};

export default Home;