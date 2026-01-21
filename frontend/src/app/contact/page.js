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
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
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
        name,
        email,
        phone,
        message,
      });

      toast.success("Thank you! Your message has been sent successfully.");

      // reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        message: "",
      });
    } catch (error) {
      console.log("Internal server error", error);
      toast.error(error.response?.data?.message || "Something went wrong. Please try again.");
      // alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Hero Section */}
      <section className="bg-linear-to-b from-indigo-50 to-white py-15">
        <div className="container mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl md:text-4xl font-extrabold text-gray-900 mb-4"
          >
            Contact Us
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xl md:text-xl text-gray-700 max-w-4xl mx-auto"
          >
            We’re here to help you 24×7. Get in touch with us via phone, email,
            WhatsApp, or live chat.
          </motion.p>

          <div className="mt-10 inline-flex items-center gap-3 bg-green-100 text-green-800 px-6 py-3 rounded-full text-lg font-semibold">
            <Shield className="w-6 h-6" />
            Supreme Court Approved • 100% Secure & Confidential
          </div>
        </div>
      </section>

      {/* Contact Options Grid */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-10 max-w-5xl mx-auto">
            {/* Call Us */}
            <motion.div
              whileHover={{ y: -10 }}
              className="bg-white p-10 rounded-3xl shadow-xl text-center border border-gray-200"
            >
              <div className="bg-indigo-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Phone className="w-10 h-10 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold mb-4">Call Us</h3>
              <p className="text-xl font-extrabold text-indigo-600 mb-2">
                +91 9898989898
              </p>
              <p className="text-gray-600">Available 24×7 • Instant support</p>
              <a
                href="tel:+919876543210"
                className="mt-6 inline-flex items-center gap-2 text-indigo-600 font-bold hover:underline"
              >
                Call Now <ArrowRight className="w-5 h-5" />
              </a>
            </motion.div>

            {/* WhatsApp */}
            <motion.div
              whileHover={{ y: -10 }}
              className="bg-white p-10 rounded-3xl shadow-xl text-center border border-gray-200"
            >
              <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-4">WhatsApp Us</h3>
              <p className="text-xl font-extrabold text-green-600 mb-2">
                +91 9898989898
              </p>
              <p className="text-gray-600">
                Fastest response • Share documents directly
              </p>
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 text-green-600 font-bold hover:underline"
              >
                Message on WhatsApp <ArrowRight className="w-5 h-5" />
              </a>
            </motion.div>

            {/* Email Us */}
            <motion.div
              whileHover={{ y: -10 }}
              className="bg-white p-10 rounded-3xl shadow-xl text-center border border-gray-200"
            >
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-4">Email Us</h3>
              <p className="text-xl font-extrabold text-blue-600 mb-2">
                support@ommdoc.com
              </p>
              <p className="text-gray-600">
                Response within 5 minutes during business hours
              </p>
              <a
                href="mailto:support@ommdocumentation.com"
                className="mt-6 inline-flex items-center gap-2 text-blue-600 font-bold hover:underline"
              >
                Send Email <ArrowRight className="w-5 h-5" />
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Live Support & Office Info */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Live Chat Support */}
            <div className="bg-linear-to-br from-indigo-50 to-blue-50 p-10 rounded-3xl">
              <div className="flex items-center gap-4 mb-6">
                <Headphones className="w-10 h-10 text-indigo-600" />
                <h3 className="text-2xl font-bold">24×7 Live Chat Support</h3>
              </div>
              <p className="text-lg text-gray-700 mb-6">
                Our team is online right now to help you with booking, document
                queries, or any doubts.
              </p>
              <button className="bg-indigo-600 text-white px-8 py-4 rounded-full font-bold hover:shadow-xl transition transform hover:scale-105 flex items-center gap-3">
                Start Live Chat <MessageCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Office Address */}
            <div className="bg-linear-to-br from-gray-50 to-gray-100 p-10 rounded-3xl">
              <div className="flex items-center gap-4 mb-6">
                <MapPin className="w-10 h-10 text-gray-700" />
                <h3 className="text-3xl font-bold">Our Office</h3>
              </div>
              <p className="text-lg text-gray-700 leading-relaxed">
                Omm Documentation.
                <br />
                102 First Floor, near Nafed House, Siddhartha Enclave, Hari Nagar Ashram, New Delhi, Delhi 110014
                <br />
                <br />
                <span className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-5 h-5" />
                  Monday–Sunday: 24×7 (Online Support)
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6 max-w-3xl">
          <div className="bg-white p-10 md:p-12 rounded-3xl shadow-2xl">
            <h2 className="text-4xl font-bold text-center mb-8">
              Send Us a Message
            </h2>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-lg font-semibold mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-6 py-4 border border-gray-300 rounded-xl focus:outline-none focus:border-indigo-600"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-lg font-semibold mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-6 py-4 border border-gray-300 rounded-xl focus:outline-none focus:border-indigo-600"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-lg font-semibold mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-6 py-4 border border-gray-300 rounded-xl focus:outline-none focus:border-indigo-600"
                  placeholder="+91 9898989898"
                />
              </div>

              <div>
                <label className="block text-lg font-semibold mb-2">
                  Your Message
                </label>
                <textarea
                  rows={6}
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-6 py-4 border border-gray-300 rounded-xl focus:outline-none focus:border-indigo-600"
                  placeholder="How can we help you today?"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-linear-to-r from-indigo-600 to-blue-700 text-white font-bold py-5 rounded-xl hover:shadow-2xl transition transform hover:scale-105 text-xl disabled:opacity-60"
              >
                {loading ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </section>

    </>
  );
}
