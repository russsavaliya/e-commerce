import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Loader2,
  ChevronLeft,
  ChevronDown,
  ShoppingBag,
  Package,
  MapPin,
  CreditCard,
  Calendar,
  User,
  Phone,
  Mail,
  FileText,
  IndianRupee,
  Truck,
  ExternalLink,
  MoreVertical,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getOrderById, updateOrderStatus, updatePaymentStatus, downloadOrderPdf } from '../../services/admin/orderService';
import { getShipmentByOrder } from '../../services/admin/shipmentService';
import { API_BASE_URL } from '../../utils/constants';

const getStatusColor = (status) => {
  const colors = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
    accepted: 'bg-green-50 text-green-700 border-green-200',
    shipment: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    cancelled: 'bg-red-50 text-red-700 border-red-200',
    missing: 'bg-orange-50 text-orange-700 border-orange-200',
    failed: 'bg-rose-50 text-rose-700 border-rose-200',
  };
  return colors[status] || 'bg-gray-50 text-gray-700 border-gray-200';
};

const getPaymentStatusColor = (status) => {
  const colors = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    failed: 'bg-rose-50 text-rose-700 border-rose-200',
    refunded: 'bg-orange-50 text-orange-700 border-orange-200',
  };
  return colors[status] || 'bg-gray-50 text-gray-700 border-gray-200';
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

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

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingPaymentStatus, setUpdatingPaymentStatus] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [shipment, setShipment] = useState(null);
  const [loadingShipment, setLoadingShipment] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await getOrderById(orderId);

        if (response.status && response.data) {
          setOrder(response.data);
        } else {
          setError('Order not found');
        }
      } catch (err) {
        console.error('Error fetching order:', err);
        setError(err.message || 'Failed to load order');
        toast.error(err.message || 'Failed to load order');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetail();
    }
  }, [orderId]);

  const handleStatusChange = async (newStatus) => {
    if (!order || updatingStatus) return;

    try {
      setUpdatingStatus(true);
      const response = await updateOrderStatus(orderId, newStatus);

      if (response.status) {
        setOrder(prev => ({ ...prev, order_status: newStatus }));

        // Show success message (handle warning if shipment creation failed)
        if (response.warning) {
          toast.success(`Order status updated to ${newStatus}`, {
            icon: '⚠️',
          });
          toast.error(response.message || 'Shipment creation failed');
        } else {
          toast.success(`Order status updated to ${newStatus}`);
        }
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      toast.error(err.message || 'Failed to update order status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const fetchShipmentDetails = async () => {
    if (!orderId) return;

    try {
      setLoadingShipment(true);
      const response = await getShipmentByOrder(orderId);
      if (response.status && response.data) {
        setShipment(response.data);
      }
    } catch (err) {
      // Shipment might not exist yet, that's okay
      console.log('Shipment not found or not created yet');
      setShipment(null);
    } finally {
      setLoadingShipment(false);
    }
  };

  // Fetch shipment when order status is 'shipment' or order loads
  useEffect(() => {
    if (order && (order.order_status === 'shipment' || order.order_status === 'delivered')) {
      fetchShipmentDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?.order_status, orderId]);

  const handlePaymentStatusChange = async (newPaymentStatus) => {
    if (!order || updatingPaymentStatus) return;

    try {
      setUpdatingPaymentStatus(true);
      const response = await updatePaymentStatus(orderId, newPaymentStatus);

      if (response.status) {
        setOrder(prev => ({ ...prev, payment_status: newPaymentStatus }));
        toast.success(`Payment status updated to ${newPaymentStatus}`);
      }
    } catch (err) {
      console.error('Error updating payment status:', err);
      toast.error(err.message || 'Failed to update payment status');
    } finally {
      setUpdatingPaymentStatus(false);
    }
  };

  const getPaymentStatusOptions = () => {
    return ['pending', 'paid', 'failed', 'refunded'];
  };

  const getAllStatusOptions = () => {
    return ['pending', 'accepted', 'shipment', 'delivered', 'cancelled', 'missing', 'failed'];
  };

  const handleDownloadPdf = async () => {
    if (!orderId || downloadingPdf) return;

    try {
      setDownloadingPdf(true);
      const response = await downloadOrderPdf(orderId);

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `order_${orderId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading order PDF:', err);
      toast.error(err.message || 'Failed to download order PDF');
    } finally {
      setDownloadingPdf(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-green-600 mb-4" />
        <span className="text-lg font-medium text-gray-700">Loading order details...</span>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="w-full p-4">
        <button
          onClick={() => navigate('/admin/orders/list')}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Orders
        </button>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center">
          <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-lg text-gray-700">{error || 'Order not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-4 lg:p-6 space-y-6">
      {/* Top Header Row */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/admin/orders/list')}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Orders List
        </button>

        {/* Download PDF and Menu */}
        <div className="flex items-center gap-2">
          {/* Download PDF button */}
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-full border border-gray-300 bg-white text-gray-800 hover:bg-gray-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {downloadingPdf ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <FileText className="w-3 h-3" />
                Download PDF
              </>
            )}
          </button>

          {/* 3-dot Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-gray-300 bg-white text-gray-800 hover:bg-gray-100 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {/* Dropdown Menu */}
            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setPaymentModalOpen(true);
                        setMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
                    >
                      <CreditCard className="w-4 h-4 text-[rgb(72,29,111)]" />
                      Manage Payment
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Order Header Card */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-5 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="p-3 bg-gray-200 rounded-lg">
                <ShoppingBag className="w-6 h-6 text-gray-700" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-lg lg:text-xl font-bold text-gray-900">
                    Order #{order.order_id}
                  </h1>
                  <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full border ${getStatusColor(order.order_status)}`}>
                    {order.order_status || 'N/A'}
                  </span>
                </div>
                <p className="text-gray-600 text-sm flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Placed on {formatDate(order.created_at)}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {/* Manage Status Dropdown - pill style */}
              <div className="bg-amber-50 rounded-full border border-amber-300 shadow-sm hover:shadow-md transition-all relative">
                <select
                  defaultValue=""
                  onChange={(e) => {
                    if (e.target.value) {
                      handleStatusChange(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  disabled={updatingStatus}
                  className="appearance-none pl-4 pr-9 py-2 text-sm font-semibold text-amber-900 bg-transparent focus:outline-none focus:ring-2 focus:ring-amber-400 rounded-full cursor-pointer w-full"
                >
                  <option value="" disabled>
                    Manage Status
                  </option>
                  {getAllStatusOptions().map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-amber-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Order Items */}
            <div className="lg:col-span-2">
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Package className="w-5 h-5 text-green-600" />
                    Order Items
                  </h2>
                  <span className="text-xs text-gray-600 bg-white px-3 py-1 rounded-full font-semibold border border-gray-200">
                    {order.products?.length || 0} {order.products?.length === 1 ? 'item' : 'items'}
                  </span>
                </div>
                <div className={`space-y-3 ${order.products?.length > 5 ? 'max-h-[500px] overflow-y-auto pr-2' : ''}`}>
                  {order.products?.map((product, index) => (
                    <div key={index} className="bg-white rounded-lg p-4 border border-gray-200 hover:border-green-300 hover:shadow-md transition-all">
                      <div className="flex items-start gap-4">
                        <div className="w-24 h-24 rounded-lg border-2 border-gray-200 bg-white flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm">
                          {product.image ? (
                            <img
                              src={normalizeImagePath(product.image)}
                              alt={product.product_name}
                              className="w-full h-full object-contain p-1"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <Package className="w-10 h-10 text-gray-300" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 text-base leading-snug mb-1">
                            {product.product_name}
                            {product.variant_name && (
                              <span className="text-[#481d6f]-600 font-semibold ml-2 text-sm">({product.variant_name})</span>
                            )}
                          </h3>
                          {product.category_details?.name && (
                            <p className="text-xs text-gray-500 mb-2">Category: {product.category_details.name}</p>
                          )}
                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                            <div className="flex items-center gap-4">
                              <span className="text-sm text-gray-600">
                                Qty: <span className="font-bold text-gray-900">{product.quantity}</span>
                              </span>
                              <span className="text-sm text-gray-600">
                                Price: <span className="font-semibold text-gray-900">₹{product.unit_price?.toLocaleString('en-IN')}</span>
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-base font-bold text-green-600">
                              <IndianRupee className="w-4 h-4" />
                              {product.total?.toLocaleString('en-IN')}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Summary & Details */}
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-green-600" />
                  Order Summary
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold text-gray-900">₹{order.sub_total?.toLocaleString('en-IN') || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-semibold text-gray-900">₹{order.shipping_amount?.toLocaleString('en-IN') || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-semibold text-gray-900">₹{order.total_tax?.toLocaleString('en-IN') || 0}</span>
                  </div>
                  {order.coupon && order.coupon.discount_amount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        Discount{order.coupon.coupon_code && ` (${order.coupon.coupon_code})`}
                      </span>
                      <span className="font-semibold text-green-600">
                        - ₹{order.coupon.discount_amount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}
                  <div className="border-t-2 border-gray-200 pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-900">Total</span>
                      <div className="flex items-center gap-1 text-xl font-bold text-green-600">
                        <IndianRupee className="w-5 h-5" />
                        {order.total_amount?.toLocaleString('en-IN') || 0}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-green-600" />
                  Shipping Address
                </h2>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <User className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <span className="font-semibold text-gray-900">{order.shipping_address?.fullName || 'N/A'}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{order.shipping_address?.phone || 'N/A'}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Mail className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 break-all">{order.shipping_address?.email || 'N/A'}</span>
                  </div>
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-gray-700 leading-relaxed">
                      {order.shipping_address?.address || 'N/A'}
                      {order.shipping_address?.landmark && `, ${order.shipping_address.landmark}`}
                    </p>
                    <p className="text-gray-700 mt-1">
                      {order.shipping_address?.city || 'N/A'}, {order.shipping_address?.state || 'N/A'} - {order.shipping_address?.pincode || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-green-600" />
                  Payment Info
                </h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Method</span>
                    <span className="font-semibold text-gray-900 uppercase">{order.payment_method || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Status</span>
                    <span className={`inline-flex px-2.5 py-1 text-xs font-bold rounded-full border ${getPaymentStatusColor(order.payment_status)}`}>
                      {order.payment_status || 'N/A'}
                    </span>
                  </div>
                  {order.payment_reference && (
                    <div className="pt-2 border-t border-gray-100">
                      <span className="text-gray-600 text-xs">Reference:</span>
                      <p className="font-medium text-gray-900 text-xs mt-1 break-all">{order.payment_reference}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Shipment Information */}
              {(order.order_status === 'shipment' || order.order_status === 'delivered' || shipment) && (
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
                  <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-indigo-600" />
                    Shipment Details
                  </h2>
                  {loadingShipment ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                      <span className="text-sm text-gray-600 ml-2">Loading shipment...</span>
                    </div>
                  ) : shipment ? (
                    <div className="space-y-3 text-sm">
                      {shipment.shiprocket_order_id && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Shiprocket Order ID</span>
                          <span className="font-semibold text-gray-900">{shipment.shiprocket_order_id}</span>
                        </div>
                      )}
                      {shipment.awb_code && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">AWB Code</span>
                          <span className="font-semibold text-gray-900">{shipment.awb_code}</span>
                        </div>
                      )}
                      {shipment.courier_name && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Courier</span>
                          <span className="font-semibold text-gray-900">{shipment.courier_name}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Status</span>
                        <span className="inline-flex px-2.5 py-1 text-xs font-bold rounded-full border bg-indigo-100 text-indigo-800 border-indigo-200">
                          {shipment.shipment_status || 'created'}
                        </span>
                      </div>
                      {shipment.tracking_url && (
                        <div className="pt-2 border-t border-gray-100">
                          <a
                            href={shipment.tracking_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
                          >
                            Track Shipment
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                      {(shipment.weight || shipment.length || shipment.breadth || shipment.height) && (
                        <div className="pt-2 border-t border-gray-100">
                          <span className="text-gray-600 text-xs">Dimensions:</span>
                          <p className="text-xs text-gray-700 mt-1">
                            {shipment.length}cm × {shipment.breadth}cm × {shipment.height}cm
                            {shipment.weight && ` | Weight: ${shipment.weight}kg`}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 italic py-2">
                      Shipment details will be available once shipment is created
                    </div>
                  )}
                </div>
              )}

              {/* Order Timeline */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-green-600" />
                  Timeline
                </h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Placed</span>
                    <span className="font-medium text-gray-900">{formatDate(order.created_at)}</span>
                  </div>
                  {order.updatedAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Updated</span>
                      <span className="font-medium text-gray-900">{formatDate(order.updatedAt)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Status Modal */}
      {paymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Manage Payment Status</h3>
              <button
                onClick={() => setPaymentModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-4">
              <div className="space-y-2">
                {getPaymentStatusOptions().map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      handlePaymentStatusChange(status);
                      setPaymentModalOpen(false);
                    }}
                    disabled={updatingPaymentStatus || order.payment_status === status}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${order.payment_status === status
                      ? 'bg-blue-50 border-blue-300 text-blue-900 cursor-not-allowed'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium capitalize">{status}</span>
                      {order.payment_status === status && (
                        <span className="text-xs text-blue-600 font-semibold">Current</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              {updatingPaymentStatus && (
                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating payment status...
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetail;
