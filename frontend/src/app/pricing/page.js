"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Shield, CheckCircle, Globe, Mail, ArrowRight } from "lucide-react";

/* ---------------- SIGNATURE TYPES ---------------- */

const SIGNATURE_TYPES = [
  { id: "aadhaar", label: "Aadhaar E-sign", currency: "INR" },
  { id: "dsc", label: "DSC", currency: "INR" },
  { id: "nekyc", label: "NE-KYC", currency: "USD" },
];

/* ---------------- BASE PRICES ---------------- */

const BASE_PRICES = {
  aadhaar: 1000,
  dsc: 3000,
  nekyc: 35,
};

/* ---------------- PRICE CALCULATOR ---------------- */

function getTotalPrice(signatureType, pages) {
  const base = BASE_PRICES[signatureType] || 0;

  // NE-KYC → fixed pricing (no page addon)
  if (signatureType === "nekyc") {
    // return base;
    // Page addon $1 per extra page
    const extraPages = pages > 1 ? (pages - 1) * 1 : 0;

    return base + extraPages;
  }

  // Page addon ₹100 per extra page
  const extraPages = pages > 1 ? (pages - 1) * 100 : 0;

  return base + extraPages;
}

/* ---------------- PAGE ---------------- */

export default function Page() {
  const [signatureType, setSignatureType] = useState("aadhaar");
  const [pages, setPages] = useState(1);

  const basePrice = BASE_PRICES[signatureType];

  const { currency, label } =
    SIGNATURE_TYPES.find((t) => t.id === signatureType) ||
    SIGNATURE_TYPES[0];

  const totalPrice = useMemo(
    () => getTotalPrice(signatureType, pages),
    [signatureType, pages]
  );

  return (
    <>
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

      {/* ---------------- CALCULATOR ---------------- */}

      <section className="py-16 bg-white">
        <div className="container mx-auto px-6 max-w-3xl">

          <h2 className="text-3xl font-bold text-center mb-10">
            Calculate Your Price
          </h2>

          {/* Signature Type */}
          <div className="mb-6">
            <label className="font-semibold mb-2 block">
              Signature Type
            </label>

            <div className="grid grid-cols-3 gap-3">
              {SIGNATURE_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSignatureType(type.id)}
                  className={`border rounded-xl py-3 ${signatureType === type.id
                    ? "bg-indigo-50 border-indigo-500"
                    : "bg-gray-50"
                    }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Pages Slider */}
          <div className="mb-6">
            <label className="font-semibold mb-2 block">
              Number of PDF Pages
            </label>

            <input
              type="range"
              min={1}
              max={50}
              value={pages}
              onChange={(e) => setPages(Number(e.target.value))}
              className="w-full"
            />

            <p className="text-sm mt-2">
              Pages: <b>{pages}</b>
            </p>

            <p className="text-xs text-gray-500">
              First page included. ₹100 per extra page.
            </p>
          </div>

          {/* Estimate */}
          <div className="border-t pt-6">
            <p>Plan: {label}</p>
            <p>Base Price: {basePrice} {currency}</p>
            <p>Pages: {pages}</p>

            <p className="text-3xl font-bold text-indigo-700 mt-3">
              Total: {totalPrice} {currency}
            </p>
          </div>
        </div>
      </section>

      {/* ---------------- CONTACT ---------------- */}

      <section className="py-16 bg-gray-50 text-center">
        <Mail className="mx-auto mb-4" />
        hello@ommdocumentation.com
      </section>
    </>
  );
}
