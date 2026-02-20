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
  const [formData, setFormData] = useState({
    userName: '',
    password: '',
  });

  const router = useRouter();
  // const { setUser } = useAuthStore();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "https://www.api.ommdocumentation.com";

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/api/auth/login`, formData);

      if (res.data.success) {
        const { user, accessToken, refreshToken, sessionId } = res.data;

        // 🔐 Store in localStorage
        try {
          localStorage.setItem("user", JSON.stringify(user));
          localStorage.setItem("accessToken", accessToken || "");
          localStorage.setItem("refreshToken", refreshToken || "");
          localStorage.setItem("sessionId", sessionId || "");

          // Trigger update
          window.dispatchEvent(new Event("user-login"));
        } catch (err) {
          console.warn("LocalStorage error:", err);
        }

        toast.success("Login successful! Redirecting...", {
          autoClose: 500,
        });

        setTimeout(() => {
          router.push("/dashboard");
        }, 500);
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      // setError(message);
      toast.error(message);
      console.log('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-indigo-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900">Welcome Back</h1>
          <p className="mt-3 text-lg text-gray-600">Sign in to your Omm Documentation account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 border border-gray-100">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="userName"
                  value={formData.userName}
                  onChange={handleChange}
                  required
                  className="w-full text-black pl-12 pr-5 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="Your username"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <Link href="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full text-black pl-12 pr-14 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-linear-to-r from-indigo-600 to-blue-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-indigo-700 hover:to-blue-700 transition shadow-lg flex items-center justify-center gap-3 ${loading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
            >
              {loading ? 'Signing In...' : 'Sign In'}
              {!loading && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>

          <p className="mt-8 text-center text-gray-600">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-semibold text-indigo-600 hover:text-indigo-700">
              Sign up free
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}