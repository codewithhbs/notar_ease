"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const inputClass =
  "w-full border border-gray-200 rounded-xl py-3 text-sm text-gray-800 placeholder-gray-400 bg-gray-50 focus:bg-white focus:outline-none focus:border-[#005F5A] focus:ring-2 focus:ring-[#005F5A]/10 transition-all duration-200";

const labelClass =
  "block text-[10px] font-bold tracking-[0.08em] uppercase text-[#005F5A] mb-1.5";

function Field({ label, icon: Icon, children }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <div className="relative">
        {Icon && (
          <Icon
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        )}
        {children}
      </div>
    </div>
  );
}

export default function Page() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", confirm: "", userName: "", familyName: "",
  });

  const isEmail = (s) => /\S+@\S+\.\S+/.test(s);
  const isStrongPassword = (s) => s.length >= 8;

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg(null);
    if (!formData.userName?.trim()) return setErrorMsg("Username is required.");
    if (!formData.name?.trim()) return setErrorMsg("Given name is required.");
    if (!formData.email || !isEmail(formData.email)) return setErrorMsg("Valid email is required.");
    if (!formData.password || !isStrongPassword(formData.password)) return setErrorMsg("Password must be at least 8 characters.");
    if (formData.password !== formData.confirm) return setErrorMsg("Passwords do not match.");
    setLoading(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
      const payload = {
        name: formData.name, email: formData.email.toLowerCase(),
        password: formData.password, userName: formData.userName, familyName: formData.familyName,
      };
      const res = await axios.post(`${API_BASE}/api/auth/register`, payload, { timeout: 15000 });
      if (res?.data?.success) {
        const { user, accessToken, refreshToken, sessionId } = res.data;
        try {
          localStorage.setItem("user", JSON.stringify(user));
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("refreshToken", refreshToken);
          localStorage.setItem("sessionId", sessionId);
          window.dispatchEvent(new Event("user-login"));
        } catch (err) { console.warn("LocalStorage error:", err); }
        toast.success("Account created successfully! Redirecting...", { autoClose: 1800 });
        setTimeout(() => { router.push("/dashboard"); }, 1400);
      } else {
        const message = res?.data?.message || "Registration failed";
        setErrorMsg(message); toast.error(message);
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || err?.message || "Internal server error";
      setErrorMsg(msg); toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <ToastContainer position="top-right" newestOnTop theme="colored" />

      <div className="min-h-screen bg-gray-50 flex font-sans">

        {/* ── Left Panel ── */}
        <div className="hidden lg:flex lg:w-5/12 relative bg-gradient-to-br from-[#003D39] via-[#005F5A] to-[#007A73] flex-col items-center justify-center p-12 overflow-hidden">
          <div className="absolute top-10 left-10 w-64 h-64 bg-[#00A896] opacity-10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 right-10 w-56 h-56 bg-[#C9A84C] opacity-10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 text-center max-w-xs">
            <div className="w-20 h-20 bg-white/10 border border-white/20 rounded-3xl flex items-center justify-center mx-auto mb-8 backdrop-blur-sm">
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                <path d="M18 4L32 12V24L18 32L4 24V12L18 4Z" stroke="#C9A84C" strokeWidth="2" fill="none" />
                <path d="M18 10L26 14.5V23.5L18 28L10 23.5V14.5L18 10Z" fill="#C9A84C" fillOpacity="0.3" />
                <circle cx="18" cy="18" r="4" fill="#C9A84C" />
              </svg>
            </div>

            <h2 className="text-3xl font-extrabold text-white mb-4 leading-tight" style={{ fontFamily: "'Georgia', serif" }}>
              Omm Documentation
            </h2>
            <p className="text-white/60 text-sm leading-relaxed mb-10">
              India's first court-approved online e-Notary platform. Fast, secure, and accessible from anywhere.
            </p>

            {["Supreme Court Approved", "100% Secure & Confidential", "50+ Countries Served"].map((badge, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-white/70 mb-3">
                <span className="text-[#C9A84C]">✦</span>
                <span>{badge}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right Panel ── */}
        <div className="flex-1 flex items-center justify-center px-6 py-10 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="w-full max-w-xl"
          >
            {/* Mobile logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="w-14 h-14 bg-[#005F5A] rounded-2xl flex items-center justify-center mx-auto mb-3">
                <svg width="24" height="24" viewBox="0 0 36 36" fill="none">
                  <path d="M18 4L32 12V24L18 32L4 24V12L18 4Z" stroke="#C9A84C" strokeWidth="2" fill="none" />
                  <circle cx="18" cy="18" r="4" fill="#C9A84C" />
                </svg>
              </div>
              <p className="text-xs font-bold tracking-widest uppercase text-[#005F5A]">Omm Documentation</p>
            </div>

            {/* Heading */}
            <div className="mb-7">
              <p className="text-[#00A896] text-xs font-bold tracking-[0.15em] uppercase mb-1">Get Started</p>
              <h1 className="text-3xl font-extrabold text-gray-900 mb-1" style={{ fontFamily: "'Georgia', serif" }}>
                Create Your Account
              </h1>
              <p className="text-sm text-gray-400">Start notarising documents online in minutes.</p>
            </div>

            {/* Card */}
            <div className="bg-white rounded-3xl border border-[#005F5A]/10 shadow-sm overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-[#005F5A] to-[#00A896]" />

              <form className="p-8 space-y-5" onSubmit={handleSubmit}>

                {/* Username — full width */}
                <Field label="Username" icon={User}>
                  <input
                    name="userName" value={formData.userName} onChange={handleChange}
                    type="text" required placeholder="hitesh123"
                    className={`${inputClass} pl-10`}
                  />
                </Field>

                {/* Given + Family name */}
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Given Name">
                    <input
                      name="name" value={formData.name} onChange={handleChange}
                      type="text" required placeholder="First name"
                      className={`${inputClass} px-4`}
                    />
                  </Field>
                  <Field label="Family Name">
                    <input
                      name="familyName" value={formData.familyName} onChange={handleChange}
                      type="text" required placeholder="Last name"
                      className={`${inputClass} px-4`}
                    />
                  </Field>
                </div>

                {/* Email — full width */}
                <Field label="Email Address" icon={Mail}>
                  <input
                    name="email" value={formData.email} onChange={handleChange}
                    type="email" required placeholder="you@example.com"
                    className={`${inputClass} pl-10`}
                  />
                </Field>

                {/* Password + Confirm */}
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Password" icon={Lock}>
                    <input
                      name="password" value={formData.password} onChange={handleChange}
                      type={showPassword ? "text" : "password"} required placeholder="Min. 8 characters"
                      className={`${inputClass} pl-10 pr-10`}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </Field>

                  <Field label="Confirm Password" icon={Lock}>
                    <input
                      name="confirm" value={formData.confirm} onChange={handleChange}
                      type={showConfirm ? "text" : "password"} required placeholder="Repeat password"
                      className={`${inputClass} pl-10 pr-10`}
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                      {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </Field>
                </div>

                {/* Error */}
                {errorMsg && (
                  <p className="text-xs text-red-500 text-center bg-red-50 border border-red-100 rounded-xl py-2.5 px-4">
                    {errorMsg}
                  </p>
                )}

                {/* Submit */}
                <button
                  type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-br from-[#005F5A] to-[#004845] text-white text-sm font-semibold rounded-xl shadow-lg shadow-[#005F5A]/25 hover:shadow-[#005F5A]/45 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 mt-1"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Creating Account...
                    </>
                  ) : (
                    <>Create Account <ArrowRight size={15} /></>
                  )}
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-gray-100" />
                  <span className="text-xs text-gray-400">or</span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>

                {/* Sign in link */}
                <p className="text-center text-sm text-gray-500">
                  Already have an account?{" "}
                  <Link href="/login" className="font-bold text-[#005F5A] hover:underline">
                    Sign in
                  </Link>
                </p>
              </form>
            </div>

            {/* Footer */}
            <p className="text-center text-xs text-gray-400 mt-6">
              By creating an account, you agree to our{" "}
              <Link href="/terms" className="text-[#005F5A] hover:underline">Terms of Service</Link>
              {" "}and{" "}
              <Link href="/privacy" className="text-[#005F5A] hover:underline">Privacy Policy</Link>.
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
}