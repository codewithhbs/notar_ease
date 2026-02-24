"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Shield, CheckCircle, Globe, Mail, ArrowRight, Zap, Usb } from "lucide-react";

/* ── CONSTANTS ── */
const SIGNATURE_TYPES = [
  { id: "aadhaar", label: "Aadhaar E-sign", currency: "INR" },
  { id: "dsc",    label: "DSC",             currency: "INR" },
  { id: "nekyc",  label: "NE-KYC",          currency: "USD" },
];

const BASE_PRICES = { aadhaar: 1000, dsc: 3000, nekyc: 35 };

function getTotalPrice(signatureType, pages) {
  const base = BASE_PRICES[signatureType] || 0;
  if (signatureType === "nekyc") {
    return base + (pages > 1 ? (pages - 1) * 1 : 0);
  }
  return base + (pages > 1 ? (pages - 1) * 100 : 0);
}

/* ── ORNAMENT ── */
function Ornament() {
  return (
    <div className="flex items-center justify-center gap-4 mt-4 mb-0">
      <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#C9A84C]" />
      <svg width="12" height="12" viewBox="0 0 14 14" fill="#C9A84C">
        <path d="M7 0L8.5 5.5L14 7L8.5 8.5L7 14L5.5 8.5L0 7L5.5 5.5Z" />
      </svg>
      <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#C9A84C]" />
    </div>
  );
}

