import React, { useState } from 'react';
import Navbar from '../../components/user/Navbar';
import Footer from '../../components/user/Footer';
import { Mail, Send } from 'lucide-react';
import { sendSupportMessage } from '../../services/user/supportService';
import toast from 'react-hot-toast';

const ContactPage = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const res = await sendSupportMessage({
        name: form.name,
        email: form.email,
        message: form.message,
      });

      if (res?.status) {
        toast.success(res.message || 'Message sent successfully');
        setForm({ name: '', email: '', message: '' });
      } else {
        toast.error(res?.message || 'Failed to send your message');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to send your message');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 lg:px-6 py-12">
        {/* Hero + form card */}
        <section className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-stretch">
          {/* Left text */}
          <div className="flex-1 space-y-4">
            <p className="inline-flex items-center gap-2 text-[#481d6f] font-semibold tracking-wide uppercase">
              <Mail className="w-4 h-4" />
              Support & Queries
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
              Email us your <span className="text-[#481d6f]">questions</span> or support request
            </h1>
            <p className="text-gray-600 text-sm md:text-base">
              Facing an issue with your order, sizing, or styling? Drop us a message and our support team
              will get back to you on email, usually within 24 hours.
            </p>
            <div className="text-xs text-gray-500 border-l-2 border-[#481d6f] pl-3">
              Please use the same email as your order so we can identify your details faster.
            </div>
          </div>

          {/* Form card */}
          <div className="flex-1 bg-white border border-gray-100 rounded-2xl shadow-sm p-6 md:p-7">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg md:text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-full text-[rgb(72,29,111)]">
                    <Mail className="w-6 h-6" />
                  </span>
                  Email Support
                </h2>
                <p className="text-gray-500 text-xs md:text-sm mt-1">
                  Fill in your details and we’ll respond on email.
                </p>
              </div>
            </div>

            <form
              className="grid grid-cols-1 gap-4"
              onSubmit={handleSubmit}
            >
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm md:text-base focus:ring-1 focus:ring-[#481d6f] focus:border-[#481d6f] shadow-sm"
                  placeholder="Enter your name"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm md:text-base focus:ring-1 focus:ring-[#481d6f] focus:border-[#481d6f] shadow-sm"
                  placeholder="you@example.com"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Message *</label>
                <textarea
                  rows="4"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm md:text-base focus:ring-1 focus:ring-[#481d6f] focus:border-[#481d6f] shadow-sm resize-none"
                  placeholder="How can we help you?"
                />
              </div>
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 bg-[rgb(72,29,111)] text-white px-6 py-2.5 rounded-full text-sm md:text-base font-semibold hover:bg-[#390e60] transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
                >
                  <Send className="w-4 h-4" />
                  {submitting ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </form>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
};

export default ContactPage;

