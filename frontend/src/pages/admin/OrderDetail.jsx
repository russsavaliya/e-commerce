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
  IndianRupee
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getOrderById, updateOrderStatus } from '../../services/admin/orderService';
import { API_BASE_URL } from '../../utils/constants';

const getStatusColor = (status) => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    accepted: 'bg-blue-100 text-blue-800 border-blue-200',
    shipped: 'bg-purple-100 text-purple-800 border-purple-200',
    delivered: 'bg-green-100 text-green-800 border-green-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200',
    missing: 'bg-orange-100 text-orange-800 border-orange-200',
    failed: 'bg-red-100 text-red-800 border-red-200',
  };
  return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
};

const getPaymentStatusColor = (status) => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    paid: 'bg-green-100 text-green-800 border-green-200',
    failed: 'bg-red-100 text-red-800 border-red-200',
    refunded: 'bg-orange-100 text-orange-800 border-orange-200',
  };
  return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
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
        toast.success(`Order status updated to ${newStatus}`);
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      toast.error(err.message || 'Failed to update order status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getAllStatusOptions = () => {
    return ['pending', 'accepted', 'shipped', 'delivered', 'cancelled', 'missing', 'failed'];
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
      {/* Back Button */}
      <button
        onClick={() => navigate('/admin/orders/list')}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Orders
      </button>

      {/* Order Header Card */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-green-50 to-green-100 px-6 py-5 border-b border-green-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="p-3 bg-green-200 rounded-lg">
                <ShoppingBag className="w-6 h-6 text-green-700" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
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
              <div className="bg-white rounded-full border border-gray-300 shadow-sm hover:shadow-md transition-all relative">
                <select
                  defaultValue=""
                  onChange={(e) => {
                    if (e.target.value) {
                      handleStatusChange(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  disabled={updatingStatus}
                  className="appearance-none pl-4 pr-9 py-2 text-sm font-semibold text-gray-900 bg-transparent focus:outline-none focus:ring-2 focus:ring-green-500 rounded-full cursor-pointer w-full"
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
                <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Payment Status Box */}
              <div className="bg-white px-4 py-3 rounded-lg border-2 border-gray-200 shadow-md">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Payment:</span>
                  <span className={`inline-flex px-3 py-1.5 text-xs font-bold rounded-full border ${getPaymentStatusColor(order.payment_status)}`}>
                    {order.payment_status || 'N/A'}
                  </span>
                </div>
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
                              <span className="text-rose-600 font-semibold ml-2 text-sm">({product.variant_name})</span>
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
    </div>
  );
};

export default OrderDetail;
