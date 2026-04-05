import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/user/Navbar';
import Footer from '../../components/user/Footer';
import { RefreshCw, Clock, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import useSEO from '../../hooks/useSEO';

const ReturnPolicyPage = () => {
  const returnPoints = [
    {
      icon: Clock,
      title: 'Return Window',
      description: 'You can return items within 7 days of delivery. Items must be in original condition with tags attached.',
    },
    {
      icon: CheckCircle2,
      title: 'Eligible Items',
      description: 'All sarees and accessories are eligible for return, except personalized or custom-made items.',
    },
    {
      icon: RefreshCw,
      title: 'Return Process',
      description: 'Contact us via email or phone to initiate a return. We will provide a return authorization and shipping label.',
    },
    {
      icon: AlertCircle,
      title: 'Conditions',
      description: 'Items must be unworn, unwashed, and in original packaging. Returns are subject to inspection upon receipt.',
    },
  ];

  const steps = [
    {
      step: '1',
      title: 'Request Return Online',
      description: 'Use our online return form to submit your return request. Simply enter your Order ID and email to get started.',
    },
    {
      step: '2',
      title: 'Get Authorization',
      description: 'We will provide you with a return authorization number and shipping instructions.',
    },
    {
      step: '3',
      title: 'Ship the Item',
      description: 'Pack the item securely in its original packaging and ship it back using the provided label.',
    },
    {
      step: '4',
      title: 'Receive Refund',
      description: 'Once we receive and inspect the item, we will process your refund within 5-7 business days.',
    },
  ];

  useSEO({
    title: 'Return Policy – Easy Returns & Refunds | SIYARA',
    description: 'SIYARA\'s hassle-free return policy. Return items within 7 days. Simple online return process with quick refunds in 5-7 business days. Read our complete return and refund policy.',
    keywords: 'siyara return policy, saree return, ethnic wear refund, return saree online, exchange policy, siyara refund process, return window siyara',
    canonicalUrl: 'https://siyara.online/return-policy',
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F5]">
      <Navbar />

      {/* FAQ Schema for Return Policy */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What is SIYARA's return window?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "You can return items within 7 days of delivery. Items must be in original condition with tags attached."
            }
          },
          {
            "@type": "Question",
            "name": "Which items are eligible for return at SIYARA?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "All sarees and accessories are eligible for return, except personalized or custom-made items."
            }
          },
          {
            "@type": "Question",
            "name": "How do I start a return at SIYARA?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Use our online return form to submit your return request. Enter your Order ID and email to get started. We will provide a return authorization and shipping instructions."
            }
          },
          {
            "@type": "Question",
            "name": "How long does it take to receive a refund from SIYARA?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Refunds typically take 5-7 business days to appear in your account after we receive and inspect the returned item. Refunds are processed to the original payment method."
            }
          }
        ]
      }) }} />

      <main className="flex-1 max-w-4xl mx-auto px-4 lg:px-6 py-12 w-full">
        {/* Header */}
        <section className="text-center space-y-3 mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-[rgba(72,29,111,0.1)] flex items-center justify-center">
              <RefreshCw className="w-6 h-6 text-[rgb(72,29,111)]" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-[rgb(72,29,111)]">
              Return Policy
            </h1>
          </div>
          <p className="text-[#374151] text-sm md:text-base max-w-2xl mx-auto mb-6">
            We want you to be completely satisfied with your purchase. Our return policy is designed to make the process simple and hassle-free.
          </p>
          {/* Return Order CTA Button */}
          <div className="flex justify-center">
            <Link
              to="/return-order"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[rgb(72,29,111)] text-white rounded-full font-semibold hover:bg-[#390e60] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <RefreshCw className="w-5 h-5" />
              Request a Return
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>

        {/* Key Points */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {returnPoints.map((point, idx) => (
            <div
              key={idx}
              className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[rgba(72,29,111,0.1)] flex items-center justify-center flex-shrink-0">
                  <point.icon className="w-5 h-5 text-[rgb(72,29,111)]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-[rgb(72,29,111)] mb-2">
                    {point.title}
                  </h3>
                  <p className="text-sm text-[#374151] leading-relaxed">
                    {point.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Return Process Steps */}
        <section className="bg-white border border-[#E5E7EB] rounded-2xl p-6 md:p-8 shadow-sm mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[rgb(72,29,111)]">
              How to Return an Item
            </h2>
            <Link
              to="/return-order"
              className="hidden md:inline-flex items-center gap-2 px-4 py-2 bg-[rgb(72,29,111)] text-white rounded-full text-sm font-semibold hover:bg-[#390e60] transition-all duration-200"
            >
              Start Return
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-6">
            {steps.map((item, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-[rgba(72,29,111,0.1)] text-[rgb(72,29,111)] flex items-center justify-center font-bold text-lg">
                    {item.step}
                  </div>
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="text-lg font-semibold text-[#374151] mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#6B7280] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          {/* Mobile CTA Button */}
          <div className="mt-6 md:hidden">
            <Link
              to="/return-order"
              className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-[rgb(72,29,111)] text-white rounded-full font-semibold hover:bg-[#390e60] transition-all duration-200"
            >
              <RefreshCw className="w-5 h-5" />
              Start Return Request
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>

        {/* Important Notes */}
        <section className="bg-white border border-[#E5E7EB] rounded-2xl p-6 md:p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-[rgb(72,29,111)] mb-6">
            Important Information
          </h2>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[rgb(72,29,111)] mt-2 flex-shrink-0" />
              <p className="text-sm text-[#374151] leading-relaxed">
                <span className="font-semibold text-[rgb(72,29,111)]">Refund Method:</span> Refunds will be processed to the original payment method used for the purchase.
              </p>
            </div>
            <div className="flex gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[rgb(72,29,111)] mt-2 flex-shrink-0" />
              <p className="text-sm text-[#374151] leading-relaxed">
                <span className="font-semibold text-[rgb(72,29,111)]">Shipping Costs:</span> Return shipping costs are the responsibility of the customer, unless the item was damaged or incorrect.
              </p>
            </div>
            <div className="flex gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[rgb(72,29,111)] mt-2 flex-shrink-0" />
              <p className="text-sm text-[#374151] leading-relaxed">
                <span className="font-semibold text-[rgb(72,29,111)]">Processing Time:</span> Refunds typically take 5-7 business days to appear in your account after we receive the returned item.
              </p>
            </div>
            <div className="flex gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[rgb(72,29,111)] mt-2 flex-shrink-0" />
              <p className="text-sm text-[#374151] leading-relaxed">
                <span className="font-semibold text-[rgb(72,29,111)]">Exchanges:</span> We currently do not offer direct exchanges. Please return the item and place a new order for the desired item.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="mt-12">
          <div className="bg-gradient-to-r from-[rgba(72,29,111,0.05)] to-[rgba(72,29,111,0.1)] border border-[rgba(72,29,111,0.2)] rounded-2xl p-8 shadow-sm">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-[rgb(72,29,111)] mb-3">
                Ready to Return Your Order?
              </h3>
              <p className="text-sm text-[#6B7280] max-w-2xl mx-auto">
                Start your return request online in just a few simple steps. Enter your Order ID and email to begin.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/return-order"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[rgb(72,29,111)] text-white rounded-full font-semibold hover:bg-[#390e60] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 w-full sm:w-auto justify-center"
              >
                <RefreshCw className="w-5 h-5" />
                Request a Return
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[rgb(72,29,111)] border-2 border-[rgb(72,29,111)] rounded-full font-semibold hover:bg-[rgba(72,29,111,0.05)] transition-all duration-200 w-full sm:w-auto justify-center"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ReturnPolicyPage;
