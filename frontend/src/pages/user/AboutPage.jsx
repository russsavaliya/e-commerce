import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/user/Navbar';
import Footer from '../../components/user/Footer';
import { Sparkles, ShieldCheck, Truck, Award } from 'lucide-react';

const highlights = [
  {
    icon: Sparkles,
    title: 'Crafted Elegance',
    text: 'SIYARA is a premium saree store that offers a wide range of sarees for every occasion. We are committed to providing the best quality sarees to our customers.',
  },
  {
    icon: ShieldCheck,
    title: 'Quality First',
    text: 'We are committed to providing the best quality sarees to our customers. We are committed to providing the best quality sarees to our customers.',
  },
  {
    icon: Truck,
    title: 'Pan-India Delivery',
    text: 'We offer pan-India delivery to our customers. We are committed to providing the best quality sarees to our customers.',
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
  },
  {
    heading: 'What We Curate',
    body: 'Kanjivarams, Banarasis, organza edits, pastel silks, and contemporary occasion-wear with handpicked detailing.',
  },
  {
    heading: 'Our Promise',
    body: 'Transparent quality, responsive support, and styling help so you pick the drape that truly fits your moment.',
  },
];

const AboutPage = () => {
  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 lg:px-6 py-12 space-y-12">
        {/* Hero */}
        <section className="text-center space-y-3">
          {/* <p className="text-[#481d6f]-500 font-semibold tracking-wide uppercase">About Us</p> */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">SIYARA, Dress Bold Live Bold</h1>
          <p className="text-gray-600 max-w-3xl mx-auto">
            SIYARA is a premium saree store that offers a wide range of sarees for every occasion. We are committed to providing the best quality sarees to our customers.
          </p>
        </section>

        {/* Highlights */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {highlights.map((item) => (
            <div key={item.title} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-full bg-[rgba(72,29,111,0.1)] text-[#481d6f] flex items-center justify-center mb-3">
                <item.icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{item.text}</p>
            </div>
          ))}
        </section>

        {/* Story */}
        <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold text-gray-900">Our Story</h2>
            <p className="text-gray-600">How we curate, why we care, and what makes us different.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {story.map((item) => (
              <div key={item.heading} className="space-y-2">
                <h4 className="text-lg font-semibold text-gray-900">{item.heading}</h4>
                <p className="text-gray-600 text-sm leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Assurance strip */}
        <section className="bg-gray-900 text-white rounded-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-lg">
          <div>
            <h3 className="text-xl font-semibold">Need styling help?</h3>
            <p className="text-white/80 text-sm">Tell us your occasion and palette—our team will suggest sarees that fit your look.</p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/contact"
              className="px-5 py-3 bg-white text-gray-900 rounded-full font-semibold hover:bg-gray-100 transition-colors"
            >
              Email Us
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AboutPage;

