import React from 'react';
import Navbar from '../../components/user/Navbar';
import Footer from '../../components/user/Footer';
import { RefreshCw, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

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
      title: 'Contact Us',
      description: 'Reach out to our customer support team within 7 days of delivery to request a return.',
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

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F5]">
      <Navbar />

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
          <p className="text-[#374151] text-sm md:text-base max-w-2xl mx-auto">
            We want you to be completely satisfied with your purchase. Our return policy is designed to make the process simple and hassle-free.
          </p>
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
          <h2 className="text-2xl font-bold text-[rgb(72,29,111)] mb-6">
            How to Return an Item
          </h2>
          <div className="space-y-6">
            {steps.map((item, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-[rgb(72,29,111)] text-white flex items-center justify-center font-bold text-lg">
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

        {/* Contact CTA */}
        <section className="mt-12 text-center">
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-8 shadow-sm">
            <h3 className="text-xl font-semibold text-[rgb(72,29,111)] mb-3">
              Need Help with a Return?
            </h3>
            <p className="text-sm text-[#6B7280] mb-6">
              Our customer support team is here to assist you with any questions about returns or refunds.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[rgb(72,29,111)] text-white rounded-full font-semibold hover:bg-[#390e60] transition-all duration-200"
            >
              Contact Support
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ReturnPolicyPage;
