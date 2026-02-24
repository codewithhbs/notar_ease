"use client";

import { useEffect, useState } from "react";
import { Menu, X, Shield, Phone, Gavel } from "lucide-react";
import DemoMeetingModel from "../DemoMeetingModel/DemoMeetingModel";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDemo, setOpenDemo] = useState(false);

  const [loggedIn, setLoggedIn] = useState(false);

  const handleOpenDemo = () => {
    setMobileMenuOpen(false); // close mobile header
    setOpenDemo(true);        // open modal
  };


  useEffect(() => {
    const checkLogin = () => {
      const user = JSON.parse(localStorage.getItem("user"));
      setLoggedIn(!!user);
    };

    checkLogin();

    // Listen custom login event
    window.addEventListener("user-login", checkLogin);

    return () => {
      window.removeEventListener("user-login", checkLogin);
    };
  }, []);

  return (
    <>
      {/* Main Header - Fixed Top */}
      <header className="bg-teal-800 text-white sticky top-0 z-50 shadow-lg border-b-3 border-white shadow-2xl ">
        <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 border-2 border-yellow-600 rounded flex items-center justify-center relative">
              <span className='font-extrabold text-[#D08700]'>OM</span>
              {/* <div className="w-6 h-6 border-2 border-yellow-600 rounded-sm transform rotate-45">OM</div> */}
            </div>
            <a href="/">
              <div className="font-bold text-lg">Omm Documentation</div>
              <div className="text-xs text-gray-300">Online Notary(India & Abroad)</div>
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            <a href="/" className="hover:text-yellow-500 transition-colors duration-300">Home</a>
            <a href="/about" className="hover:text-yellow-500 transition-colors duration-300">About</a>
            <a href="/pricing" className="hover:text-yellow-500 transition-colors duration-300">Pricing</a>
            <a href="/contact" className="hover:text-yellow-500 transition-colors duration-300">Contact</a>
            {/* <a href="/resources" className="hover:text-yellow-500 transition-colors duration-300">Resources</a> */}
          </div>

          <div className='flex gap-1.5'>
            <button onClick={() => setOpenDemo(true)} className="hidden md:block bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded transition-colors duration-300 font-semibold">
              Book a Demo
            </button>
            {loggedIn ? (
              <a href='/dashboard?tab=home' className="hidden md:block bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded transition-colors duration-300 font-semibold">
                Dashboard
              </a>
            ) : (
              <a href='/login' className="hidden md:block bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded transition-colors duration-300 font-semibold">
                Sign up/ Login
              </a>
            )}
          </div>


          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-teal-900 px-6 py-4 space-y-4">
            <a href="/" className="block hover:text-yellow-500 transition">Home</a>
            <a href="/about" className="block hover:text-yellow-500 transition">About</a>
            <a href="/pricing" className="block hover:text-yellow-500 transition">Pricing</a>
            <a href="/contact" className="block hover:text-yellow-500 transition">Contact</a>
            {/* <a href="/resources" className="block hover:text-yellow-500 transition">Resources</a> */}
            <button onClick={() => setOpenDemo(true)} className="w-full bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded transition">
              Book a Demo
            </button>
            {loggedIn ? (
              <a href='/dashboard?tab=home' className="w-full bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded transition">
                Dashboard
              </a>
            ) : (
              <a href='/login' className="w-full bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded transition">
                Sign up/ Login
              </a>
            )}

          </div>
        )}

      </header>

      {/* Spacer so content doesn't hide under fixed header */}
      {/* <div className="h-18 lg:h-20"></div> */}
      {openDemo && <DemoMeetingModel onClose={() => setOpenDemo(false)} />}
    </>
  );
}
