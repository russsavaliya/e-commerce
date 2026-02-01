import React, { useState, useEffect } from 'react';
import Navbar from '../../components/user/Navbar';
import Footer from '../../components/user/Footer';
import { trackOrder, cancelOrder } from '../../services/user/orderTrackService';
import { Loader2, Package, Calendar, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { API_BASE_URL } from '../../utils/constants';
import toast from 'react-hot-toast';

// Helper function to normalize image paths
const normalizeImagePath = (imagePath) => {
  if (!imagePath) return '';
  // If already a full URL (Cloudinary or other CDN), return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  // Convert Windows backslashes to forward slashes for URLs
  const normalizedPath = imagePath.replace(/\\/g, '/');
  // Remove leading 'public/' if present (since express.static serves from public folder)
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
    hour: '2-digit',
    minute: '2-digit',
  });
};

const OrderTrackPage = () => {
  const [form, setForm] = useState({ orderId: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  useEffect(() => {
    // Scroll to top when cart page loads
    window.scrollTo(0, 0);
  }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setOrder(null);

    if (!form.orderId || !form.email) {
      setError('Please enter your Order ID and Email.');
      return;
    }

    try {
      setLoading(true);
      const res = await trackOrder({
        orderId: form.orderId.trim(),
        email: form.email.trim(),
      });
      if (res.status && res.data) {
        setOrder(res.data);
      } else {
        setError(res.message || 'Unable to find order.');
      }
    } catch (err) {
      setError(err.message || 'Unable to find order.');
    } finally {
      setLoading(false);
    }
  };

  // Check if order can be cancelled
  const canCancelOrder = (orderStatus) => {
    const cancellableStatuses = ['pending', 'confirmed', 'accepted'];
    return cancellableStatuses.includes(orderStatus?.toLowerCase());
  };

  const handleCancelOrder = async () => {
    if (!order) return;

    // Validate reason
    const finalReason = cancelReason === 'Other' ? customReason.trim() : cancelReason;

    if (!finalReason) {
      toast.error('Please select or enter a cancellation reason');
      return;
    }

    try {
      setCancelling(true);
      const res = await cancelOrder({
        orderId: order.order_id,
        email: form.email.trim(),
        reason: finalReason,
      });

      if (res.status) {
        toast.success('Order cancelled successfully!');
        // Update order state to reflect cancellation
        setOrder({ ...order, order_status: 'cancelled', cancellation_reason: finalReason });
        setShowCancelConfirm(false);
        setCancelReason('');
        setCustomReason('');
      } else {
        toast.error(res.message || 'Failed to cancel order');
      }
    } catch (err) {
      console.error('Cancel order error:', err);
      toast.error(err.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 lg:px-6 py-10 space-y-8 w-full">
        {/* Header */}
        <section className="text-center space-y-2">
          <p className="text-[#481d6f]-500 font-semibold tracking-wide uppercase text-xs">
            Track Order
          </p>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Check Your Order Status
          </h1>
          <p className="text-gray-600 text-sm max-w-2xl mx-auto">
            Enter your Order ID and email used during checkout. Orders can be tracked for up to
            10 days from the date of placing.
          </p>
        </section>

        {/* Form */}
        <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 md:p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order ID
                </label>
                <input
                  type="text"
                  name="orderId"
                  value={form.orderId}
                  onChange={handleChange}
                  placeholder="e.g. ORD-1698765432100"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(72,29,111)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Email used during checkout"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(72,29,111)]"
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
                    Checking...
                  </>
                ) : (
                  'Check Status'
                )}
              </button>
            </div>
          </form>
        </section>

        {/* Order summary */}
        {order && (
          <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 md:p-6 space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${order.order_status?.toLowerCase() === 'cancelled'
                  ? 'bg-red-50'
                  : 'bg-emerald-50'
                  }`}>
                  {order.order_status?.toLowerCase() === 'cancelled' ? (
                    <XCircle className="w-5 h-5 text-red-600" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  )}
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">Order</p>
                  <p className="text-sm font-semibold text-gray-900">{order.order_id}</p>
                  <p className="text-xs text-gray-500">
                    Placed on {formatDate(order.created_at)}
                  </p>
                </div>
              </div>
              <div className="text-right text-sm">
                <p className="text-gray-500">Status</p>
                <p className={`font-semibold capitalize ${order.order_status?.toLowerCase() === 'cancelled'
                  ? 'text-red-600'
                  : 'text-gray-900'
                  }`}>
                  {order.order_status}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Payment:{' '}
                  <span className="font-medium uppercase">
                    {order.payment_status}
                  </span>
                </p>
              </div>
            </div>

            {/* Cancel Order Section */}
            {canCancelOrder(order.order_status) && (
              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 mb-2">
                      Need to cancel your order?
                    </p>
                    <p className="text-xs text-gray-600 mb-3">
                      You can cancel this order as it has not been shipped yet.
                    </p>
                    <button
                      onClick={() => setShowCancelConfirm(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-all duration-200"
                    >
                      <XCircle className="w-4 h-4" />
                      Cancel Order
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Notice for non-cancellable orders */}
            {!canCancelOrder(order.order_status) && order.order_status?.toLowerCase() !== 'cancelled' && (
              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 mb-1">
                      Order cannot be cancelled
                    </p>
                    <p className="text-xs text-gray-600">
                      Your order shipment has already been prepared or dispatched. Please contact support for assistance.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Items */}
            <div className="border-t border-gray-100 pt-4 space-y-2">
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Items
              </p>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {order.products?.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm">
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
                      <p className="font-medium text-gray-900 truncate">
                        {item.product_name}
                      </p>
                      {item.variant_name && (
                        <p className="text-xs text-gray-500 truncate">
                          {item.variant_name}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                      ₹{item.total?.toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="border-t border-gray-100 pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm">
              <div className="space-y-1 text-gray-600">
                <p>
                  Subtotal:{' '}
                  <span className="font-semibold text-gray-900">
                    ₹{order.sub_total?.toLocaleString('en-IN') || 0}
                  </span>
                </p>
                <p>
                  Shipping:{' '}
                  <span className="font-semibold text-gray-900">
                    ₹{order.shipping_amount?.toLocaleString('en-IN') || 0}
                  </span>
                </p>
                <p>
                  Tax:{' '}
                  <span className="font-semibold text-gray-900">
                    ₹{order.total_tax?.toLocaleString('en-IN') || 0}
                  </span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Total
                </p>
                <p className="text-xl font-bold text-gray-900">
                  ₹{order.total_amount?.toLocaleString('en-IN') || 0}
                </p>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  Cancel Order?
                </h3>
                <p className="text-sm text-gray-600">
                  Please tell us why you want to cancel order <span className="font-semibold">{order?.order_id}</span>
                </p>
              </div>
            </div>

            {/* Cancellation Reason Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Reason for Cancellation <span className="text-red-500">*</span>
              </label>
              <select
                value={cancelReason}
                onChange={(e) => {
                  setCancelReason(e.target.value);
                  if (e.target.value !== 'Other') {
                    setCustomReason('');
                  }
                }}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(72,29,111)]"
              >
                <option value="">Select a reason...</option>
                <option value="Changed my mind">Changed my mind</option>
                <option value="Found better price elsewhere">Found better price elsewhere</option>
                <option value="Ordered by mistake">Ordered by mistake</option>
                <option value="Delivery time is too long">Delivery time is too long</option>
                <option value="Want to change shipping address">Want to change shipping address</option>
                <option value="Financial constraints">Financial constraints</option>
              </select>

              {/* Custom Reason Text Field */}
              {cancelReason === 'Other' && (
                <div className="animate-fade-in">
                  <textarea
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="Please specify your reason..."
                    rows={3}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(72,29,111)] resize-none"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setShowCancelConfirm(false);
                  setCancelReason('');
                  setCustomReason('');
                }}
                disabled={cancelling}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-200 disabled:opacity-50"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {cancelling ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  'Yes, Cancel'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default OrderTrackPage;