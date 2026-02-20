"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// const API_BASE =
//   process.env.NEXT_PUBLIC_API_BASE_URL || "https://www.api.ommdocumentation.com";

export default function Page() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    // phone: "",
    password: "",
    confirm: "",
    userName: "",
    familyName: "",
  });

  // small helper validators
  const isEmail = (s) => /\S+@\S+\.\S+/.test(s);
  const isStrongPassword = (s) => s.length >= 8; // change to stronger policy if needed

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg(null);

    // client-side validation
    if (!formData.userName?.trim()) return setErrorMsg("Username is required.");
    if (!formData.name?.trim()) return setErrorMsg("Given name is required.");
    if (!formData.email || !isEmail(formData.email)) return setErrorMsg("Valid email is required.");
    if (!formData.password || !isStrongPassword(formData.password))
      return setErrorMsg("Password must be at least 8 characters.");
    if (formData.password !== formData.confirm) return setErrorMsg("Passwords do not match.");

    setLoading(true);

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

      const payload = {
        name: formData.name,
        email: formData.email.toLowerCase(),
        // phone: formData.phone,
        password: formData.password,
        userName: formData.userName,
        // include familyName if backend expects it under some field (e.g. lastName)
        familyName: formData.familyName,
      };

      // NOTE: not using withCredentials because you're not using cookies right now
      const res = await axios.post(`${API_BASE}/api/auth/register`, payload, {
        timeout: 15000,
      });

      if (res?.data?.success) {
        const { user, accessToken, refreshToken, sessionId } = res.data;

        // 🔐 Store in localStorage
        try {
          localStorage.setItem("user", JSON.stringify(user));
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("refreshToken", refreshToken);
          localStorage.setItem("sessionId", sessionId);

          // Trigger update
          window.dispatchEvent(new Event("user-login"));
        } catch (err) {
          console.warn("LocalStorage error:", err);
        }

        toast.success("Account created successfully! Redirecting...", {
          autoClose: 1800,
        });

        setTimeout(() => {
          router.push("/dashboard");
        }, 1400);
      } else {
        const message = res?.data?.message || "Registration failed";
        setErrorMsg(message);
        toast.error(message);
      }
    } catch (err) {
      console.error("Register error:", err);

      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Internal server error";

      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <ToastContainer position="top-right" newestOnTop theme="colored" />
      <div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="w-full max-w-2xl">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">Create Your Account</h1>
            <p className="mt-4 text-lg text-gray-600">Start notarising documents online in minutes</p>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 border border-gray-100">
            <form className="grid md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    name="userName"
                    value={formData.userName}
                    onChange={handleChange}
                    type="text"
                    required
                    className="w-full text-black pl-12 pr-5 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="hitesh123"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Given Name</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  type="text"
                  required
                  className="w-full text-black px-5 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter your given name or first name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Family Name</label>
                <input
                  name="familyName"
                  value={formData.familyName}
                  onChange={handleChange}
                  type="text"
                  required
                  className="w-full text-black px-5 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter your family name or last name"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    type="email"
                    required
                    className="w-full text-black pl-12 pr-5 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="hitesh.ydv@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    type={showPassword ? "text" : "password"}
                    required
                    className="w-full text-black pl-12 pr-14 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Create strong password"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    name="confirm"
                    value={formData.confirm}
                    onChange={handleChange}
                    type={showConfirm ? "text" : "password"}
                    required
                    className="w-full text-black pl-12 pr-14 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Confirm your password"
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                    {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-linear-to-r from-indigo-600 to-blue-700 text-white py-5 rounded-xl font-bold text-lg hover:from-indigo-700 hover:to-blue-800 transition shadow-xl flex items-center justify-center gap-3 mt-6 disabled:opacity-60"
                >
                  {loading ? "Creating..." : "Create Account"}
                  <ArrowRight className="w-6 h-6" />
                </button>
              </div>

              {errorMsg && (
                <div className="md:col-span-2 text-red-600 text-center mt-2">
                  {errorMsg}
                </div>
              )}
            </form>

            <p className="mt-8 text-center text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
}
