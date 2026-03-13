import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, Instagram, Facebook, MessageCircle, Heart, Sparkles, Send } from 'lucide-react';

const Footer = () => {
  const year = new Date().getFullYear();
  // const [email, setEmail] = useState('');
  // const [subscribed, setSubscribed] = useState(false);

  // const handleSubscribe = (e) => {
  //   e.preventDefault();
  //   if (email) {
  //     setSubscribed(true);
  //     setEmail('');
  //     setTimeout(() => setSubscribed(false), 3000);
  //   }
  // };

  return (
    <footer className="mt-16 relative overflow-hidden">
      {/* Decorative background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#481D6F] to-[#2D1B47]"></div>
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-10 w-40 h-40 bg-[#E8D5C4] rounded-full mix-blend-screen blur-3xl"></div>
        <div className="absolute bottom-0 right-10 w-52 h-52 bg-[#D4AF77] rounded-full mix-blend-screen blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content - 4 Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 py-20 border-b border-[rgba(232,213,196,0.1)]">
          {/* Column 1: Brand Section */}
          <div className="lg:col-span-1">
            <div className="mb-8 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#E8D5C4] to-[#D4AF77] flex items-center justify-center">
                <Heart className="w-6 h-6 text-[#481D6F]" />
              </div>
              <h3 className="text-lg font-serif text-[#E8D5C4] uppercase tracking-wider">SIYARA</h3>
            </div>
            <p className="text-sm text-[#D4C5B9] leading-relaxed max-w-[280px] mb-6 font-light">
              Curating timeless elegance through handpicked premium sarees for your special moments.
            </p>
            <p className="text-xs text-[#C9B8A8] italic font-serif">
              "Where tradition meets luxury"
            </p>
            <div className="mt-6 flex items-center gap-2 text-[#D4C5B9] text-sm">
              <Sparkles className="w-4 h-4" />
              <span>Crafted with passion since 2020</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="lg:col-span-1">
            <h4 className="text-sm font-semibold text-[#E8D5C4] uppercase tracking-wider mb-8 pb-3 border-b border-[#D4C5B9]/50">
              Quick Links
            </h4>
            <nav className="flex flex-col gap-4">
              {[
                { label: 'About', path: '/about' },
                { label: 'Contact Us', path: '/contact' },
                { label: 'Track Your Order', path: '/order/track' },
                { label: 'Shop Collections', path: '/sale' },
              ].map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-sm text-[#D4C5B9] hover:text-[#E8D5C4] transition-all duration-300 group flex items-center gap-2"
                >
                  <span className="w-0 h-[1.5px] bg-[#E8D5C4] group-hover:w-4 transition-all duration-300"></span>
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Column 3: Information */}
          <div className="lg:col-span-1">
            <h4 className="text-sm font-semibold text-[#E8D5C4] uppercase tracking-wider mb-8 pb-3 border-b border-[#D4C5B9]/50">
              Information
            </h4>
            <nav className="flex flex-col gap-4">
              {[
                { label: 'Returns & Exchange', path: '/return-policy' },
                { label: 'Shipping & Delivery', action: true },
                { label: 'Privacy Policy', action: true },
                { label: 'Terms & Conditions', action: true },
              ].map((item, idx) => (
                <div key={idx}>
                  {item.action ? (
                    <button className="text-sm text-[#D4C5B9] hover:text-[#E8D5C4] transition-all duration-300 group flex items-center gap-2 text-left">
                      <span className="w-0 h-[1.5px] bg-[#E8D5C4] group-hover:w-4 transition-all duration-300"></span>
                      {item.label}
                    </button>
                  ) : (
                    <Link
                      to={item.path}
                      className="text-sm text-[#D4C5B9] hover:text-[#E8D5C4] transition-all duration-300 group flex items-center gap-2"
                    >
                      <span className="w-0 h-[1.5px] bg-[#E8D5C4] group-hover:w-4 transition-all duration-300"></span>
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
            </nav>
          </div>

          {/* Column 4: Customer Support */}
          <div className="lg:col-span-1">
            <h4 className="text-sm font-semibold text-[#E8D5C4] uppercase tracking-wider mb-8 pb-3 border-b border-[#D4C5B9]/50">
              Customer Support
            </h4>
            <div className="space-y-5">
              {/* Email */}
              <a
                href="mailto:siyaratrend@gmail.com"
                className="flex items-start gap-3 group hover-lift transition-all duration-300"
              >
                <div className="w-8 h-8 rounded-full bg-[#D4C5B9]/20 flex items-center justify-center flex-shrink-0 group-hover:bg-[#D4C5B9]/40 transition-colors">
                  <Mail className="w-4 h-4 text-[#E8D5C4]" />
                </div>
                <span className="text-sm text-[#D4C5B9] group-hover:text-[#E8D5C4] transition-colors">
                  siyaratrend@gmail.com
                </span>
              </a>

              {/* Phone */}
              <a
                href="tel:+919265733241"
                className="flex items-start gap-3 group hover-lift transition-all duration-300"
              >
                <div className="w-8 h-8 rounded-full bg-[#D4C5B9]/20 flex items-center justify-center flex-shrink-0 group-hover:bg-[#D4C5B9]/40 transition-colors">
                  <Phone className="w-4 h-4 text-[#E8D5C4]" />
                </div>
                <span className="text-sm text-[#D4C5B9] group-hover:text-[#E8D5C4] transition-colors">
                  +91 9265733241
                </span>
              </a>

              {/* Working Hours */}
              <div className="pl-11 border-l border-[#D4C5B9]/30">
                <p className="text-xs text-[#D4C5B9] font-medium">Mon-Sat: 10 AM - 7 PM IST</p>
                <p className="text-xs text-[#C9B8A8] italic mt-1">(We respond within 24 hours)</p>
              </div>

              {/* Social Icons */}
              <div className="flex items-center gap-3 pt-3">
                {[
                  { icon: Instagram, url: 'https://instagram.com/siyara', label: 'Instagram' },
                  { icon: Facebook, url: 'https://facebook.com/siyara', label: 'Facebook' },
                  { icon: MessageCircle, url: 'https://wa.me/9265733241', label: 'WhatsApp' },
                ].map((social, idx) => (
                  <a
                    key={idx}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Follow us on ${social.label}`}
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-[#D4C5B9]/20 text-[#E8D5C4] hover:bg-[#D4C5B9] hover:text-[#481D6F] hover:scale-110 transition-all duration-300 border border-[#D4C5B9]/40 hover:border-[#D4C5B9]"
                  >
                    <social.icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-[#D4C5B9]/20">
            {/* Left: Copyright */}
            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-center md:text-left">
              <p className="text-xs text-[#D4C5B9] tracking-wide">
                © {year} SIYARA. All rights reserved.
              </p>
              <span className="hidden md:inline text-[#C9B8A8]">•</span>
              <p className="text-xs text-[#C9B8A8] italic">
                Made with love for modern Indian weddings ❤️
              </p>
            </div>

            {/* Right: Payment Methods */}
            <div className="flex flex-col items-center md:items-end gap-2">
              <p className="text-xs text-[#D4C5B9] font-medium uppercase">
                Secure Checkout
              </p>
              <div className="flex items-center gap-2 text-xs text-[#C9B8A8]">
                <span className="px-2 py-1 rounded bg-[#D4C5B9]/10 border border-[#D4C5B9]/30">UPI</span>
                <span>•</span>
                <span className="px-2 py-1 rounded bg-[#D4C5B9]/10 border border-[#D4C5B9]/30">Cards</span>
                <span>•</span>
                <span className="px-2 py-1 rounded bg-[#D4C5B9]/10 border border-[#D4C5B9]/30">Net Banking</span>
              </div>
            </div>
          </div>

          {/* Footer Bottom Text */}
          <div className="pt-6 text-center">
            <p className="text-[11px] text-[#C9B8A8] font-light">
              Handcrafted with elegance • Delivered with care • Celebrated with joy
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.4s ease-out;
        }

        .hover-lift:hover {
          transform: translateY(-2px);
        }
      `}</style>
    </footer>
  );
};

export default Footer;


