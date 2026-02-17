"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Globe,
  Clock,
  FileText,
  Video,
  Download,
  CheckCircle,
  ArrowRight,
  Gavel,
  Lock,
  Users,
  Headphones,
  ChevronDown,
  Landmark,
  Zap,
  Award,
  IndianRupee,
  PenLine,
  Globe2,
  ShieldCheck,
  Scale,
  ScrollText,
  FileSignature,
  Briefcase,
  Plane,
  ChevronLeft,
  ChevronRight,
  CheckCircle2
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import DemoMeetingModel from '../components/DemoMeetingModel/DemoMeetingModel';

const testimonials = [
  {
    name: "Rahul Mehta",
    role: "Working Professional",
    review: "The entire notarization process took less than 10 minutes. Super convenient and legally accepted everywhere. Highly recommended!",
    image: "/Image/client2.avif",
  },
  {
    name: "Priya Sharma",
    role: "Immigration Applicant",
    review: "My e-notarized documents were accepted in my visa application without any issues. This platform saved me so much time!",
    image: "/Image/client1.jpg",
  },
  {
    name: "Aditya Singh",
    role: "Freelancer",
    review: "I needed urgent notarization late at night. The online process was smooth and instant. Support team was also very helpful!",
    image: "/Image/client3.avif",
  },
  {
    name: "Neha Kapoor",
    role: "Small Business Owner",
    review: "As a startup founder, I notarize contracts weekly. This service is fast, secure, and way more affordable than traditional notaries.",
    image: "/Image/client4.jpg",
  },
  {
    name: "Vikram Desai",
    role: "NRI Investor",
    review: "Being abroad, getting documents notarized used to be a nightmare. Now I do it from my phone in minutes. Truly a game-changer!",
    image: "/Image/client5.avif",
  },
];

