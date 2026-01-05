import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, Loader2, Eye, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getReturnOrdersList } from '../../services/admin/returnOrderService';

const getStatusColor = (status) => {
  const colors = {
    'Return Requested': 'bg-yellow-100 text-yellow-800',
    'Pickup Scheduled': 'bg-blue-100 text-blue-800',
    'Picked': 'bg-purple-100 text-purple-800',
    'Refunded': 'bg-green-100 text-green-800',
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

const ReturnOrderList = () => {
  const navigate = useNavigate();
  const [returnOrders, setReturnOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total_count: 0,
    total_pages: 0,
  });

  // Filter states
  const [statusFilter, setStatusFilter] = useState('');

  // Refs
  const isMounted = useRef(true);
  const statusFilterRef = useRef(null);
  const [statusFilterOpen, setStatusFilterOpen] = useState(false);

  // Close status filter dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        statusFilterRef.current &&
        !statusFilterRef.current.contains(event.target)
      ) {
        setStatusFilterOpen(false);
      }
    };

    if (statusFilterOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [statusFilterOpen]);

  // Main data fetching effect
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    fetchReturnOrders(1);
  }, []);

  // Fetch when filters change
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchReturnOrders(1);
  }, [statusFilter]);

  // Fetch when page or limit changes
  useEffect(() => {
    fetchReturnOrders(pagination.page);
  }, [pagination.page, pagination.limit]);

  const fetchReturnOrders = async (page) => {
    if (!isMounted.current) return;

    try {
      setLoading(true);

      const response = await getReturnOrdersList({
        page,
        limit: pagination.limit,
        status: statusFilter,
      });

      if (!isMounted.current) return;

      if (response.status && response.data) {
        setReturnOrders(response.data.returnOrders || []);
        setPagination(prev => ({
          ...prev,
          page: response.data.pagination.page || page,
          limit: response.data.pagination.limit || pagination.limit,
          total_count: response.data.pagination.total_count || 0,
          total_pages: response.data.pagination.total_pages || 0,
        }));
      } else {
        setReturnOrders([]);
        setPagination(prev => ({
          ...prev,
          total_count: 0,
          total_pages: 0,
        }));
      }
    } catch (error) {
      console.error('Fetch Return Orders Error:', error);
      if (isMounted.current) {
        setReturnOrders([]);
        setPagination(prev => ({
          ...prev,
          total_count: 0,
          total_pages: 0,
        }));
        toast.error(error.message || 'Failed to fetch return orders');
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
    fetchReturnOrders(1);
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    setStatusFilterOpen(false);
  };

  const clearFilters = () => {
    setStatusFilter('');
  };

  const handleViewClick = (returnOrderId) => {
    navigate(`/admin/return-orders/${returnOrderId}`);
  };

  if (loading && returnOrders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-green-600 mb-4" />
        <span className="text-lg font-medium text-gray-700">Loading return orders...</span>
        <span className="text-sm text-gray-500 mt-2">Please wait while we fetch the data</span>
      </div>
    );
  }

  return (
    <div className="w-full space-y-5">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-gray-900">
          Return Orders
        </h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-4 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Status Filter */}
            <div className="relative" ref={statusFilterRef}>
              <button
                type="button"
                onClick={() => setStatusFilterOpen(!statusFilterOpen)}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 min-w-[180px] justify-between"
              >
                <span>{statusFilter || 'All Status'}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${statusFilterOpen ? 'rotate-180' : ''}`} />
              </button>
              {statusFilterOpen && (
                <div className="absolute z-10 mt-2 w-full rounded-lg bg-white border border-gray-200 shadow-lg focus:outline-none overflow-hidden">
                  <button
                    type="button"
                    onClick={() => handleStatusFilterChange('')}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${!statusFilter ? 'bg-gray-50 font-medium' : 'text-gray-700'}`}
                  >
                    All Status
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusFilterChange('Return Requested')}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${statusFilter === 'Return Requested' ? 'bg-gray-50 font-medium' : 'text-gray-700'}`}
                  >
                    Return Requested
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusFilterChange('Pickup Scheduled')}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${statusFilter === 'Pickup Scheduled' ? 'bg-gray-50 font-medium' : 'text-gray-700'}`}
                  >
                    Pickup Scheduled
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusFilterChange('Picked')}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${statusFilter === 'Picked' ? 'bg-gray-50 font-medium' : 'text-gray-700'}`}
                  >
                    Picked
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusFilterChange('Refunded')}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${statusFilter === 'Refunded' ? 'bg-gray-50 font-medium' : 'text-gray-700'}`}
                  >
                    Refunded
                  </button>
                </div>
              )}
            </div>

            {/* Clear Filters & Refresh */}
            <div className="flex items-center gap-2">
              {(statusFilter) && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200"
                >
                  Clear Filters
                </button>
              )}
              <button
                type="button"
                onClick={() => fetchReturnOrders(pagination.page)}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Customer Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Total Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Requested Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {returnOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <RefreshCw className="w-12 h-12 text-gray-400 mb-4" />
                      <p className="text-sm font-medium text-gray-900">No return orders found</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {statusFilter ? 'Try adjusting your filters' : 'Return orders will appear here once customers submit return requests'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                returnOrders.map((returnOrder) => (
                  <tr key={returnOrder._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">{returnOrder.order_id}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700">{returnOrder.customer_email}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700">{returnOrder.total_items}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(returnOrder.status)}`}>
                        {returnOrder.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700">{formatDate(returnOrder.requestedAt)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewClick(returnOrder._id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.total_pages > 0 && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Items per page:</span>
                <div className="relative z-10">
                  <select
                    value={pagination.limit}
                    onChange={handleLimitChange}
                    className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-1.5 pr-8 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 min-w-[80px]"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total_count)} of {pagination.total_count} return orders
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm text-gray-700">
                  Page {pagination.page} of {pagination.total_pages}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.total_pages}
                  className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReturnOrderList;

