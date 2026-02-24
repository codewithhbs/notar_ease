"use client";

import api from "@/utils/api";
import { motion } from "framer-motion";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
  Shield,
  Headphones,
  ArrowRight,
} from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

function Ornament() {
  return (
    <div className="flex items-center justify-center gap-4 mt-4">
      <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#C9A84C]" />
      <svg width="12" height="12" viewBox="0 0 14 14" fill="#C9A84C">
        <path d="M7 0L8.5 5.5L14 7L8.5 8.5L7 14L5.5 8.5L0 7L5.5 5.5Z" />
      </svg>
      <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#C9A84C]" />
    </div>
  );
}

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, phone, message } = formData;
    if (!name || !email || !phone || !message) {
      alert("All fields are required");
      return;
    }
    try {
      setLoading(true);
      await api.post("/api/contact-enquiry/create-contact-enquiry", {
        name, email, phone, message,
      });
      toast.success("Thank you! Your message has been sent successfully.");
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const contactCards = [
    {
      icon: Phone,
      title: "Call Us",
      value: "+91 9898989898",
      sub: "Available 24×7 · Instant support",
      linkLabel: "Call Now",
      href: "tel:+919898989898",
      iconBg: "bg-[#E6F4F3]",
      iconColor: "text-[#005F5A]",
      valueColor: "text-[#005F5A]",
      linkColor: "text-[#005F5A]",
      borderColor: "border-[#005F5A]/20",
      topBar: "from-[#005F5A] to-[#00A896]",
    },
    {
      icon: MessageCircle,
      title: "WhatsApp Us",
      value: "+91 9898989898",
      sub: "Fastest response · Share documents directly",
      linkLabel: "Message on WhatsApp",
      href: "https://wa.me/919898989898",
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
      valueColor: "text-green-600",
      linkColor: "text-green-600",
      borderColor: "border-green-200",
      topBar: "from-green-400 to-green-600",
      external: true,
    },
    {
      icon: Mail,
      title: "Email Us",
      value: "support@ommdoc.com",
      sub: "Response within 5 minutes during business hours",
      linkLabel: "Send Email",
      href: "mailto:support@ommdocumentation.com",
      iconBg: "bg-[#FBF5E6]",
      iconColor: "text-[#C9A84C]",
      valueColor: "text-[#C9A84C]",
      linkColor: "text-[#C9A84C]",
      borderColor: "border-[#C9A84C]/30",
      topBar: "from-[#C9A84C] to-[#E8C56A]",
    },
  ];

  const inputClass =
    "w-full px-5 py-3.5 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#005F5A] focus:ring-2 focus:ring-[#005F5A]/10 transition-all duration-200 bg-gray-50 focus:bg-white";

  return (
    <div className="font-sans">

      {/* ── HERO ── */}
      <section className="relative bg-gradient-to-br from-[#003D39] via-[#005F5A] to-[#007A73] py-28 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-8 left-1/4 w-72 h-72 bg-[#00A896] opacity-10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-[#C9A84C] opacity-10 rounded-full blur-3xl" />
        </div>
        <div
          className="absolute bottom-0 left-0 right-0 h-16 bg-gray-50"
          style={{ clipPath: "ellipse(55% 100% at 50% 100%)" }}
        />

        <div className="relative z-10 container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-[#C9A84C]/20 border border-[#C9A84C]/50 text-[#C9A84C] px-5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-6"
          >
            <Shield size={12} />
            Supreme Court Approved · 100% Secure & Confidential
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4"
            style={{ fontFamily: "'Georgia', serif" }}
          >
            Contact Us
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-white/70 text-base max-w-md mx-auto leading-relaxed"
          >
            We're here to help you 24×7. Reach us via phone, email, WhatsApp,
            or live chat — anytime, anywhere.
          </motion.p>
        </div>
      </section>

      {/* ── CONTACT CARDS ── */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-[#00A896] text-xs font-bold tracking-[0.15em] uppercase mb-2">
              Get In Touch
            </p>
            <h2
              className="text-3xl md:text-4xl font-extrabold text-gray-900"
              style={{ fontFamily: "'Georgia', serif" }}
            >
              How Would You Like to Reach Us?
            </h2>
            <Ornament />
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {contactCards.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 36 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className={`bg-white rounded-3xl shadow-lg border ${card.borderColor} overflow-hidden hover:-translate-y-2 transition-transform duration-300`}
              >
                <div className={`h-1.5 bg-gradient-to-r ${card.topBar}`} />
                <div className="p-8 text-center flex flex-col items-center">
                  <div className={`w-16 h-16 ${card.iconBg} rounded-2xl flex items-center justify-center mb-5`}>
                    <card.icon size={28} className={card.iconColor} />
                  </div>
                  <h3
                    className="text-lg font-bold text-gray-900 mb-2"
                    style={{ fontFamily: "'Georgia', serif" }}
                  >
                    {card.title}
                  </h3>
                  <p className={`text-lg font-extrabold ${card.valueColor} mb-1`}>
                    {card.value}
                  </p>
                  <p className="text-xs text-gray-500 mb-6">{card.sub}</p>
                  <a
                    href={card.href}
                    target={card.external ? "_blank" : undefined}
                    rel={card.external ? "noopener noreferrer" : undefined}
                    className={`inline-flex items-center gap-1.5 text-sm font-bold ${card.linkColor} hover:underline`}
                  >
                    {card.linkLabel} <ArrowRight size={14} />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LIVE SUPPORT + OFFICE ── */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">

            {/* Live Chat */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55 }}
              className="bg-gradient-to-br from-[#005F5A] to-[#004845] rounded-3xl p-10 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#C9A84C] opacity-10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10">
                <div className="w-14 h-14 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center mb-6">
                  <Headphones size={26} className="text-white" />
                </div>
                <h3
                  className="text-2xl font-bold text-white mb-3"
                  style={{ fontFamily: "'Georgia', serif" }}
                >
                  24×7 Live Chat Support
                </h3>
                <p className="text-white/70 text-sm leading-relaxed mb-8">
                  Our team is online right now to help you with booking, document
                  queries, or any doubts.
                </p>
                <button className="inline-flex items-center gap-2 bg-white text-[#005F5A] font-semibold text-sm px-7 py-3.5 rounded-full hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200">
                  Start Live Chat <MessageCircle size={16} />
                </button>
              </div>
            </motion.div>

            {/* Office Address */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55 }}
              className="bg-gray-50 border border-gray-200 rounded-3xl p-10"
            >
              <div className="w-14 h-14 bg-[#E6F4F3] rounded-2xl flex items-center justify-center mb-6">
                <MapPin size={26} className="text-[#005F5A]" />
              </div>
              <h3
                className="text-2xl font-bold text-gray-900 mb-4"
                style={{ fontFamily: "'Georgia', serif" }}
              >
                Our Office
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-5">
                <span className="font-semibold text-gray-800">Omm Documentation</span>
                <br />
                102 First Floor, near Nafed House,
                <br />
                Siddhartha Enclave, Hari Nagar Ashram,
                <br />
                New Delhi, Delhi 110014
              </p>
              <div className="flex items-center gap-2 text-sm text-[#005F5A] font-medium">
                <Clock size={15} />
                Monday–Sunday: 24×7 (Online Support)
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── CONTACT FORM ── */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-[#00A896] text-xs font-bold tracking-[0.15em] uppercase mb-2">
              Drop Us a Line
            </p>
            <h2
              className="text-3xl md:text-4xl font-extrabold text-gray-900"
              style={{ fontFamily: "'Georgia', serif" }}
            >
              Send Us a Message
            </h2>
            <Ornament />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl border border-[#005F5A]/10 overflow-hidden"
          >
            <div className="h-1.5 bg-gradient-to-r from-[#005F5A] to-[#00A896]" />
            <div className="p-10 md:p-12">
              <form className="space-y-5" onSubmit={handleSubmit}>

                {/* Name + Email row */}
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold tracking-[0.08em] uppercase text-[#005F5A] mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold tracking-[0.08em] uppercase text-[#005F5A] mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-bold tracking-[0.08em] uppercase text-[#005F5A] mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="+91 9898989898"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-bold tracking-[0.08em] uppercase text-[#005F5A] mb-2">
                    Your Message
                  </label>
                  <textarea
                    rows={5}
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="How can we help you today?"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-br from-[#005F5A] to-[#004845] text-white font-semibold text-sm rounded-xl shadow-lg shadow-[#005F5A]/25 hover:shadow-[#005F5A]/45 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>Send Message <ArrowRight size={15} /></>
                  )}
                </button>

              </form>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}