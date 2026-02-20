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


  const navItems = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Pricing", href: "/pricing" },
    { name: "Contact", href: "/contact" },
    { name: "Resources", href: "/resources" },
    // { name: "FAQ", href: "#faq" },
    // { name: "Contact", href: "#contact" },
  ];

  return (
    <>
      {/* Main Header - Fixed Top */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-50 border-b border-gray-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo + Trust Badge */}
            <div className="flex items-center gap-8">
              <a href="/" className="flex items-center gap-3">
                <div className="bg-linear-to-br from-indigo-600 to-blue-700 text-white font-bold text-2xl w-12 h-12 rounded-lg flex items-center justify-center shadow-lg">
                  OD
                </div>
                <div>
                  <h1 className="text-xl font-extrabold text-gray-900">
                    Omm Documentation
                  </h1>
                  <p className="text-xs text-gray-500 -mt-1">Online Notary(India & Abroad)</p>
                </div>
              </a>

              {/* Trust Badge - Visible only on md+ */}
              <div className="hidden md:flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-semibold border border-green-200">
                <Shield className="w-4 h-4" />
                Supreme Court Approved
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-700 hover:text-indigo-600 font-medium transition"
                >
                  {item.name}
                </a>
              ))}
            </nav>

            {/* Right Side - Phone + CTA */}
            <div className="flex items-center gap-4">
              {/* Phone Number - Hidden on small screens */}
              {/* <div className="hidden md:flex items-center gap-2 text-gray-800 font-semibold">
                <Phone className="w-5 h-5 text-indigo-600" />
                <span>+91 9898989898</span>
              </div> */}

              <div
                onClick={() => setOpenDemo(true)}
                className="bg-linear-to-r hidden md:flex cursor-pointer from-indigo-600 to-blue-700 text-white px-6 py-3 rounded-full font-bold hover:shadow-xl transition transform hover:scale-105 flex items-center gap-2"
              >
                Book a Demo
              </div>

              {/* Book Appointment Button */}
              {loggedIn ? (
                <a
                  href="/dashboard?tab=home"
                  className="bg-linear-to-r hidden md:flex from-indigo-600 to-blue-700 text-white px-6 py-3 rounded-full font-bold hover:shadow-xl transition transform hover:scale-105 flex items-center gap-2"
                >
                  {/* <Gavel className="w-5 h-5" /> */}
                  Dashboard
                </a>
              ) : (
                <a
                  href="/login"
                  className="bg-linear-to-r hidden md:flex from-indigo-600 to-blue-700 text-white px-6 py-3 rounded-full font-bold hover:shadow-xl transition transform hover:scale-105 flex items-center gap-2"
                >
                  {/* <Gavel className="w-5 h-5" /> */}
                  Sign up/ Login
                </a>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden text-gray-700"
              >
                {mobileMenuOpen ? (
                  <X className="w-7 h-7" />
                ) : (
                  <Menu className="w-7 h-7" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu - Slides Down */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-200 overflow-scroll">
            <div className="container mx-auto px-4 py-6 flex flex-col gap-5">
              {/* Mobile Trust Badge */}
              <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-semibold border border-green-200 w-fit">
                <Shield className="w-4 h-4" />
                Supreme Court Approved
              </div>

              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-lg text-gray-700 hover:text-indigo-600 font-medium py-2 border-b border-gray-100 last:border-0"
                >
                  {item.name}
                </a>
              ))}

              <div className="pt-4 flex flex-col gap-4">
                <div onClick={handleOpenDemo} className="bg-linear-to-r from-indigo-600 to-blue-700 text-white px-8 py-4 rounded-full font-bold text-center text-lg">
                  {/* <Phone className="w-5 h-5 text-indigo-600" /> */}
                  Book a Demo
                </div>
                {loggedIn ? (
                  <a
                    href="/dashboard?tab=home"
                    className="bg-linear-to-r from-indigo-600 to-blue-700 text-white px-8 py-4 rounded-full font-bold text-center text-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </a>
                ) : (
                  <a
                    href="/login"
                    className="bg-linear-to-r from-indigo-600 to-blue-700 text-white px-8 py-4 rounded-full font-bold text-center text-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Spacer so content doesn't hide under fixed header */}
      <div className="h-18 lg:h-20"></div>
      {openDemo && <DemoMeetingModel onClose={() => setOpenDemo(false)} />}
    </>
  );
}
