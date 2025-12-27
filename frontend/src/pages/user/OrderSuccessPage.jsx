import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/user/Navbar';
import Footer from '../../components/user/Footer';
import { CheckCircle2, Package, ArrowRight, Home } from 'lucide-react';
import { getPaymentStatus } from '../../services/user/checkoutService';
import { trackOrder } from '../../services/user/orderTrackService';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

const OrderSuccessPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      // Get full order details (API returns full details if payment is paid OR COD order is confirmed)
      const response = await getPaymentStatus(orderId);
      
      // Check if order is paid (online payment) OR confirmed COD order
      const isPaid = response.status && response.data.payment_status === 'paid';
      const isCODConfirmed = response.status && 
        response.data.payment_method === 'cod' && 
        response.data.order_status === 'confirmed' &&
        response.data.sub_total !== undefined; // Full details are present
      
      if (isPaid || isCODConfirmed) {
        // API now returns full order details including amounts and shipping address
        setOrderData(response.data);
      } else {
        // If not paid and not confirmed COD, show error
        toast.error('Order not confirmed. Please contact support.');
        setTimeout(() => navigate('/order/track'), 2000);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Failed to load order details');
      setTimeout(() => navigate('/order/track'), 2000);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAF9F5]">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[rgb(72,29,111)]" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F5]">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 lg:px-6 py-12 w-full">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[rgb(72,29,111)] mb-3">
            Order Confirmed!
          </h1>
          <p className="text-lg text-[#374151] mb-2">
            Thank you for your purchase
          </p>
          {orderData && (
            <p className="text-sm text-[#6B7280]">
              Order ID: <span className="font-semibold text-[rgb(72,29,111)]">{orderData.order_id}</span>
            </p>
          )}
        </div>

        {/* Order Details Card */}
        {orderData && (
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 md:p-8 shadow-sm mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-[rgba(72,29,111,0.1)] flex items-center justify-center">
                <Package className="w-5 h-5 text-[rgb(72,29,111)]" />
              </div>
              <h2 className="text-xl font-semibold text-[rgb(72,29,111)]">Order Details</h2>
            </div>

            {/* Order Summary */}
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center py-2 border-b border-[#E5E7EB]">
                <span className="text-[#6B7280]">Subtotal</span>
                <span className="font-semibold text-[#374151]">
                  ₹ {orderData.sub_total?.toLocaleString('en-IN') || '0'}
                </span>
              </div>
              {orderData.shipping_amount > 0 && (
                <div className="flex justify-between items-center py-2 border-b border-[#E5E7EB]">
                  <span className="text-[#6B7280]">Shipping</span>
                  <span className="font-semibold text-[#374151]">
                    ₹ {orderData.shipping_amount.toLocaleString('en-IN')}
                  </span>
                </div>
              )}
              {orderData.total_tax > 0 && (
                <div className="flex justify-between items-center py-2 border-b border-[#E5E7EB]">
                  <span className="text-[#6B7280]">Tax</span>
                  <span className="font-semibold text-[#374151]">
                    ₹ {orderData.total_tax.toLocaleString('en-IN')}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center py-2">
                <span className="text-lg font-semibold text-[rgb(72,29,111)]">Total</span>
                <span className="text-lg font-bold text-[rgb(72,29,111)]">
                  ₹ {orderData.total_amount?.toLocaleString('en-IN') || '0'}
                </span>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-[rgba(72,29,111,0.05)] rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-[#6B7280]">Payment Method</span>
                <span className="text-sm font-semibold text-[rgb(72,29,111)] capitalize">
                  {orderData.payment_method === 'online' ? 'Online Payment' : 'Cash on Delivery'}
                </span>
              </div>
              {/* Show Payment Status only for online payments, not for COD */}
              {orderData.payment_method === 'online' && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#6B7280]">Payment Status</span>
                  <span className="text-sm font-semibold text-green-600 capitalize">
                    {orderData.payment_status}
                  </span>
                </div>
              )}
            </div>

            {/* Products List */}
            {orderData.products && orderData.products.length > 0 && (
              <div className="border-t border-[#E5E7EB] pt-6 mb-6">
                <h3 className="text-sm font-semibold text-[rgb(72,29,111)] mb-4 uppercase tracking-wide">
                  Ordered Items
                </h3>
                <div className="space-y-3">
                  {orderData.products.map((product, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 bg-[rgba(72,29,111,0.02)] rounded-lg">
                      {product.image && (
                        <img
                          src={product.image}
                          alt={product.product_name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-[#374151] text-sm">{product.product_name}</p>
                        {product.variant_name && (
                          <p className="text-xs text-[#6B7280]">Variant: {product.variant_name}</p>
                        )}
                        <p className="text-xs text-[#6B7280]">Qty: {product.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-[rgb(72,29,111)]">
                          ₹ {product.total.toLocaleString('en-IN')}
                        </p>
                        <p className="text-xs text-[#6B7280]">
                          ₹ {product.unit_price.toLocaleString('en-IN')} each
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Shipping Address */}
            {orderData.shipping_address && (
              <div className="border-t border-[#E5E7EB] pt-6">
                <h3 className="text-sm font-semibold text-[rgb(72,29,111)] mb-3 uppercase tracking-wide">
                  Shipping Address
                </h3>
                <div className="text-sm text-[#374151] space-y-1">
                  <p className="font-medium">{orderData.shipping_address.fullName}</p>
                  <p>{orderData.shipping_address.address}</p>
                  <p>
                    {orderData.shipping_address.city}, {orderData.shipping_address.state} - {orderData.shipping_address.pincode}
                  </p>
                  <p>Phone: {orderData.shipping_address.phone}</p>
                  <p>Email: {orderData.shipping_address.email}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {/* <Link
            to="/order/track"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border-[1.5px] border-[rgb(72,29,111)] text-[rgb(72,29,111)] rounded-full font-semibold hover:bg-[rgba(72,29,111,0.08)] transition-all duration-200"
          >
            <Package className="w-5 h-5" />
            Track Order
          </Link> */}
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[rgb(72,29,111)] text-white rounded-full font-semibold hover:bg-[#390e60] transition-all duration-200"
          >
            <Home className="w-5 h-5" />
            Continue Shopping
          </Link>
        </div>

        {/* Info Message */}
        <div className="mt-8 text-center">
          <p className="text-sm text-[#6B7280]">
            A confirmation email has been sent to your email address.
            <br />
            You can track your order status anytime from the order tracking page.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderSuccessPage;
