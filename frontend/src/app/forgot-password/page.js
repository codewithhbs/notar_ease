'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Mail,
  ArrowRight,
  CheckCircle,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1); // 1=email, 2=otp+password, 3=success
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(Array(6).fill(''));
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // OTP resend timer
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  // OTP shake animation
  const [shake, setShake] = useState(false);

  const otpRefs = useRef([]);

  const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

  /* ================= TIMER ================= */
  useEffect(() => {
    if (step === 2 && timer > 0) {
      const i = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(i);
    }
    if (timer === 0) setCanResend(true);
  }, [timer, step]);

  const startTimer = () => {
    setTimer(30);
    setCanResend(false);
  };

  /* ================= PASSWORD STRENGTH ================= */
  const getStrength = () => {
    let s = 0;
    if (newPassword.length >= 8) s++;
    if (/[A-Z]/.test(newPassword)) s++;
    if (/[0-9]/.test(newPassword)) s++;
    if (/[^A-Za-z0-9]/.test(newPassword)) s++;
    return s;
  };

  /* ================= STEP 1 ================= */
  const sendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/api/auth/forgot-password`, { email });
      if (res?.data?.success) {
        toast.success('OTP sent to your email');
        setStep(2);
        startTimer();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Server error');
    } finally {
      setLoading(false);
    }
  };

  /* ================= STEP 2 ================= */
  const verifyOtpAndReset = async (e) => {
    e.preventDefault();
    const otpValue = otp.join('');

    if (otpValue.length !== 6) {
      triggerShake();
      return toast.error('Enter complete OTP');
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/api/auth/verify-reset-otp`, {
        email,
        otp: otpValue,
        newPassword,
      });

      if (res?.data?.success) {
        toast.success('Password reset successful');
        setStep(3);
      }
    } catch (err) {
      triggerShake();
      toast.error(err?.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  /* ================= OTP HANDLERS ================= */
  const handleOtpChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleBackspace = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData('text').trim();
    if (!/^\d{6}$/.test(pasted)) return;
    setOtp(pasted.split(''));
    setTimeout(() => otpRefs.current[5]?.focus(), 0);
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  /* ================= UI ================= */
  return (
    <>
      <ToastContainer position="top-right" theme="colored" />
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {step === 3 ? (
                <CheckCircle className="w-12 h-12 text-indigo-600" />
              ) : (
                <Mail className="w-12 h-12 text-indigo-600" />
              )}
            </div>
            <h1 className="text-3xl font-bold">
              {step === 1 && 'Forgot Password'}
              {step === 2 && 'Verify OTP'}
              {step === 3 && 'Success'}
            </h1>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* STEP 1 */}
            {step === 1 && (
              <form onSubmit={sendOtp} className="space-y-6">
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border rounded-xl text-black"
                />
                <button className="w-full bg-indigo-600 text-white py-3 rounded-xl">
                  Send OTP
                </button>
              </form>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <form onSubmit={verifyOtpAndReset} className="space-y-6">
                {/* OTP */}
                <motion.div
                  animate={shake ? { x: [-10, 10, -6, 6, 0] } : {}}
                  className="flex justify-between"
                >
                  {otp.map((d, i) => (
                    <input
                      key={i}
                      ref={(el) => (otpRefs.current[i] = el)}
                      value={d}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      onPaste={i === 0 ? handleOtpPaste : undefined}
                      onChange={(e) => handleOtpChange(e.target.value, i)}
                      onKeyDown={(e) => handleBackspace(e, i)}
                      className="w-12 h-12 text-center text-xl border rounded-lg"
                    />
                  ))}
                </motion.div>

                {/* RESEND */}
                <div className="text-center text-sm text-gray-500">
                  {canResend ? (
                    <button type="button" onClick={sendOtp} className="text-indigo-600 font-semibold">
                      Resend OTP
                    </button>
                  ) : (
                    <>Resend OTP in {timer}s</>
                  )}
                </div>

                {/* PASSWORD */}
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 border rounded-xl peer"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-500"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>

                  {/* TOOLTIP */}
                  {/* <div className="absolute left-0 mt-2 w-full bg-gray-50 border rounded-xl p-3 text-xs shadow opacity-0 peer-focus:opacity-100">
                    <p className="font-semibold mb-1">Password must contain:</p>
                    <ul className="space-y-1">
                      <li className={newPassword.length >= 8 ? 'text-green-600' : ''}>• 8 characters</li>
                      <li className={/[A-Z]/.test(newPassword) ? 'text-green-600' : ''}>• Uppercase</li>
                      <li className={/[0-9]/.test(newPassword) ? 'text-green-600' : ''}>• Number</li>
                      <li className={/[^A-Za-z0-9]/.test(newPassword) ? 'text-green-600' : ''}>• Special char</li>
                    </ul>
                  </div> */}
                </div>

                {/* STRENGTH BAR */}
                <div className="flex gap-1">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`h-2 flex-1 rounded ${
                        i < getStrength() ? 'bg-green-600' : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>

                <button className="w-full bg-indigo-600 text-white py-3 rounded-xl">
                  Reset Password
                </button>
              </form>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <div className="text-center">
                <p className="text-gray-600 mb-4">Password reset successfully</p>
                <Link href="/login" className="text-indigo-600 font-semibold">
                  Go to Login →
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
}
