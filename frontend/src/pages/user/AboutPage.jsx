import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/user/Navbar';
import Footer from '../../components/user/Footer';
import { Sparkles, ShieldCheck, Truck, Award, Heart, Users, Star } from 'lucide-react';

const highlights = [
  {
    icon: Sparkles,
    title: 'Crafted Elegance',
    text: 'Premium sarees handpicked for their exquisite craftsmanship and timeless beauty.',
  },
  {
    icon: ShieldCheck,
    title: 'Quality First',
    text: 'Every saree undergoes rigorous quality checks to ensure perfection in every drape.',
  },
  {
    icon: Truck,
    title: 'Pan-India Delivery',
    text: 'Fast and secure delivery across India with real-time tracking for peace of mind.',
  },
  {
    icon: Award,
    title: 'Trusted by Shoppers',
    text: 'Thousands of orders fulfilled with an emphasis on service and aftercare.',
  },
];

const story = [
  {
    heading: 'Our Origin',
    body: 'We started as a boutique for luxury sarees, working closely with weavers to bring craftsmanship online.',
    // gradient: 'from-purple-50 to-pink-50',
  },
  {
    heading: 'What We Curate',
    body: 'Kanjivarams, Banarasis, organza edits, pastel silks, and contemporary occasion-wear with handpicked detailing.',
    // gradient: 'from-purple-50 to-pink-50',
  },
  {
    heading: 'Our Promise',
    body: 'Transparent quality, responsive support, and styling help so you pick the drape that truly fits your moment.',
    // gradient: 'from-purple-50 to-pink-50',
  },
];

const stats = [
  { icon: Users, number: '10,000+', label: 'Happy Customers' },
  { icon: Star, number: '4.9/5', label: 'Average Rating' },
  { icon: Heart, number: '50,000+', label: 'Sarees Delivered' },
];

const AboutPage = () => {
  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 lg:px-6 py-16 space-y-20">
        {/* Hero Section with gradient background */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#481d6f] via-purple-700 to-pink-600 text-white p-8 md:p-10 shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-56 h-56 bg-pink-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

          <div className="relative z-10 text-center space-y-4 max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-5xl font-bold leading-tight">
              SIYARA <br />
              <span className="text-pink-200">Dress Bold, Live Bold</span>
            </h1>
            <p className="text-base md:text-lg text-purple-100 max-w-2xl mx-auto leading-relaxed">
              A premium saree destination where tradition meets contemporary elegance. Every drape tells a story of heritage, quality, and timeless beauty.
            </p>
          </div>
        </section>

        {/* Stats Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 -mt-8">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-2xl p-8 shadow-lg border border-purple-100 hover:shadow-xl transition-all hover:-translate-y-1 text-center"
            >
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#481d6f] to-purple-600 text-white flex items-center justify-center mb-4 mx-auto shadow-lg">
                <stat.icon className="w-7 h-7" />
              </div>
              <h3 className="text-3xl font-bold text-[#481d6f] mb-2">{stat.number}</h3>
              <p className="text-gray-600 font-medium">{stat.label}</p>
            </div>
          ))}
        </section>

        {/* Highlights Grid */}
        <section className="space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Why Choose SIYARA?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Experience the perfect blend of tradition, quality, and modern convenience
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {highlights.map((item, index) => (
              <div
                key={item.title}
                className="group relative bg-white border-2 border-purple-100 rounded-2xl p-6 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#481d6f]/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                <div className="relative z-10 space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#481d6f] to-purple-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <item.icon className="w-7 h-7" />
                  </div>
                  <h3 className="font-bold text-xl text-gray-900">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Story Section with cards */}
        <section className="space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Our Story</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              How we curate, why we care, and what makes us different
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {story.map((item, index) => (
              <div
                key={item.heading}
                className={`relative overflow-hidden rounded-2xl p-8 bg-gradient-to-br ${item.gradient} border border-purple-200 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/40 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>

                <div className="relative space-y-4">
                  <div className="w-12 h-1 bg-gradient-to-r from-[#481d6f] to-pink-500 rounded-full"></div>
                  <h4 className="text-2xl font-bold text-[#481d6f]">{item.heading}</h4>
                  <p className="text-gray-700 leading-relaxed">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-gray-900 via-[#481d6f] to-gray-900 text-white p-8 md:p-10 shadow-xl">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-pink-500 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-500 rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2">
              <h3 className="text-2xl md:text-3xl font-bold">Need Styling Help?</h3>
              <p className="text-purple-100 text-base max-w-xl">
                Tell us your occasion and palette—our expert team will suggest sarees that perfectly fit your look and personality.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/contact"
                className="px-6 py-3 bg-white text-[#481d6f] rounded-full font-semibold hover:bg-purple-50 transition-all hover:shadow-lg hover:-translate-y-0.5 text-center"
              >
                Get in Touch
              </Link>
              <Link
                to="/sale"
                className="px-6 py-3 bg-transparent border-2 border-white text-white rounded-full font-semibold hover:bg-white hover:text-[#481d6f] transition-all text-center"
              >
                Sales with Us
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AboutPage;