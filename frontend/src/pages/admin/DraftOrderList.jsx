import React, { useState, useEffect, useRef } from 'react';
import { FileText, Loader2, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { Select } from 'antd';
import { getDraftOrdersList } from '../../services/admin/draftOrderService';
import { useDebounce } from '../../hooks/useDebounce';
import Pagination from '../../components/admin/Pagination';

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

const getStatusColor = (status) => {
  const colors = {
    'in_progress': 'bg-yellow-50 text-yellow-700 border-yellow-200',
    'converted': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };
  return colors[status] || 'bg-gray-50 text-gray-700 border-gray-200';
};

const getStepColor = (step) => {
  const colors = {
    'address': 'bg-blue-50 text-blue-700 border-blue-200',
    'payment': 'bg-purple-50 text-purple-700 border-purple-200',
  };
  return colors[step] || 'bg-gray-50 text-gray-700 border-gray-200';
};

const DRAFT_STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'converted', label: 'Converted' },
];

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

  // Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const fetchDraftOrders = async (page = pagination.page) => {
    if (!isMounted.current) return;

    try {
      setLoading(true);
      const response = await getDraftOrdersList({
        page,
        limit: pagination.limit,
        status: statusFilter,
        search: debouncedSearchTerm,
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
        setPagination(prev => ({ ...prev, total_count: 0, total_pages: 0 }));
      }
    } catch (error) {
      console.error('Error fetching draft orders:', error);
      if (isMounted.current) {
        toast.error(error.message || 'Failed to fetch draft orders');
        setDraftOrders([]);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchDraftOrders(1);
  }, [debouncedSearchTerm, statusFilter]);

  useEffect(() => {
    fetchDraftOrders();
  }, [pagination.page, pagination.limit]);

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

  if (loading && draftOrders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-green-600 mb-4" />
        <span className="text-lg font-medium text-gray-700">Loading draft orders...</span>
        <span className="text-sm text-gray-500 mt-2">Please wait while we fetch the data</span>
      </div>
    );
  }

  const hasActiveFilters = statusFilter || searchTerm;

  return (
    <div className="space-y-5">
      {/* Top Box - Header, Search & Filters */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm w-full">
        <div className="p-5 lg:p-6 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Draft Orders</h1>
          </div>

          {/* Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1 min-w-[250px] sm:min-w-[300px]">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by email, name, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 bg-white hover:border-gray-400"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder="All Status"
              className="min-w-[180px]"
              options={DRAFT_STATUS_OPTIONS}
            />
            {hasActiveFilters && (
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

      {/* Bottom Box - Only Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden w-full">
        {draftOrders.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-base font-semibold text-gray-700 mb-1.5">No draft orders found</p>
            <p className="text-sm text-gray-500">
              {hasActiveFilters
                ? 'Try adjusting your filters'
                : 'Draft orders will appear here when users start checkout'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1200px]">
                <thead className="bg-gradient-to-r from-green-50 to-emerald-50/50">
                  <tr>
                    {['Email', 'Customer Name', 'Phone', 'Items', 'Total Amount', 'Step', 'Status', 'Created At'].map((header) => (
                      <th key={header} className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {draftOrders.map((draftOrder) => (
                    <tr key={draftOrder._id} className="hover:bg-green-50/30 transition-all duration-200">
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">{draftOrder.email}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700">{draftOrder.customer_name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700">{draftOrder.customer_phone}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700">{draftOrder.cart_items_count} item{draftOrder.cart_items_count !== 1 ? 's' : ''}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-900">₹{draftOrder.total_amount?.toLocaleString('en-IN') || '0'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full border ${getStepColor(draftOrder.step)}`}>
                          {draftOrder.step}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusColor(draftOrder.status)}`}>
                          {draftOrder.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{formatDate(draftOrder.createdAt)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

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

export default DraftOrderList;
