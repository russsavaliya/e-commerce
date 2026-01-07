import React, { useState, useEffect, useRef } from 'react';
import { FileText, Loader2, ChevronLeft, ChevronRight, ChevronDown, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { getDraftOrdersList } from '../../services/admin/draftOrderService';

const getStatusColor = (status) => {
  const colors = {
    'in_progress': 'bg-yellow-100 text-yellow-800',
    'converted': 'bg-green-100 text-green-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

const getStepColor = (step) => {
  const colors = {
    'address': 'bg-blue-100 text-blue-800',
    'payment': 'bg-purple-100 text-purple-800',
  };
  return colors[step] || 'bg-gray-100 text-gray-800';
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

const DraftOrderList = () => {
  const [draftOrders, setDraftOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total_count: 0,
    total_pages: 0,
  });

  // Filter states
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Refs
  const isMounted = useRef(true);
  const statusFilterRef = useRef(null);
  const hasInitialized = useRef(false);
  const isFilterChanging = useRef(false);
  const isInitialPaginationUpdate = useRef(false);
  const prevStatusFilter = useRef(statusFilter);
  const prevSearchTerm = useRef(searchTerm);
  const [statusFilterOpen, setStatusFilterOpen] = useState(false);
  const searchTimeoutRef = useRef(null);

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
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Initial fetch on mount only
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      isInitialPaginationUpdate.current = true;
      fetchDraftOrders(1);
    }
  }, []);

  // Fetch when status filter changes (skip initial mount)
  useEffect(() => {
    if (!hasInitialized.current) {
      prevStatusFilter.current = statusFilter;
      return;
    }

    if (prevStatusFilter.current === statusFilter) {
      return;
    }

    prevStatusFilter.current = statusFilter;
    isFilterChanging.current = true;
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchDraftOrders(1);
    setTimeout(() => {
      isFilterChanging.current = false;
    }, 100);
  }, [statusFilter]);

  // Fetch when search term changes (debounced)
  useEffect(() => {
    if (!hasInitialized.current) {
      prevSearchTerm.current = searchTerm;
      return;
    }

    if (prevSearchTerm.current === searchTerm) {
      return;
    }

    prevSearchTerm.current = searchTerm;
    isFilterChanging.current = true;
    setPagination(prev => ({ ...prev, page: 1 }));

    // Debounce search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      fetchDraftOrders(1);
      setTimeout(() => {
        isFilterChanging.current = false;
      }, 100);
    }, 500);
  }, [searchTerm]);

  // Fetch when page or limit changes
  useEffect(() => {
    if (!hasInitialized.current) return;
    if (isFilterChanging.current) return;
    if (isInitialPaginationUpdate.current) {
      isInitialPaginationUpdate.current = false;
      return;
    }
    fetchDraftOrders(pagination.page);
  }, [pagination.page, pagination.limit]);

  const fetchDraftOrders = async (page) => {
    if (!isMounted.current) return;

    try {
      setLoading(true);

      const response = await getDraftOrdersList({
        page,
        limit: pagination.limit,
        status: statusFilter,
        search: searchTerm,
      });

      if (!isMounted.current) return;

      if (response.status && response.data) {
        setDraftOrders(response.data.draftOrders || []);
        setPagination(prev => ({
          ...prev,
          page: response.data.page || page,
          limit: response.data.limit || pagination.limit,
          total_count: response.data.total_count || 0,
          total_pages: response.data.total_pages || 0,
        }));
      } else {
        setDraftOrders([]);
        setPagination(prev => ({
          ...prev,
          total_count: 0,
          total_pages: 0,
        }));
      }
    } catch (error) {
      console.error('Error fetching draft orders:', error);
      toast.error(error.message || 'Failed to fetch draft orders');
      setDraftOrders([]);
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    setStatusFilterOpen(false);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.total_pages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const handleLimitChange = (e) => {
    const newLimit = parseInt(e.target.value, 10);
    setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }));
  };

  const clearFilters = () => {
    setStatusFilter('');
    setSearchTerm('');
  };

  if (loading && !hasInitialized.current) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-green-600 mb-4" />
        <span className="text-lg font-medium text-gray-700">Loading draft orders...</span>
        <span className="text-sm text-gray-500 mt-2">Please wait while we fetch the data</span>
      </div>
    );
  }

  return (
    <div className="w-full space-y-5">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-gray-900">
          Draft Orders
        </h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-4 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by email, name, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                />
              </div>
            </div>

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
                    onClick={() => handleStatusFilterChange('in_progress')}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${statusFilter === 'in_progress' ? 'bg-gray-50 font-medium' : 'text-gray-700'}`}
                  >
                    In Progress
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusFilterChange('converted')}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${statusFilter === 'converted' ? 'bg-gray-50 font-medium' : 'text-gray-700'}`}
                  >
                    Converted
                  </button>
                </div>
              )}
            </div>

            {/* Clear Filters & Refresh */}
            <div className="flex items-center gap-2">
              {(statusFilter || searchTerm) && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200"
                >
                  Clear Filters
                </button>
              )}
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
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Customer Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Total Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Step
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Created At
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {draftOrders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <FileText className="w-12 h-12 text-gray-400 mb-4" />
                      <p className="text-sm font-medium text-gray-900">No draft orders found</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {statusFilter || searchTerm ? 'Try adjusting your filters' : 'Draft orders will appear here when users start checkout'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                draftOrders.map((draftOrder) => (
                  <tr key={draftOrder._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{draftOrder.email}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700">{draftOrder.customer_name}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700">{draftOrder.customer_phone}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700">{draftOrder.cart_items_count} item{draftOrder.cart_items_count !== 1 ? 's' : ''}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">₹{draftOrder.total_amount?.toLocaleString('en-IN') || '0'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStepColor(draftOrder.step)}`}>
                        {draftOrder.step}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(draftOrder.status)}`}>
                        {draftOrder.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700">{formatDate(draftOrder.createdAt)}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination.total_pages > 1 && !loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Items per page selector */}
            <div className="flex items-center gap-2 relative z-10">
              <label className="text-sm text-gray-700">Items per page:</label>
              <div className="relative">
                <select
                  value={pagination.limit}
                  onChange={handleLimitChange}
                  className="appearance-none bg-white border border-gray-300 rounded px-2 py-1 pr-8 text-sm text-gray-700 cursor-pointer hover:border-gray-400 transition-all"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Page info */}
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(pagination.page * pagination.limit, pagination.total_count)}
              </span>{' '}
              of <span className="font-medium">{pagination.total_count}</span> draft orders
            </div>

            {/* Pagination buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Page numbers */}
              <div className="flex items-center gap-1">
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
                      className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${pagination.page === pageNum
                        ? 'bg-green-600 text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
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
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DraftOrderList;

