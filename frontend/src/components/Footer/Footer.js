'use client';

import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0f403e] text-white py-12 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Contact */}
          <div>
            <h3 className="font-bold text-lg mb-4">Contact</h3>
            <div className="text-sm space-y-1 text-gray-300">
              {/* <p className="font-semibold text-white">Contact Us</p>
                <p>1233 Main Street</p>
                <p>Potary, NY 92360</p> */}
              <p className="mt-3">Phone: +91 9898989898</p>
              <p>Email: support@ommdocumentation.com</p>
            </div>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-bold text-lg mb-4">Legal</h3>
            <ul className="text-sm space-y-2 text-gray-300">
              <li><a href="/about" className="hover:text-[#d4a574]">About</a></li>
              <li><a href="/pricing" className="hover:text-[#d4a574]">Pricing</a></li>
              <li><a href="/contact" className="hover:text-[#d4a574]">Contact</a></li>
              <li><a href="/resources" className="hover:text-[#d4a574]">Resources</a></li>
              {/* <li><a href="/privacy-policy" className="hover:text-[#d4a574]">Privacy Policy</a></li> */}
            </ul>
          </div>

          {/* Privacy */}
          <div>
            <h3 className="font-bold text-lg mb-4">Privacy</h3>
            <ul className="text-sm space-y-2 text-gray-300">
              <li><a href="/privacy-policy" className="hover:text-[#d4a574]">Privacy Policy</a></li>
              <li><a href="/terms" className="hover:text-[#d4a574]">Terms of Service</a></li>
              <li><a href="/refund" className="hover:text-[#d4a574]">Refund Policy</a></li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="font-bold text-lg mb-4">Social Media</h3>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 bg-[#d4a574] rounded-full flex items-center justify-center hover:bg-[#c49563]">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-[#d4a574] rounded-full flex items-center justify-center hover:bg-[#c49563]">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-[#d4a574] rounded-full flex items-center justify-center hover:bg-[#c49563]">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-[#d4a574] rounded-full flex items-center justify-center hover:bg-[#c49563]">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#1a5c5a] pt-6 text-center text-sm text-gray-400">
          <p>&copy; 2025 Omm Documentation. All rights reserved.</p>
          {/* <div className="flex items-center gap-2">
            <span>Made in</span>
            <span className="text-2xl">India</span>
          </div> */}
        </div>
      </div>

      {/* Decorative Diamond */}
      <div className="absolute bottom-8 right-8 w-20 h-20 bg-gradient-to-br from-[#2d6e6b] to-[#1a5c5a] transform rotate-45 opacity-30"></div>
    </footer>
  );
}