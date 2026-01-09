import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, Loader2, Search, Download, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getAllOrders, downloadOrders } from '../../services/admin/orderService';
import { useDebounce } from '../../hooks/useDebounce';
import { useClickOutside } from '../../hooks/useClickOutside';
import { getStatusColor, formatDate } from '../../utils/orderConstants';
import OrderFilters from '../../components/admin/OrderFilters';
import Pagination from '../../components/admin/Pagination';

const OrderList = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total_count: 0,
    total_pages: 0,
  });

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
  
  // Download states
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const [downloadingFormat, setDownloadingFormat] = useState(null);

  // Refs
  const isMounted = useRef(true);
  const downloadMenuRef = useClickOutside(() => setIsDownloadOpen(false));

  // Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Fetch orders
  const fetchOrders = async (page = pagination.page) => {
    if (!isMounted.current) return;

    try {
      setLoading(true);
      const response = await getAllOrders(
        page,
        pagination.limit,
        debouncedSearchTerm,
        orderStatusFilter,
        paymentStatusFilter
      );

      if (!isMounted.current) return;

      if (response.status && response.data) {
        setOrders(response.data.orders || []);
        setPagination(prev => ({
          ...prev,
          page: response.data.page || page,
          limit: response.data.limit || prev.limit,
          total_count: response.data.total_count || 0,
          total_pages: response.data.total_pages || 0,
        }));
      } else {
        setOrders([]);
        setPagination(prev => ({ ...prev, total_count: 0, total_pages: 0 }));
      }
    } catch (error) {
      console.error('Fetch Orders Error:', error);
      if (isMounted.current) {
        setOrders([]);
        setPagination(prev => ({ ...prev, total_count: 0, total_pages: 0 }));
        toast.error(error.message || 'Failed to fetch orders');
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  // Fetch orders when filters or pagination changes
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchOrders(1);
  }, [debouncedSearchTerm, orderStatusFilter, paymentStatusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [pagination.page, pagination.limit]);

  // Handlers
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.total_pages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const handleLimitChange = (e) => {
    const newLimit = Number(e.target.value);
    setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setOrderStatusFilter('');
    setPaymentStatusFilter('');
  };

  const handleDownload = async (format) => {
    try {
      setIsDownloadOpen(false);
      setDownloadingFormat(format);
      const response = await downloadOrders(format, {
        search: searchTerm,
        order_status: orderStatusFilter,
        payment_status: paymentStatusFilter,
      });

      const blob = new Blob([response.data], {
        type: format === 'pdf' ? 'application/pdf' : 'text/csv;charset=utf-8;',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = format === 'pdf' ? 'orders_export.pdf' : 'orders_export.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download orders error:', error);
      toast.error(error.message || 'Failed to download orders');
    } finally {
      setDownloadingFormat(null);
    }
  };

  const getPaymentMethodBadge = (method) => {
    const methodLower = method?.toLowerCase();
    if (methodLower === 'cod') {
      return 'bg-orange-50 text-orange-700 border-orange-200';
    }
    if (methodLower === 'online') {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    }
    return 'bg-gray-50 text-gray-700 border-gray-200';
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-green-600 mb-4" />
        <span className="text-lg font-medium text-gray-700">Loading orders...</span>
        <span className="text-sm text-gray-500 mt-2">Please wait while we fetch the data</span>
      </div>
    );
  }

  const hasActiveFilters = searchTerm || orderStatusFilter || paymentStatusFilter;

  return (
    <div className="space-y-5">
      {/* Top Box - Header, Search, Download & Filters */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm w-full">
        <div className="p-5 lg:p-6 space-y-5">
          {/* Header with Search and Download */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h1 className="text-2xl font-bold text-gray-900">Orders List</h1>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 min-w-[250px] sm:min-w-[300px]">
                <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by order ID, customer name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 bg-white hover:border-gray-400"
                />
              </div>

              {/* Download dropdown */}
              <div className="flex justify-start sm:justify-end">
                <div className="relative inline-block text-left" ref={downloadMenuRef}>
                  <button
                    type="button"
                    onClick={() => !downloadingFormat && setIsDownloadOpen((prev) => !prev)}
                    disabled={!!downloadingFormat}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-gray-900 text-white rounded-lg hover:bg-gray-800 active:bg-gray-900 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
                  >
                    <Download className="w-4 h-4" />
                    {downloadingFormat ? `Downloading ${downloadingFormat.toUpperCase()}...` : 'Download'}
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  {isDownloadOpen && !downloadingFormat && (
                    <div className="absolute right-0 mt-2 w-44 origin-top-right rounded-lg bg-white border border-gray-200 shadow-lg focus:outline-none z-10 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => handleDownload('csv')}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Download CSV
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownload('pdf')}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-t border-gray-100"
                      >
                        Download PDF
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <OrderFilters
            orderStatusFilter={orderStatusFilter}
            paymentStatusFilter={paymentStatusFilter}
            onOrderStatusChange={(e) => setOrderStatusFilter(e.target.value)}
            onPaymentStatusChange={(e) => setPaymentStatusFilter(e.target.value)}
            onClearFilters={clearFilters}
            hasActiveFilters={hasActiveFilters}
          />
        </div>
      </div>

      {/* Bottom Box - Only Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden w-full">
        {orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <ShoppingBag className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-base font-semibold text-gray-700 mb-1.5">No orders found</p>
            <p className="text-sm text-gray-500">
              {hasActiveFilters
                ? 'Try adjusting your search or filters'
                : 'No orders have been placed yet'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1200px]">
                <thead className="bg-gradient-to-r from-green-50 to-emerald-50/50">
                  <tr>
                    {['#', 'Order ID', 'Customer', 'Products', 'Total Amount', 'Order Status', 'Payment Status', 'Payment Method', 'Date'].map((header) => (
                      <th key={header} className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {orders.map((order) => (
                    <tr
                      key={order._id || order.order_id}
                      className="hover:bg-green-50/30 transition-all duration-200 cursor-pointer group"
                      onClick={() => navigate(`/admin/orders/${order.order_id}`)}
                    >
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-600">
                          {order.number_id || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-900 font-mono group-hover:text-green-700 transition-colors">
                          {order.order_id || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors">
                            {order.shipping_address?.fullName || 'N/A'}
                          </div>
                          <div className="text-gray-500 text-xs mt-0.5">
                            {order.shipping_address?.phone || ''}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">
                          {order.products?.length || 0} item{order.products?.length !== 1 ? 's' : ''}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-gray-900">
                          ₹{order.total_amount?.toLocaleString('en-IN') || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusColor(order.order_status, 'order')}`}>
                          {order.order_status || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusColor(order.payment_status, 'payment')}`}>
                          {order.payment_status || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full border ${getPaymentMethodBadge(order.payment_method)}`}>
                          {order.payment_method ? (order.payment_method.toUpperCase() === 'COD' ? 'COD' : 'Online') : 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">
                          {formatDate(order.created_at)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.total_pages}
              totalCount={pagination.total_count}
              limit={pagination.limit}
              onPageChange={handlePageChange}
              onLimitChange={handleLimitChange}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default OrderList;
