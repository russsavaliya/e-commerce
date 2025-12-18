import React from 'react';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-6 border-t border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
          {/* Brand */}
          <div className="text-center md:text-left space-y-2">
            <h3 className="text-lg tracking-[0.25em] uppercase text-gray-800">
              SIYARA
            </h3>
            <p className="text-xs text-gray-500 max-w-xs">
              SIYARA is a premium saree store that offers a wide range of sarees for every occasion.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap justify-center md:justify-end gap-6 text-xs text-gray-500 uppercase tracking-[0.18em]">
            <button className="hover:text-gray-900 transition-colors">About</button>
            <button className="hover:text-gray-900 transition-colors">Contact</button>
            <button className="hover:text-gray-900 transition-colors">Shipping</button>
            <button className="hover:text-gray-900 transition-colors">Returns</button>
          </div>
        </div>

        <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-gray-100 pt-6">
          <p className="text-[11px] text-gray-400 tracking-[0.2em] uppercase text-center md:text-left">
            © {year} Shaadi Couture. All rights reserved.
          </p>
          <p className="text-[11px] text-gray-400 text-center md:text-right">
            Made with love for modern Indian weddings.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