/* ── ADDON BOX ── */
function AddonBox({ usd = false }) {
  return (
    <div className={`rounded-2xl p-4 mb-6 ${usd ? 'bg-[#FBF5E6]' : 'bg-[#F7F9F9]'}`}>
      <p className={`text-[10px] font-bold tracking-[0.1em] uppercase mb-3 ${usd ? 'text-[#8B6914]' : 'text-[#005F5A]'}`}>
        Page Add-on
      </p>
      <ul className="space-y-1.5">
        {[
          '1 PDF page included in base price',
          `Every additional page costs ${usd ? 'USD $1' : '₹100'}`,
          'Auto-added based on total pages',
        ].map((txt, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-gray-500">
            <span className={`mt-0.5 font-bold ${usd ? 'text-[#C9A84C]' : 'text-[#00A896]'}`}>→</span>
            {txt}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── PAGE ── */
export default function PricingPage() {
  const [signatureType, setSignatureType] = useState("aadhaar");
  const [pages, setPages] = useState(1);

  const basePrice = BASE_PRICES[signatureType];
  const { currency, label } =
    SIGNATURE_TYPES.find((t) => t.id === signatureType) || SIGNATURE_TYPES[0];
  const totalPrice = useMemo(() => getTotalPrice(signatureType, pages), [signatureType, pages]);

  const sym = currency === "USD" ? "$" : "₹";
  const pct = ((pages - 1) / 49) * 100;

  return (
    <div className="font-sans">

      {/* ── HERO ── */}
      <section className="relative bg-gradient-to-br from-[#003D39] via-[#005F5A] to-[#007A73] py-28 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-1/4 w-72 h-72 bg-[#00A896] opacity-10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-[#C9A84C] opacity-10 rounded-full blur-3xl" />
        </div>
        <div
          className="absolute bottom-0 left-0 right-0 h-16 bg-gray-50"
          style={{ clipPath: 'ellipse(55% 100% at 50% 100%)' }}
        />

        <div className="relative z-10 container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-[#C9A84C]/20 border border-[#C9A84C]/50 text-[#C9A84C] px-5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-6"
          >
            <Shield size={12} />
            Court-Accepted eNotarised Platform
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4"
            style={{ fontFamily: "'Georgia', serif" }}
          >
            Simple & Transparent Pricing
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-white/70 text-base max-w-md mx-auto leading-relaxed"
          >
            Choose the method that works best for you. No hidden charges.
          </motion.p>
        </div>
      </section>

      {/* ── PRICING CARDS ── */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-[#00A896] text-xs font-bold tracking-[0.15em] uppercase mb-2">
              Our Plans
            </p>
            <h2
              className="text-3xl md:text-4xl font-extrabold text-gray-900"
              style={{ fontFamily: "'Georgia', serif" }}
            >
              Choose Your Signing Method
            </h2>
            <Ornament />
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">

            {/* ── Aadhaar ── */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-3xl shadow-xl border-2 border-[#005F5A] overflow-hidden flex flex-col hover:-translate-y-2 transition-transform duration-300"
            >
              {/* top stripe */}
              <div className="h-1.5 bg-gradient-to-r from-[#005F5A] to-[#00A896]" />

              <div className="p-8 flex flex-col flex-1">
                {/* tag */}
                <div className="self-end -mt-2 mb-4 bg-[#005F5A] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                  Most Popular
                </div>

                {/* icon + title */}
                <div className="w-12 h-12 bg-[#E6F4F3] rounded-2xl flex items-center justify-center mb-4">
                  <Zap size={22} className="text-[#005F5A]" />
                </div>
                <h3
                  className="text-xl font-bold text-[#005F5A] mb-1"
                  style={{ fontFamily: "'Georgia', serif" }}
                >
                  Aadhaar e-Sign
                </h3>
                <p className="text-xs text-gray-400 mb-4">per document · 1 page included</p>

                {/* price */}
                <div
                  className="text-4xl font-extrabold text-[#005F5A] mb-6"
                  style={{ fontFamily: "'Georgia', serif" }}
                >
                  ₹1,000
                </div>

                {/* features */}
                <div className="h-px bg-gradient-to-r from-transparent via-[#005F5A]/10 to-transparent mb-5" />
                {['Mobile-linked Aadhaar required', 'Max 10MB file size'].map((f, i) => (
                  <div key={i} className="flex items-start gap-2 mb-3">
                    <CheckCircle size={15} className="text-[#005F5A] mt-0.5 shrink-0" />
                    <span className="text-sm text-gray-600">{f}</span>
                  </div>
                ))}

                <div className="mt-4 flex-1">
                  <AddonBox />
                </div>

                <a
                  href="/"
                  className="flex items-center justify-center gap-2 w-full py-3.5 bg-gradient-to-br from-[#005F5A] to-[#004845] text-white text-sm font-semibold rounded-xl shadow-md shadow-[#005F5A]/20 hover:shadow-[#005F5A]/40 hover:-translate-y-0.5 transition-all duration-200"
                >
                  Get Started <ArrowRight size={15} />
                </a>
              </div>
            </motion.div>

            {/* ── DSC ── */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden flex flex-col hover:-translate-y-2 transition-transform duration-300"
            >
              <div className="h-1.5 bg-gradient-to-r from-gray-300 to-gray-500" />

              <div className="p-8 flex flex-col flex-1">
                <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mb-4 mt-6">
                  <Usb size={22} className="text-gray-600" />
                </div>
                <h3
                  className="text-xl font-bold text-gray-900 mb-1"
                  style={{ fontFamily: "'Georgia', serif" }}
                >
                  DSC
                </h3>
                <p className="text-xs text-gray-400 mb-4">per document · 1 page included</p>

                <div
                  className="text-4xl font-extrabold text-gray-900 mb-6"
                  style={{ fontFamily: "'Georgia', serif" }}
                >
                  ₹3,000
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-5" />
                {['USB-based DSC required', 'Max 10MB file size'].map((f, i) => (
                  <div key={i} className="flex items-start gap-2 mb-3">
                    <CheckCircle size={15} className="text-[#005F5A] mt-0.5 shrink-0" />
                    <span className="text-sm text-gray-600">{f}</span>
                  </div>
                ))}

                <div className="mt-4 flex-1">
                  <AddonBox />
                </div>

                <a
                  href="/"
                  className="flex items-center justify-center gap-2 w-full py-3.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-black hover:-translate-y-0.5 transition-all duration-200"
                >
                  Get Started <ArrowRight size={15} />
                </a>
              </div>
            </motion.div>

            {/* ── NE-KYC ── */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-3xl shadow-lg border-2 border-[#C9A84C]/50 overflow-hidden flex flex-col hover:-translate-y-2 transition-transform duration-300"
            >
              <div className="h-1.5 bg-gradient-to-r from-[#C9A84C] to-[#E8C56A]" />

              <div className="p-8 flex flex-col flex-1">
                <div className="self-end -mt-2 mb-4 bg-[#C9A84C] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                  For NRIs
                </div>

                <div className="w-12 h-12 bg-[#FBF5E6] rounded-2xl flex items-center justify-center mb-4">
                  <Globe size={22} className="text-[#C9A84C]" />
                </div>
                <h3
                  className="text-xl font-bold text-[#8B6914] mb-1"
                  style={{ fontFamily: "'Georgia', serif" }}
                >
                  NE-KYC
                </h3>
                <p className="text-xs text-gray-400 mb-4">per document · 1 page included</p>

                <div
                  className="text-4xl font-extrabold text-[#C9A84C] mb-6"
                  style={{ fontFamily: "'Georgia', serif" }}
                >
                  $35
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-[#C9A84C]/20 to-transparent mb-5" />
                {['Passport required', 'KYC video meeting', 'Max 10MB file size'].map((f, i) => (
                  <div key={i} className="flex items-start gap-2 mb-3">
                    <CheckCircle size={15} className="text-[#C9A84C] mt-0.5 shrink-0" />
                    <span className="text-sm text-gray-600">{f}</span>
                  </div>
                ))}

                <div className="mt-4 flex-1">
                  <AddonBox usd />
                </div>

                <a
                  href="/"
                  className="flex items-center justify-center gap-2 w-full py-3.5 bg-gradient-to-br from-[#C9A84C] to-[#a88030] text-white text-sm font-semibold rounded-xl shadow-md shadow-[#C9A84C]/20 hover:shadow-[#C9A84C]/40 hover:-translate-y-0.5 transition-all duration-200"
                >
                  Get Started <ArrowRight size={15} />
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── CALCULATOR ── */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-[#00A896] text-xs font-bold tracking-[0.15em] uppercase mb-2">
              Estimate Instantly
            </p>
            <h2
              className="text-3xl md:text-4xl font-extrabold text-gray-900"
              style={{ fontFamily: "'Georgia', serif" }}
            >
              Calculate Your Price
            </h2>
            <Ornament />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl border border-[#005F5A]/10 overflow-hidden"
          >
            {/* top bar */}
            <div className="h-1.5 bg-gradient-to-r from-[#005F5A] to-[#00A896]" />

            <div className="p-10">
              {/* Signature Type */}
              <div className="mb-8">
                <label className="block text-[10px] font-bold tracking-[0.12em] uppercase text-[#005F5A] mb-3">
                  Signature Type
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {SIGNATURE_TYPES.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setSignatureType(type.id)}
                      className={`py-3 px-2 rounded-xl text-sm font-medium border transition-all duration-200 ${
                        signatureType === type.id
                          ? "bg-[#E6F4F3] border-[#005F5A] text-[#005F5A] font-semibold"
                          : "bg-gray-50 border-gray-200 text-gray-500 hover:border-[#005F5A]/40 hover:text-[#005F5A]"
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pages Slider */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-[10px] font-bold tracking-[0.12em] uppercase text-[#005F5A]">
                    Number of PDF Pages
                  </label>
                  <span
                    className="text-xl font-extrabold text-[#005F5A]"
                    style={{ fontFamily: "'Georgia', serif" }}
                  >
                    {pages} {pages === 1 ? 'page' : 'pages'}
                  </span>
                </div>

                {/* custom slider via inline style for gradient fill */}
                <input
                  type="range"
                  min={1}
                  max={50}
                  value={pages}
                  onChange={(e) => setPages(Number(e.target.value))}
                  className="w-full h-1.5 rounded-full outline-none cursor-pointer appearance-none"
                  style={{
                    background: `linear-gradient(90deg, #005F5A ${pct}%, #E6F4F3 ${pct}%)`,
                  }}
                />

                <div className="flex justify-between text-xs text-gray-400 mt-2">
                  <span>1 page</span>
                  <span className="text-[11px] text-gray-400">
                    First page free · {signatureType === "nekyc" ? "$1" : "₹100"} per extra page
                  </span>
                  <span>50 pages</span>
                </div>
              </div>

              {/* Result */}
              <div className="relative bg-gradient-to-br from-[#004845] to-[#005F5A] rounded-2xl p-8 overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute right-0 top-0 w-40 h-40 bg-[#C9A84C] opacity-10 rounded-full blur-2xl" />
                </div>
                <div className="relative z-10 space-y-3">
                  {[
                    ['Plan', label],
                    ['Base Price', `${sym}${basePrice}`],
                    ['Pages', pages],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between items-center text-sm">
                      <span className="text-white/60">{k}</span>
                      <span className="text-white/90 font-medium">{v}</span>
                    </div>
                  ))}

                  <div className="border-t border-white/15 pt-4 mt-2 flex justify-between items-center">
                    <span className="text-white/80 font-semibold text-sm">Total Estimate</span>
                    <span
                      className="text-3xl font-extrabold text-white"
                      style={{ fontFamily: "'Georgia', serif" }}
                    >
                      {sym}{totalPrice}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}