import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, Instagram, Facebook, MessageCircle } from 'lucide-react';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 relative bg-gradient-to-b from-[#FAF9F5] to-[#F5F3ED] border-t-2 border-[rgba(72,29,111,0.15)]">
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[rgba(72,29,111,0.3)] to-transparent"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        {/* Main Footer Content - 4 Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 mb-16">
          {/* Column 1: Brand Section */}
          <div className="lg:col-span-1">
            <div className="mb-6">
              <h3 className="text-[20px] font-medium uppercase text-[rgb(72,29,111)] font-['Playfair Display']">
                SHOWROOM DETAILS
              </h3>
              {/* <div className="w-22 h-[2px] bg-gradient-to-r from-[rgb(72,29,111)] to-transparent mb-6"></div> */}
            </div>
            <p className="text-[15px] text-[#374151] leading-relaxed max-w-[280px] mb-6 font-['Playfair Display']">
              Curating timeless elegance through handpicked premium sarees for your special moments.
            </p>
            <p className="text-sm text-[#6B7280] italic font-['Playfair Display']">
              Where tradition meets luxury
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="lg:col-span-1">
            <h4 className="text-[17px] font-semibold text-[rgb(72,29,111)] uppercase tracking-wide mb-6 font-['Playfair Display']">
              Quick Links
            </h4>
            <nav className="flex flex-col gap-3">
              <Link
                to="/about"
                className="text-[15px] text-[#374151] hover:text-[rgb(72,29,111)] transition-all duration-200 hover:translate-x-1 inline-block group relative w-fit font-['Playfair Display']"
              >
                <span className="relative">
                  About
                  <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[rgb(72,29,111)] transition-all duration-200 group-hover:w-full"></span>
                </span>
              </Link>
              <Link
                to="/contact"
                className="text-[15px] text-[#374151] hover:text-[rgb(72,29,111)] transition-all duration-200 hover:translate-x-1 inline-block group relative w-fit font-['Playfair Display']"
              >
                <span className="relative">
                  Contact Us
                  <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[rgb(72,29,111)] transition-all duration-200 group-hover:w-full"></span>
                </span>
              </Link>
              <Link
                to="/order/track"
                className="text-[15px] text-[#374151] hover:text-[rgb(72,29,111)] transition-all duration-200 hover:translate-x-1 inline-block group relative w-fit font-['Playfair Display']"
              >
                <span className="relative">
                  Track Your Order
                  <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[rgb(72,29,111)] transition-all duration-200 group-hover:w-full"></span>
                </span>
              </Link>
              <Link
                to="/sale"
                className="text-[15px] text-[#374151] hover:text-[rgb(72,29,111)] transition-all duration-200 hover:translate-x-1 inline-block group relative w-fit font-['Playfair Display']"
              >
                <span className="relative">
                  Shop Collections
                  <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[rgb(72,29,111)] transition-all duration-200 group-hover:w-full"></span>
                </span>
              </Link>
            </nav>
          </div>

          {/* Column 3: Information */}
          <div className="lg:col-span-1">
            <h4 className="text-[17px] font-semibold text-[rgb(72,29,111)] uppercase tracking-wide mb-6 font-['Playfair Display']">
              Information
            </h4>
            <nav className="flex flex-col gap-3">
              <Link
                to="/return-policy"
                className="text-[15px] text-[#374151] hover:text-[rgb(72,29,111)] transition-all duration-200 hover:translate-x-1 inline-block group relative w-fit font-['Playfair Display']"
              >
                <span className="relative">
                  Returns & Exchange
                  <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[rgb(72,29,111)] transition-all duration-200 group-hover:w-full"></span>
                </span>
              </Link>
              <button className="text-[15px] text-[#374151] hover:text-[rgb(72,29,111)] transition-all duration-200 hover:translate-x-1 text-left group relative w-fit font-['Playfair Display']">
                <span className="relative">
                  Shipping & Delivery
                  <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[rgb(72,29,111)] transition-all duration-200 group-hover:w-full"></span>
                </span>
              </button>
              <button className="text-[15px] text-[#374151] hover:text-[rgb(72,29,111)] transition-all duration-200 hover:translate-x-1 text-left group relative w-fit font-['Playfair Display']">
                <span className="relative">
                  Privacy Policy
                  <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[rgb(72,29,111)] transition-all duration-200 group-hover:w-full"></span>
                </span>
              </button>
              <button className="text-[15px] text-[#374151] hover:text-[rgb(72,29,111)] transition-all duration-200 hover:translate-x-1 text-left group relative w-fit font-['Playfair Display']">
                <span className="relative">
                  Terms & Conditions
                  <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[rgb(72,29,111)] transition-all duration-200 group-hover:w-full"></span>
                </span>
              </button>
            </nav>
          </div>

          {/* Column 4: Customer Support */}
          <div className="lg:col-span-1">
            <h4 className="text-[17px] font-semibold text-[rgb(72,29,111)] uppercase tracking-wide mb-6 font-['Playfair Display']">
              Customer Support
            </h4>
            <div className="space-y-4">
              {/* Email */}
              <div className="flex items-start gap-3 group">
                <Mail className="w-5 h-5 text-[rgb(72,29,111)] mt-0.5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110" />
                <a
                  href="mailto:support@siyara.com"
                  className="text-[15px] text-[#374151] hover:text-[rgb(72,29,111)] transition-colors duration-200 font-['Playfair Display']"
                >
                  support@siyara.com
                </a>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-3 group">
                <Phone className="w-5 h-5 text-[rgb(72,29,111)] mt-0.5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110" />
                <a
                  href="tel:+919876543210"
                  className="text-[15px] text-[#374151] hover:text-[rgb(72,29,111)] transition-colors duration-200 font-['Playfair Display']"
                >
                  +91 98765 43210
                </a>
              </div>

              {/* Working Hours */}
              <div className="pt-2">
                <p className="text-[14px] text-[#374151] font-medium mb-1 font-['Playfair Display']">
                  Mon-Sat: 10 AM - 7 PM IST
                </p>
                <p className="text-[13px] text-[#6B7280] italic font-['Playfair Display']">
                  (We respond within 24 hours)
                </p>
              </div>

              {/* Social Icons */}
              <div className="flex items-center gap-4 pt-4">
                <a
                  href="https://instagram.com/siyara"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow us on Instagram"
                  className="w-10 h-10 flex items-center justify-center rounded-full border border-[rgba(72,29,111,0.2)] text-[rgb(72,29,111)] hover:bg-[rgba(72,29,111,0.08)] hover:scale-110 transition-all duration-200"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href="https://facebook.com/siyara"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow us on Facebook"
                  className="w-10 h-10 flex items-center justify-center rounded-full border border-[rgba(72,29,111,0.2)] text-[rgb(72,29,111)] hover:bg-[rgba(72,29,111,0.08)] hover:scale-110 transition-all duration-200"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href="https://wa.me/919876543210"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Chat with us on WhatsApp"
                  className="w-10 h-10 flex items-center justify-center rounded-full border border-[rgba(72,29,111,0.2)] text-[rgb(72,29,111)] hover:bg-[rgba(72,29,111,0.08)] hover:scale-110 transition-all duration-200"
                >
                  <MessageCircle className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-[rgba(72,29,111,0.1)]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Left: Copyright */}
            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
              <p className="text-[13px] text-[#6B7280] tracking-wide text-center md:text-left font-['Playfair Display']">
                © {year} SIYARA. All rights reserved.
              </p>
              <span className="hidden md:inline text-[#E5E7EB]">|</span>
              <p className="text-[13px] text-[#6B7280] text-center md:text-left italic font-['Playfair Display']">
                Made with love for modern Indian weddings
              </p>
            </div>

            {/* Right: Payment Methods (Optional) */}
            <div className="flex flex-col items-center md:items-end gap-2">
              <p className="text-[12px] text-[#6B7280] font-medium font-['Playfair Display']">
                Secure Checkout
              </p>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-[11px] text-[#9CA3AF] font-medium font-['Playfair Display']">
                  <span>UPI</span>
                  <span>•</span>
                  <span>Cards</span>
                  <span>•</span>
                  <span>Net Banking</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


