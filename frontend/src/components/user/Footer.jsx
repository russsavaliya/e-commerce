import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-12 border-t border-[#E5E7EB] bg-[#FAF9F5]">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="flex flex-col md:flex-row items-start justify-between gap-10 mb-10">
          {/* Brand Section */}
          <div className="flex-1 max-w-sm">
            <h3 className="text-xl font-bold tracking-[0.25em] uppercase text-[rgb(72,29,111)] mb-3">
              SIYARA
            </h3>
            <p className="text-sm text-[#374151] leading-relaxed">
              SIYARA is a premium saree store that offers a wide range of sarees for every occasion.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-semibold text-[rgb(72,29,111)] uppercase tracking-wide mb-1">
              Quick Links
            </h4>
            <div className="flex flex-col gap-2">
              <Link 
                to="/about" 
                className="text-sm text-[#374151] hover:text-[rgb(72,29,111)] transition-colors"
              >
                About
              </Link>
              <Link 
                to="/contact" 
                className="text-sm text-[#374151] hover:text-[rgb(72,29,111)] transition-colors"
              >
                Contact
              </Link>
              <Link 
                to="/order/track" 
                className="text-sm text-[#374151] hover:text-[rgb(72,29,111)] transition-colors"
              >
                Track Order
              </Link>
            </div>
          </div>

          {/* Information */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-semibold text-[rgb(72,29,111)] uppercase tracking-wide mb-1">
              Information
            </h4>
            <div className="flex flex-col gap-2">
              <button className="text-sm text-[#374151] hover:text-[rgb(72,29,111)] transition-colors text-left">
                Shipping
              </button>
              <button className="text-sm text-[#374151] hover:text-[rgb(72,29,111)] transition-colors text-left">
                Returns
              </button>
              <button className="text-sm text-[#374151] hover:text-[rgb(72,29,111)] transition-colors text-left">
                Privacy Policy
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#E5E7EB] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#6B7280] tracking-wide text-center md:text-left">
            © {year} SHAADI COUTURE. ALL RIGHTS RESERVED.
          </p>
          <p className="text-xs text-[#6B7280] text-center md:text-right italic">
            Made with love for modern Indian weddings.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