export default function Home() {
  const [openFaq, setOpenFaq] = useState(null);
  const [openDemo, setOpenDemo] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);

  const nextSlide = () => {
    setCurrentIndex((prev) =>
      prev + 2 >= testimonials.length ? 0 : prev + 2
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? testimonials.length - 2 : prev - 2
    );
  };

  // Auto-play logic
  useEffect(() => {
    if (isPaused) return;

    intervalRef.current = setInterval(() => {
      nextSlide();
    }, 6000);

    return () => clearInterval(intervalRef.current);
  }, [isPaused, currentIndex]);

  // Get visible testimonials (2 at a time, loop around)
  const visibleTestimonials = [
    testimonials[currentIndex],
    testimonials[(currentIndex + 1) % testimonials.length],
  ];

  const handleRedirect = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      window.location.href = '/login';
      return;
    }
    window.location.href = '/dashboard';
  };

  return (
    <>
      <section className="relative overflow-hidden bg-linear-to-br from-indigo-50 via-white to-blue-50">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl">
            <div className="w-full h-96 bg-gradient-conic from-indigo-200 via-transparent to-blue-200 opacity-20 rounded-full blur-3xl"></div>
          </div>
        </div>

        <div className="relative container mx-auto px-6 pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="text-center">
            {/* Supreme Court Trust Badge - Premium */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-3 px-7 py-4 bg-linear-to-r from-emerald-500 to-green-700 text-white rounded-full text-sm md:text-base font-bold shadow-xl shadow-green-500/30 mb-8"
            >
              <Shield className="w-6 h-6" />
              Supreme Court of India + All High Courts Approved
              <CheckCircle2 className="w-6 h-6 ml-2" />
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight max-w-5xl mx-auto"
            >
              Get Documents Notarized Online
              <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-600 via-purple-600 to-blue-700">
                From Anywhere in the World
              </span>
              <br />
              <span className="text-3xl md:text-4xl lg:text-5xl text-indigo-700">
                in Just 15 Minutes
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="mt-8 text-lg md:text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed font-medium"
            >
              Affidavits • Power of Attorney • Agreements • Property Documents
              <br className="hidden md:block" />
              100% Legally Valid • Accepted by All Courts, Embassies & Government Offices
            </motion.p>

            {/* Trust Highlights - Floating Cards */}
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {[
                { icon: Video, text: "Live Video Call", color: "from-pink-500 to-rose-500" },
                { icon: Globe, text: "Works from USA, UK, Dubai", color: "from-blue-500 to-cyan-500" },
                { icon: Clock, text: "15-30 Min Process", color: "from-purple-500 to-indigo-500" },
                { icon: Shield, text: "256-bit Encrypted", color: "from-green-500 to-emerald-600" },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + idx * 0.1 }}
                  className="group"
                >
                  <div className={`p-6 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl hover:scale-105 transition-all duration-300`}>
                    <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-linear-to-br ${item.color} p-3 shadow-md`}>
                      <item.icon className="w-full h-full text-white" />
                    </div>
                    <p className="text-sm md:text-base font-semibold text-gray-800">{item.text}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              className="mt-16 flex flex-col sm:flex-row gap-5 justify-center items-center"
            >
              {/* <button onClick={() => setOpenDemo(true)} className="group relative px-10 py-5 bg-linear-to-r from-indigo-600 to-blue-700 text-white font-bold text-lg rounded-full shadow-2xl hover:shadow-indigo-600/50 transform hover:scale-105 transition-all duration-300 flex items-center gap-3 overflow-hidden"> */}
              <button onClick={() => handleRedirect()} className="group relative px-10 py-5 bg-linear-to-r from-indigo-600 to-blue-700 text-white font-bold text-lg rounded-full shadow-2xl hover:shadow-indigo-600/50 transform hover:scale-105 transition-all duration-300 flex items-center gap-3 overflow-hidden">
                <span className="relative z-10">Book Appointment</span>
                <ArrowRight className="w-6 h-6 relative z-10 group-hover:translate-x-1 transition" />
                <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
              </button>

              <button className="px-10 py-5 border-2 border-indigo-600 text-indigo-700 font-bold text-lg rounded-full hover:bg-indigo-50 transition flex items-center gap-3 backdrop-blur-sm">
                <Headphones className="w-6 h-6" />
                Talk to Support (24×7)
              </button>
            </motion.div>

            {/* Mini Trust Bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="mt-12 flex flex-wrap justify-center items-center gap-6 text-sm text-gray-600"
            >
              <span className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-600" /> Used by 50,000+ Indians Worldwide</span>
              <span className="hidden md:inline">•</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-600" /> 4.9/5 from 8,200+ Reviews</span>
              <span className="hidden md:inline">•</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-600" /> ISO 27001 Certified</span>
            </motion.div>
          </div>
        </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0L60 10L120 30L180 40L240 50L300 40L360 30L420 20L480 30L540 40L600 50L660 40L720 20L780 10L840 20L900 40L960 50L1020 40L1080 20L1140 10L1200 20L1260 40L1320 50L1380 40L1440 20V120H0V0Z"
              fill="white" opacity="0.8" />
          </svg>
        </div>
      </section>

      {/* Why Omm Documentation */}
      <section className="relative py-20 bg-linear-to-b from-indigo-50 to-white">
        <div className="container mx-auto px-6">
          {/* Centered Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="text-center max-w-2xl mx-auto"
          >
            <p className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Why Omm Documentation?
            </p>

            <h2 className="mt-5 text-3xl md:text-4xl font-bold text-slate-900">
              Experience the Future of{" "}
              <span className="text-indigo-600">Digital Notarisation</span>
            </h2>

            <p className="mt-4 text-slate-600 text-lg">
              Modern, secure, legally compliant and globally accessible online
              notarisation — built for individuals, businesses and
              professionals.
            </p>
          </motion.div>

          {/* Feature Cards */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-14 grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {/* Fully Online */}
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-100">
                <PenLine className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                Fully Online Process
              </h3>
              <p className="mt-3 text-sm text-slate-600">
                No printing or scanning. Complete your notarisation end-to-end
                online using Omm Documentation.
              </p>
            </motion.div>

            {/* Global Signing */}
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-100">
                <Globe2 className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                Sign from Anywhere
              </h3>
              <p className="mt-3 text-sm text-slate-600">
                Whether you're abroad or in India, digitally sign and notarise
                your documents securely.
              </p>
            </motion.div>

            {/* Trusted Legal */}
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 border border-sky-100">
                <ShieldCheck className="h-6 w-6 text-sky-600" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                Trusted & Legally Compliant
              </h3>
              <p className="mt-3 text-sm text-slate-600">
                Maintain full legal validity with secure records, verifiable
                audit trails and compliance with Indian law.
              </p>
            </motion.div>

            {/* Court Accepted */}
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 border border-rose-100">
                <Scale className="h-6 w-6 text-rose-600" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                Accepted by Indian Courts
              </h3>
              <p className="mt-3 text-sm text-slate-600">
                Omm Documentation notarised files have been accepted in multiple
                judicial matters across India.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Court Orders */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-3">
            Legally Accepted Across India
          </h2>
          <p className="text-center text-gray-600 text-lg mb-12">
            Our online notarization has been upheld by the highest courts
          </p>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                court: "Supreme Court of India",
                case: "Writ Petition (Civil) No. 791 of 2023",
                desc: "Online notarization declared valid",
              },
              {
                court: "Delhi High Court",
                case: "CM(M) 123/2024",
                desc: "e-Notary documents accepted as original",
              },
              {
                court: "Bombay High Court",
                case: "Multiple immigration & property cases",
                desc: "Accepted in 1000+ matters",
              },
            ].map((c, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -8 }}
                className="bg-white p-8 rounded-md shadow"
              >
                <Landmark className="w-12 h-12 text-indigo-600 mb-4" />
                <h3 className="text-xl font-bold">{c.court}</h3>
                <p className="text-sm text-gray-500 mt-2">{c.case}</p>
                <p className="text-gray-700 mt-4">{c.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-20 bg-linear-to-b from-indigo-50 to-white">
        <div className="container mx-auto px-6">
          {/* Centered Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="text-center max-w-2xl mx-auto"
          >
            <p className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Supported Documents
            </p>

            <h2 className="mt-5 text-3xl md:text-4xl font-bold text-slate-900">
              What documents can I sign and notarise{" "}
              <span className="text-indigo-600">online?</span>
            </h2>

            <p className="mt-4 text-slate-600 text-lg">
              Omm Documentation supports a wide range of legal, business and
              personal documents for secure online signing and notarisation.
            </p>
          </motion.div>

          {/* Document Categories */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-14 grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {/* Legal / Litigation */}
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-100">
                <ScrollText className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                Legal / Litigation documents
              </h3>
              <p className="mt-3 text-sm text-slate-600">
                Commonly used in courts, legal workflows and dispute resolution.
              </p>
              <ul className="mt-4 space-y-1.5 text-sm text-slate-600">
                <li>• Affidavits</li>
                <li>• Vakalatnamas</li>
                <li>• Powers of Attorney (PoAs)</li>
                <li>• Pleadings & related documents</li>
              </ul>
            </motion.div>

            {/* Agreements */}
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-100">
                <FileSignature className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                Agreements
              </h3>
              <p className="mt-3 text-sm text-slate-600">
                Securely sign and notarise everyday personal and commercial
                contracts.
              </p>
              <ul className="mt-4 space-y-1.5 text-sm text-slate-600">
                <li>• Rent agreements</li>
                <li>• Commercial contracts</li>
                <li>• Non-Disclosure Agreements (NDAs)</li>
                <li>• Other standard agreements</li>
              </ul>
            </motion.div>

            {/* Business & Financial */}
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 border border-amber-100">
                <Briefcase className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                Business & financial documents
              </h3>
              <p className="mt-3 text-sm text-slate-600">
                Ideal for banks, companies, professionals and compliance
                workflows.
              </p>
              <ul className="mt-4 space-y-1.5 text-sm text-slate-600">
                <li>• Bank documents</li>
                <li>• Forms & declarations</li>
                <li>• NOCs</li>
                <li>• Other compliance papers</li>
              </ul>
            </motion.div>

            {/* Immigration */}
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 border border-sky-100">
                <Plane className="h-6 w-6 text-sky-600" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                Immigration documents
              </h3>
              <p className="mt-3 text-sm text-slate-600">
                Frequently required for visa, PR and other immigration
                processes.
              </p>
              <ul className="mt-4 space-y-1.5 text-sm text-slate-600">
                <li>• Letters & declarations</li>
                <li>• Forms & annexures</li>
                <li>• Proofs of ID</li>
                <li>• Supporting documents</li>
              </ul>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-16">
            How Online Notarization Works
          </h2>
          <div className="grid md:grid-cols-4 gap-10 text-center">
            {[
              {
                step: "1",
                title: "Upload Document",
                desc: "Fill form & upload your document",
                icon: FileText,
              },
              {
                step: "2",
                title: "Identity Verification",
                desc: "Verify via Aadhaar/Passport",
                icon: Shield,
              },
              {
                step: "3",
                title: "Video Call with Notary",
                desc: "Live verification in 5 minutes",
                icon: Video,
              },
              {
                step: "4",
                title: "Get Notarized Document",
                desc: "Download instantly with digital stamp",
                icon: Download,
              },
            ].map((s, i) => (
              <div key={i} className="py-3 rounded-md shadow shadow-blue-950">
                <div className="text-5xl font-bold text-indigo-100 mb-4">
                  {s.step}
                </div>
                <s.icon className="w-15 h-15 text-indigo-600 mx-auto my-6" />
                <h3 className="text-1xl font-bold">{s.title}</h3>
                <p className="text-gray-600 mt-3">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- HERO ---------------- */}

      <section className="bg-linear-to-b from-indigo-50 to-white py-15">
        <div className="container mx-auto px-6 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl md:text-4xl font-extrabold text-gray-900 mb-6"
          >
            Simple & Transparent Pricing
          </motion.h1>

          <p className="text-xl text-gray-700 max-w-4xl mx-auto">
            Choose the method that works best for you.
          </p>

          <div className="mt-10 inline-flex items-center gap-3 bg-green-100 text-green-800 px-6 py-3 rounded-full text-lg font-semibold">
            <Shield className="w-6 h-6" />
            Court-accepted eNotarised documents platform.
          </div>
        </div>
      </section>

      {/* ---------------- PRICING CARDS ---------------- */}

      <section className="py-10 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">

            {/* -------- Aadhaar -------- */}

            <motion.div
              whileHover={{ y: -10 }}
              className="relative bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-indigo-600"
            >
              <div className="absolute top-0 right-0 bg-indigo-600 text-white px-6 py-2 rounded-bl-2xl font-bold">
                MOST POPULAR
              </div>

              <div className="p-10 text-center">
                <h3 className="text-2xl font-bold text-indigo-700 mb-2">
                  Aadhaar e-Sign
                </h3>

                <div className="mb-6">
                  <span className="text-5xl font-extrabold text-indigo-600">
                    ₹1,000
                  </span>
                </div>

                <ul className="space-y-4 text-left mb-8">
                  <li className="flex gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    Mobile-linked Aadhaar required
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 shrink-0" />{" "}
                    Max 10MB file size
                  </li>
                </ul>

                {/* Page Addon Text */}
                <h4 className="font-bold text-lg mb-4">
                  Page Add-on Charges
                </h4>

                <ul className="text-sm text-gray-600 space-y-2 mb-8">
                  <li>• Price includes 1 PDF page</li>
                  <li>• Every additional page costs ₹100</li>
                  <li>• Charges auto-added based on total pages</li>
                </ul>

                <a
                  href="/"
                  className="block w-full bg-linear-to-r from-indigo-600 to-blue-700 text-white font-bold py-5 rounded-xl flex justify-center gap-3"
                >
                  Get Started <ArrowRight />
                </a>
              </div>
            </motion.div>

            {/* -------- DSC -------- */}

            <motion.div
              whileHover={{ y: -10 }}
              className="bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-10 text-center">
                <h3 className="text-2xl font-bold mb-2">DSC</h3>

                <div className="mb-6">
                  <span className="text-5xl font-extrabold">
                    ₹3,000
                  </span>
                </div>

                <ul className="space-y-4 text-left mb-8">
                  <li className="flex gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    USB-based DSC required
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 shrink-0" />{" "}
                    Max 10MB file size
                  </li>
                </ul>

                <h4 className="font-bold text-lg mb-4">
                  Page Add-on Charges
                </h4>

                <ul className="text-sm text-gray-600 space-y-2 mb-8">
                  <li>• Price includes 1 PDF page</li>
                  <li>• Every additional page costs ₹100</li>
                  <li>• Charges auto-added based on total pages</li>
                </ul>

                <a
                  href="/"
                  className="block w-full bg-gray-900 text-white font-bold py-5 rounded-xl flex justify-center gap-3"
                >
                  Get Started <ArrowRight />
                </a>
              </div>
            </motion.div>

            {/* -------- NE-KYC -------- */}

            <motion.div
              whileHover={{ y: -10 }}
              className="bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-green-500"
            >
              <div className="p-10 text-center">
                <h3 className="text-2xl font-bold text-green-700 mb-2 flex justify-center gap-2">
                  <Globe /> NE-KYC
                </h3>

                <div className="mb-6">
                  <span className="text-5xl font-extrabold text-green-600">
                    $35
                  </span>
                </div>

                <ul className="space-y-4 text-left mb-8">
                  <li className="flex gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    Passport required
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    KYC video meeting
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 shrink-0" />{" "}
                    Max 10MB file size
                  </li>
                </ul>

                <h4 className="font-bold text-lg mb-4">
                  Page Add-on Charges
                </h4>

                <ul className="text-sm text-gray-600 space-y-2 mb-8">
                  <li>• Price includes 1 PDF page</li>
                  <li>• Every additional page costs USD $1</li>
                  <li>• Charges auto-added based on total pages</li>
                </ul>

                <a
                  href="/"
                  className="block w-full bg-gradient-to-r from-green-600 to-emerald-700 text-white font-bold py-5 rounded-xl flex justify-center gap-3"
                >
                  Get Started <ArrowRight />
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ - Rich Snippets Ready */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-16">
            Frequently Asked Questions
          </h2>
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
            <div key={i} className="mb-4">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full text-left p-6 bg-white rounded-2xl shadow-md flex justify-between items-center text font-semibold hover:bg-gray-50 transition"
              >
                {faq.q}
                <ChevronDown
                  className={`w-6 h-6 transition ${openFaq === i ? "rotate-180" : ""
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
      </section>

      {/* Client Reviews / Testimonials */}
      <motion.section
        id="testimonials"
        className="relative py-24 bg-linear-to-b from-indigo-50 via-white to-white overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="container mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-16">
            <span className="inline-flex items-center rounded-full bg-indigo-100 px-4 py-2 text-xs font-bold uppercase tracking-wider text-indigo-700">
              Trusted by Thousands
            </span>
            <h2 className="mt-4 text-4xl md:text-5xl font-bold text-gray-900">
              What Our Users Say
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Join thousands of Indians who’ve simplified notarization with secure, instant online e-signing.
            </p>
          </div>

          {/* Testimonials Grid + Carousel */}
          <div className="relative max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
              <AnimatePresence mode="wait">
                {visibleTestimonials.map((testimonial, idx) => (
                  <motion.div
                    key={`${currentIndex}-${idx}`}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-shadow duration-300"
                  >
                    <div className="flex items-center gap-4 mb-6">
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="w-16 h-16 rounded-full object-cover ring-4 ring-indigo-100"
                      />
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{testimonial.name}</h3>
                        <p className="text-sm text-indigo-600 font-medium">{testimonial.role}</p>
                      </div>
                    </div>

                    <div className="relative">
                      <span className="absolute -left-3 -top-4 text-6xl text-indigo-200 select-none">“</span>
                      <p className="text-gray-700 text-lg leading-relaxed pl-8 pr-4 italic">
                        {testimonial.review}
                      </p>
                      <span className="absolute -bottom-8 right-4 text-6xl text-indigo-200 select-none">”</span>
                    </div>

                    <div className="mt-10 flex items-center justify-between">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className="w-5 h-5 text-yellow-500 fill-current" viewBox="0 0 24 24">
                            <path d="M12 .587l3.668 7.568L24 9.748l-6 5.848 1.416 8.268L12 18.896l-7.416 4.968L6 15.596 0 9.748l8.332-1.593z" />
                          </svg>
                        ))}
                      </div>
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" /></svg>
                        Verified User
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Navigation Controls */}
            <div className="flex justify-center items-center gap-4 mt-12">
              <button
                onClick={prevSlide}
                className="p-3 rounded-full bg-white shadow-lg border border-gray-200 hover:bg-gray-50 transition"
                aria-label="Previous"
              >
                <ChevronLeft className="w-6 h-6 text-gray-700" />
              </button>

              {/* Dots Indicator */}
              <div className="flex gap-2">
                {Array(Math.ceil(testimonials.length / 2))
                  .fill(0)
                  .map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentIndex(idx * 2)}
                      className={`transition-all duration-300 rounded-full ${Math.floor(currentIndex / 2) === idx
                        ? "w-10 h-3 bg-indigo-600"
                        : "w-3 h-3 bg-gray-300 hover:bg-gray-400"
                        }`}
                    />
                  ))}
              </div>

              <button
                onClick={nextSlide}
                className="p-3 rounded-full bg-white shadow-lg border border-gray-200 hover:bg-gray-50 transition"
                aria-label="Next"
              >
                <ChevronRight className="w-6 h-6 text-gray-700" />
              </button>
            </div>

            {/* Auto-play indicator */}
            <div className="text-center mt-6">
              <p className="text-sm text-gray-500">
                {isPaused ? "⏸ Paused" : "▶ Auto-playing"} • Changes every 6 seconds
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Final CTA */}
      <section className="py-24 bg-linear-to-r from-indigo-600 to-blue-800 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">
            Ready to Notarize Your Document Online?
          </h2>
          <p className="text-xl mb-12 opacity-90">
            Join 10,000+ satisfied users • Available 24×7 • Instant slots
          </p>
          <button onClick={() => setOpenDemo(true)} className="px-10 py-3 bg-white text-indigo-600 font-bold text-xl rounded-full hover:scale-110 transition shadow-2xl transform">
            Book Your Slot Now <ArrowRight className="inline ml-3" />
          </button>
        </div>
      </section>
      {openDemo && <DemoMeetingModel onClose={() => setOpenDemo(false)} />}
    </>
  );
}
