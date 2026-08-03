'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function Page() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ userName: '', password: '' });

  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.ommdocumentation.com";

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/api/auth/login`, formData);
      if (res.data.success) {
        const { user, accessToken, refreshToken, sessionId } = res.data;
        try {
          localStorage.setItem("user", JSON.stringify(user));
          localStorage.setItem("accessToken", accessToken || "");
          localStorage.setItem("refreshToken", refreshToken || "");
          localStorage.setItem("sessionId", sessionId || "");
          window.dispatchEvent(new Event("user-login"));
        } catch (err) { console.warn("LocalStorage error:", err); }
        toast.success("Login successful! Redirecting...", { autoClose: 500 });
        setTimeout(() => { router.push("/dashboard"); }, 500);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">

      {/* ── Left Panel (decorative) ── */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[#003D39] via-[#005F5A] to-[#007A73] flex-col items-center justify-center p-12 overflow-hidden">
        {/* blobs */}
        <div className="absolute top-10 left-10 w-64 h-64 bg-[#00A896] opacity-10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-56 h-56 bg-[#C9A84C] opacity-10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center max-w-sm">
          {/* Logo mark */}
          <div className="w-20 h-20 bg-white/10 border border-white/20 rounded-3xl flex items-center justify-center mx-auto mb-8 backdrop-blur-sm">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <path d="M18 4L32 12V24L18 32L4 24V12L18 4Z" stroke="#C9A84C" strokeWidth="2" fill="none" />
              <path d="M18 10L26 14.5V23.5L18 28L10 23.5V14.5L18 10Z" fill="#C9A84C" fillOpacity="0.3" />
              <circle cx="18" cy="18" r="4" fill="#C9A84C" />
            </svg>
          </div>

          <h2
            className="text-3xl font-extrabold text-white mb-4 leading-tight"
            style={{ fontFamily: "'Georgia', serif" }}
          >
            Omm Documentation
          </h2>
          <p className="text-white/60 text-sm leading-relaxed mb-10">
            India's first court-approved online e-Notary platform. Fast, secure, and accessible from anywhere.
          </p>

          {/* trust badges */}
          {[
            "✦ Supreme Court Approved",
            "✦ 100% Secure & Confidential",
            "✦ 50+ Countries Served",
          ].map((badge, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-white/70 mb-3">
              <span className="text-[#C9A84C] text-xs">{badge.split(' ')[0]}</span>
              <span>{badge.slice(2)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right Panel (form) ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="w-full max-w-md"
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
          <div className="mb-8">
            <p className="text-[#00A896] text-xs font-bold tracking-[0.15em] uppercase mb-1">Welcome Back</p>
            <h1
              className="text-3xl font-extrabold text-gray-900 mb-1"
              style={{ fontFamily: "'Georgia', serif" }}
            >
              Sign In
            </h1>
            <p className="text-sm text-gray-400">
              Enter your credentials to access your account.
            </p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl border border-[#005F5A]/10 shadow-sm overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-[#005F5A] to-[#00A896]" />

            <form onSubmit={handleLogin} className="p-8 space-y-5">

              {/* Username */}
              <div>
                <label className="block text-[10px] font-bold tracking-[0.08em] uppercase text-[#005F5A] mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    name="userName"
                    value={formData.userName}
                    onChange={handleChange}
                    required
                    placeholder="Your username"
                    className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 bg-gray-50 focus:bg-white focus:outline-none focus:border-[#005F5A] focus:ring-2 focus:ring-[#005F5A]/10 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[10px] font-bold tracking-[0.08em] uppercase text-[#005F5A]">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-semibold text-[#005F5A] hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="••••••••"
                    className="w-full pl-11 pr-12 py-3.5 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 bg-gray-50 focus:bg-white focus:outline-none focus:border-[#005F5A] focus:ring-2 focus:ring-[#005F5A]/10 transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <p className="text-xs text-red-500 text-center bg-red-50 border border-red-100 rounded-xl py-2.5 px-4">
                  {error}
                </p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-br from-[#005F5A] to-[#004845] text-white text-sm font-semibold rounded-xl shadow-lg shadow-[#005F5A]/25 hover:shadow-[#005F5A]/45 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Signing In...
                  </>
                ) : (
                  <>Sign In <ArrowRight size={15} /></>
                )}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 pt-1">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs text-gray-400">or</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              {/* Signup link */}
              <p className="text-center text-sm text-gray-500">
                Don&apos;t have an account?{' '}
                <Link
                  href="/signup"
                  className="font-bold text-[#005F5A] hover:underline"
                >
                  Sign up free
                </Link>
              </p>
            </form>
          </div>

          {/* Footer note */}
          <p className="text-center text-xs text-gray-400 mt-6">
            By signing in, you agree to our{' '}
            <Link href="/terms" className="text-[#005F5A] hover:underline">Terms of Service</Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-[#005F5A] hover:underline">Privacy Policy</Link>.
          </p>
        </motion.div>
      </div>
    </div>
  );
}