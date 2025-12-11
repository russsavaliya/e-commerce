import React from 'react';
import Navbar from '../../components/user/Navbar';
import Footer from '../../components/user/Footer';
import { Phone, Mail, MapPin, Clock, Send } from 'lucide-react';

const infoItems = [
  {
    icon: Phone,
    title: 'Call Us',
    value: '+91 98765 43210',
    note: 'Mon - Sat, 10am to 7pm',
  },
  {
    icon: Mail,
    title: 'Email',
    value: 'support@sareeluxury.com',
    note: 'We reply within 24 hours',
  },
  {
    icon: MapPin,
    title: 'Store',
    value: 'Luxury Saree Studio, Ahmedabad',
    note: 'By appointment only',
  },
  {
    icon: Clock,
    title: 'Working Hours',
    value: 'Mon - Sat: 10:00 - 19:00',
    note: 'Sunday closed',
  },
];

const ContactPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 lg:px-6 py-12 space-y-12">
        {/* Hero */}
        <section className="text-center space-y-3">
          <p className="text-rose-500 font-semibold tracking-wide uppercase">We’re here to help</p>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Contact Us</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Questions about an order, styling advice, or bespoke requests? Reach out and we’ll assist you.
          </p>
        </section>

        {/* Contact info cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {infoItems.map((item) => (
            <div key={item.title} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
                  <item.icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-gray-900">{item.title}</h3>
              </div>
              <p className="text-gray-900 font-medium">{item.value}</p>
              <p className="text-sm text-gray-500">{item.note}</p>
            </div>
          ))}
        </section>

        {/* Message form (frontend only) */}
        <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Send us a message</h2>
              <p className="text-gray-500 text-sm">We’ll get back to you on email.</p>
            </div>
            <div className="text-sm text-gray-500">Fields marked * are required</div>
          </div>

          <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Full Name *</label>
              <input
                type="text"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-rose-200 focus:border-rose-400"
                placeholder="Enter your name"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Email *</label>
              <input
                type="email"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-rose-200 focus:border-rose-400"
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Message *</label>
              <textarea
                rows="4"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-rose-200 focus:border-rose-400"
                placeholder="How can we help you?"
              />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <button
                type="button"
                className="inline-flex items-center gap-2 bg-gray-900 text-white px-5 py-3 rounded-full font-semibold hover:bg-black transition-colors"
              >
                <Send className="w-4 h-4" />
                Send Message
              </button>
            </div>
          </form>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ContactPage;

