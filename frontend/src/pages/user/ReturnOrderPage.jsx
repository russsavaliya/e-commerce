import React, { useState } from 'react';
import Navbar from '../../components/user/Navbar';
import Footer from '../../components/user/Footer';
import { sendOTP, verifyOTP, createReturn } from '../../services/user/returnOrderService';
import { Loader2, Package, Calendar, CheckCircle2, AlertCircle, ArrowRight, Mail, Key, FileText } from 'lucide-react';
import { API_BASE_URL } from '../../utils/constants';
import toast from 'react-hot-toast';

// Helper function to normalize image paths
const normalizeImagePath = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  const normalizedPath = imagePath.replace(/\\/g, '/');
  const cleanPath = normalizedPath.startsWith('public/')
    ? normalizedPath.replace('public/', '')
    : normalizedPath;
  return `${API_BASE_URL}/${cleanPath}`;
};

const formatDate = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const ReturnOrderPage = () => {
  // Step 1: Order ID & Email
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ orderId: '', email: '' });
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [error, setError] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [returnReason, setReturnReason] = useState('');
  const [selectedReason, setSelectedReason] = useState('');
  const [otherReason, setOtherReason] = useState('');

  // Fixed return reasons
  const returnReasons = [
    'Product damaged or defective',
    'Wrong item received',
    'Size/fit not suitable',
    'Quality not as expected',
    'Changed my mind',
    'Other'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleOtpChange = (e) => {
    setOtp(e.target.value);
    setError('');
  };

  // Step 1: Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.orderId || !form.email) {
      setError('Please enter your Order ID and Email.');
      return;
    }

    try {
      setLoading(true);
      const res = await sendOTP({
        orderId: form.orderId.trim(),
        email: form.email.trim(),
      });

      if (res.status) {
        toast.success('OTP sent successfully to your email');
        setStep(2);
      } else {
        setError(res.message || 'Failed to send OTP');
      }
    } catch (err) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    try {
      setLoading(true);
      const res = await verifyOTP({
        orderId: form.orderId.trim(),
        email: form.email.trim(),
        otp: otp.trim(),
      });

      if (res.status && res.data) {
        toast.success('OTP verified successfully');
        setOrderData(res.data);
        // Initialize selected products with all products
        // Ensure product_id and variant_id are always strings
        setSelectedProducts(
          res.data.order.products.map((p) => {
            // Convert product_id to string
            let productId = '';
            if (p.product_id) {
              if (typeof p.product_id === 'object' && p.product_id._id) {
                productId = p.product_id._id.toString();
              } else {
                productId = p.product_id.toString();
              }
            }

            // Convert variant_id to string (if exists)
            let variantId = '';
            if (p.variant_id) {
              if (typeof p.variant_id === 'object' && p.variant_id._id) {
                variantId = p.variant_id._id.toString();
              } else {
                variantId = p.variant_id.toString();
              }
            }

            return {
              product_id: productId,
              variant_id: variantId,
              product_name: p.product_name,
              variant_name: p.variant_name,
              quantity: p.quantity,
              unit_price: p.unit_price,
              image: p.image,
              selected: true,
              returnQuantity: p.quantity,
            };
          })
        );
        setStep(3);
      } else {
        setError(res.message || 'Failed to verify OTP');
      }
    } catch (err) {
      setError(err.message || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Create Return Request
  const handleCreateReturn = async (e) => {
    e.preventDefault();
    setError('');

    if (!orderData.isEligible) {
      setError('Return window has expired. Returns are only allowed within 7 days of delivery.');
      return;
    }

    // Prepare products payload with proper string IDs
    const productsToReturn = selectedProducts
      .filter((p) => p.selected && p.returnQuantity > 0)
      .map((p) => ({
        product_id: String(p.product_id), // Ensure it's always a string
        variant_id: p.variant_id ? String(p.variant_id) : null,
        product_name: p.product_name,
        variant_name: p.variant_name,
        quantity: p.returnQuantity,
        unit_price: p.unit_price,
      }));

    if (productsToReturn.length === 0) {
      setError('Please select at least one product to return');
      return;
    }

    // Validate return reason
    if (!selectedReason || selectedReason.trim() === '') {
      setError('Please select a return reason');
      return;
    }

    // If "Other" is selected, validate other reason text
    if (selectedReason === 'Other' && (!otherReason || otherReason.trim() === '')) {
      setError('Please provide a reason for return');
      return;
    }

    try {
      setLoading(true);
      // Prepare reason text
      const reasonText = selectedReason === 'Other' 
        ? otherReason.trim() 
        : selectedReason;

      const res = await createReturn({
        orderId: form.orderId.trim(),
        email: form.email.trim(),
        products: productsToReturn,
        reason: reasonText,
      });

      if (res.status) {
        toast.success('Your return request has been submitted. Pickup will be scheduled soon.');
        // Reset form
        setStep(1);
        setForm({ orderId: '', email: '' });
        setOtp('');
        setOrderData(null);
        setSelectedProducts([]);
        setReturnReason('');
        setSelectedReason('');
        setOtherReason('');
      } else {
        setError(res.message || 'Failed to create return request');
      }
    } catch (err) {
      setError(err.message || 'Failed to create return request');
    } finally {
      setLoading(false);
    }
  };

  const toggleProductSelection = (index) => {
    setSelectedProducts((prev) => {
      const updated = [...prev];
      updated[index].selected = !updated[index].selected;
      if (!updated[index].selected) {
        updated[index].returnQuantity = 0;
      } else {
        updated[index].returnQuantity = updated[index].quantity;
      }
      return updated;
    });
  };

  const handleQuantityChange = (index, value) => {
    setSelectedProducts((prev) => {
      const updated = [...prev];
      const maxQty = updated[index].quantity;
      const newQty = Math.max(0, Math.min(maxQty, parseInt(value) || 0));
      updated[index].returnQuantity = newQty;
      return updated;
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 lg:px-6 py-10 space-y-8 w-full">
        {/* Header */}
        <section className="text-center space-y-2">
          <p className="text-[#481d6f] font-semibold tracking-wide uppercase text-xs">
            Return Order
          </p>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Request a Return
          </h1>
          <p className="text-gray-600 text-sm max-w-2xl mx-auto">
            Enter your Order ID and email to start the return process. Returns are allowed within 7 days of delivery.
          </p>
        </section>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-[rgb(72,29,111)]' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-[rgb(72,29,111)] text-white' : 'bg-gray-200 text-gray-500'}`}>
              {step > 1 ? <CheckCircle2 className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
            </div>
            <span className="text-sm font-medium hidden sm:inline">Order Details</span>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400" />
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-[rgb(72,29,111)]' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-[rgb(72,29,111)] text-white' : 'bg-gray-200 text-gray-500'}`}>
              {step > 2 ? <CheckCircle2 className="w-5 h-5" /> : <Key className="w-5 h-5" />}
            </div>
            <span className="text-sm font-medium hidden sm:inline">Verify OTP</span>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400" />
          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-[rgb(72,29,111)]' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-[rgb(72,29,111)] text-white' : 'bg-gray-200 text-gray-500'}`}>
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium hidden sm:inline">Return Details</span>
          </div>
        </div>

        {/* Step 1: Order ID & Email */}
        {step === 1 && (
          <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 md:p-6">
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order ID *
                  </label>
                  <input
                    type="text"
                    name="orderId"
                    value={form.orderId}
                    onChange={handleChange}
                    placeholder="e.g. ORD-1698765432100"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(72,29,111)]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Email used during checkout"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(72,29,111)]"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[rgb(72,29,111)] text-white text-sm font-semibold hover:bg-[#390e60] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send OTP
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Step 2: OTP Verification */}
        {step === 2 && (
          <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 md:p-6">
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enter OTP *
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={handleOtpChange}
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(72,29,111)] text-center text-2xl tracking-widest"
                  required
                />
                <p className="text-xs text-gray-500 mt-2">
                  OTP has been sent to {form.email}
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setOtp('');
                    setError('');
                  }}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[rgb(72,29,111)] text-white text-sm font-semibold hover:bg-[#390e60] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify OTP
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Step 3: Order Details & Return Request */}
        {step === 3 && orderData && (
          <section className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 md:p-6 space-y-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                    <Package className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">Order</p>
                    <p className="text-sm font-semibold text-gray-900">{orderData.order.order_id}</p>
                    <p className="text-xs text-gray-500">
                      Placed on {formatDate(orderData.order.created_at)}
                    </p>
                  </div>
                </div>
                <div className="text-right text-sm">
                  <p className="text-gray-500">Delivery Date</p>
                  <p className="font-semibold text-gray-900">
                    {formatDate(orderData.order.delivery_date)}
                  </p>
                </div>
              </div>

              {/* Return Eligibility Status */}
              {!orderData.isEligible && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>Return window expired. Returns are only allowed within 7 days of delivery.</span>
                </div>
              )}

              {orderData.isEligible && (
                <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Your order is eligible for return. Return window ends on {formatDate(orderData.returnWindowEnd)}.</span>
                </div>
              )}

              {/* Products List */}
              <div className="border-t border-gray-100 pt-4 space-y-3">
                <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Select Products to Return
                </p>
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {selectedProducts.map((item, idx) => (
                    <div
                      key={idx}
                      className={`flex items-start gap-3 p-3 rounded-lg border ${
                        item.selected ? 'border-[rgb(72,29,111)] bg-purple-50' : 'border-gray-200'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={item.selected}
                        onChange={() => toggleProductSelection(idx)}
                        className="mt-1 w-4 h-4 text-[rgb(72,29,111)] border-gray-300 rounded focus:ring-[rgb(72,29,111)]"
                      />
                      <div className="w-16 h-20 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0 border border-gray-200">
                        {item.image ? (
                          <img
                            src={normalizeImagePath(item.image)}
                            alt={item.product_name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className={`w-full h-full flex items-center justify-center ${item.image ? 'hidden' : ''}`}>
                          <Package className="w-5 h-5 text-gray-400" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900">{item.product_name}</p>
                        {item.variant_name && (
                          <p className="text-xs text-gray-500">{item.variant_name}</p>
                        )}
                        {item.selected && (
                          <div className="mt-2 flex items-center gap-2">
                            <label className="text-xs text-gray-600">Return Qty:</label>
                            <input
                              type="number"
                              min="1"
                              max={item.quantity}
                              value={item.returnQuantity || item.quantity}
                              onChange={(e) => handleQuantityChange(idx, e.target.value)}
                              className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[rgb(72,29,111)]"
                            />
                            <span className="text-xs text-gray-500">/ {item.quantity}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Return Reason */}
              <div className="border-t border-gray-100 pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Return Reason <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedReason}
                  onChange={(e) => {
                    setSelectedReason(e.target.value);
                    setOtherReason(''); // Clear other reason when changing selection
                    setError('');
                  }}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(72,29,111)] bg-white"
                  required
                >
                  <option value="">Select a reason</option>
                  {returnReasons.map((reason, index) => (
                    <option key={index} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>

                {/* Show textarea when "Other" is selected */}
                {selectedReason === 'Other' && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Please specify the reason <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={otherReason}
                      onChange={(e) => {
                        setOtherReason(e.target.value);
                        setError('');
                      }}
                      placeholder="Please let us know why you're returning this order..."
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(72,29,111)] resize-none"
                      required
                    />
                  </div>
                )}
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleCreateReturn} className="flex justify-between pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setStep(2);
                    setError('');
                  }}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading || !orderData.isEligible || selectedProducts.filter((p) => p.selected && p.returnQuantity > 0).length === 0}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[rgb(72,29,111)] text-white text-sm font-semibold hover:bg-[#390e60] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Return Order'
                  )}
                </button>
              </form>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ReturnOrderPage;

