import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, Loader2, Search, ChevronLeft, ChevronRight, Filter, Download, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getAllOrders, downloadOrders } from '../../services/admin/orderService';

const getStatusColor = (status) => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-blue-100 text-blue-800',
    shipment: 'bg-indigo-100 text-indigo-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    missing: 'bg-orange-100 text-orange-800',
    failed: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

const getPaymentStatusColor = (status) => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    refunded: 'bg-orange-100 text-orange-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

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

  // Refs
  const searchTimeoutRef = useRef(null);
  const isMounted = useRef(true);
  const downloadMenuRef = useRef(null);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const [downloadingFormat, setDownloadingFormat] = useState(null); // 'csv' | 'pdf' | null

  // Main data fetching effect
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Close download dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        downloadMenuRef.current &&
        !downloadMenuRef.current.contains(event.target)
      ) {
        setIsDownloadOpen(false);
      }
    };

    if (isDownloadOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDownloadOpen]);

  // Initial fetch on mount
  useEffect(() => {
    fetchOrders(1);
  }, []);

  // Fetch orders when filters change
  useEffect(() => {
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce search
    if (searchTerm) {
      searchTimeoutRef.current = setTimeout(() => {
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchOrders(1); // Reset to page 1 on search
      }, 500);
    } else {
      setPagination(prev => ({ ...prev, page: 1 }));
      fetchOrders(1);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, orderStatusFilter, paymentStatusFilter]);

  // Fetch orders when page or limit changes
  useEffect(() => {
    fetchOrders(pagination.page);
  }, [pagination.page, pagination.limit]);

  const fetchOrders = async (page) => {
    if (!isMounted.current) return;

    try {
      setLoading(true);

      const response = await getAllOrders(
        page,
        pagination.limit,
        searchTerm,
        orderStatusFilter,
        paymentStatusFilter
      );

      if (!isMounted.current) return;

      // Backend response structure: { status: true, message: '...', data: { orders, total_count, total_pages, page, limit } }
      if (response.status && response.data) {
        setOrders(response.data.orders || []);
        setPagination(prev => ({
          ...prev,
          page: response.data.page || page,
          limit: response.data.limit || pagination.limit,
          total_count: response.data.total_count || 0,
          total_pages: response.data.total_pages || 0,
        }));
      } else {
        setOrders([]);
        setPagination(prev => ({
          ...prev,
          total_count: 0,
          total_pages: 0,
        }));
      }
    } catch (error) {
      console.error('Fetch Orders Error:', error);
      if (isMounted.current) {
        setOrders([]);
        setPagination(prev => ({
          ...prev,
          total_count: 0,
          total_pages: 0,
        }));
        toast.error(error.message || 'Failed to fetch orders');
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.total_pages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const handleLimitChange = (e) => {
    const newLimit = Number(e.target.value);
    setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }));
    fetchOrders(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleOrderStatusFilterChange = (e) => {
    setOrderStatusFilter(e.target.value);
  };

  const handlePaymentStatusFilterChange = (e) => {
    setPaymentStatusFilter(e.target.value);
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

  if (loading && orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-green-600 mb-4" />
        <span className="text-lg font-medium text-gray-700">Loading orders...</span>
        <span className="text-sm text-gray-500 mt-2">Please wait while we fetch the data</span>
      </div>
    );
  }

  return (
    <div className="w-full space-y-5">
      {/* Search, Filters & Download */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-4 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Search */}
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by order ID, customer name, email, or phone..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 bg-white hover:border-gray-400"
              />
            </div>

            {/* Download dropdown */}
            <div className="flex justify-start md:justify-end">
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

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <label className="text-sm text-gray-700 font-semibold">Filters:</label>
            </div>
            <select
              value={orderStatusFilter}
              onChange={handleOrderStatusFilterChange}
              className="px-3.5 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all bg-white hover:border-gray-400"
            >
              <option value="">All Order Status</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="shipment">Shipment</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="missing">Missing</option>
              <option value="failed">Failed</option>
            </select>
            <select
              value={paymentStatusFilter}
              onChange={handlePaymentStatusFilterChange}
              className="px-3.5 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all bg-white hover:border-gray-400"
            >
              <option value="">All Payment Status</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
            {(searchTerm || orderStatusFilter || paymentStatusFilter) && (
              <button
                onClick={clearFilters}
                className="px-3.5 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200 font-medium border border-gray-200 hover:border-gray-300"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <ShoppingBag className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-base font-semibold text-gray-700 mb-1.5">No orders found</p>
            <p className="text-sm text-gray-500">
              {searchTerm || orderStatusFilter || paymentStatusFilter
                ? 'Try adjusting your search or filters'
                : 'No orders have been placed yet'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-green-50 to-emerald-50/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Products
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Total Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Order Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Payment Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Date
                    </th>
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
                        <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.order_status)}`}>
                          {order.order_status || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(order.payment_status)}`}>
                          {order.payment_status || 'N/A'}
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
            {pagination.total_pages > 1 && (
              <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600 font-medium">Items per page:</label>
                    <select
                      value={pagination.limit}
                      onChange={handleLimitChange}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all bg-white hover:border-gray-400"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>

                  <div className="text-sm text-gray-600">
                    Showing{' '}
                    <span className="font-semibold text-gray-900">
                      {((pagination.page - 1) * pagination.limit) + 1}
                    </span>{' '}
                    to{' '}
                    <span className="font-semibold text-gray-900">
                      {Math.min(pagination.page * pagination.limit, pagination.total_count)}
                    </span>{' '}
                    of{' '}
                    <span className="font-semibold text-gray-900">{pagination.total_count}</span> orders
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-white hover:border-gray-400 active:bg-gray-50 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-1.5">
                      {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
                        let pageNum;
                        if (pagination.total_pages <= 5) {
                          pageNum = i + 1;
                        } else if (pagination.page <= 3) {
                          pageNum = i + 1;
                        } else if (pagination.page >= pagination.total_pages - 2) {
                          pageNum = pagination.total_pages - 4 + i;
                        } else {
                          pageNum = pagination.page - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-3.5 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                              pagination.page === pageNum
                                ? 'bg-green-600 text-white shadow-sm'
                                : 'border border-gray-300 hover:bg-white hover:border-gray-400 active:bg-gray-50 text-gray-700'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.total_pages}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-white hover:border-gray-400 active:bg-gray-50 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default OrderList;