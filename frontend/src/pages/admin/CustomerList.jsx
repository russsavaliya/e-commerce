import React, { useEffect, useMemo, useState } from 'react';
import { Search, Users, Filter, RefreshCw, Phone, Mail, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { getCustomers } from '../../services/admin/customerService';
import { ROUTES } from '../../utils/constants';
import { useNavigate } from 'react-router-dom';

const formatDate = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
};

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [hasOrder, setHasOrder] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const navigate = useNavigate();

  const debouncedSearch = useMemo(() => search, [search]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await getCustomers({
          page,
          limit,
          search: debouncedSearch,
          has_order: hasOrder,
        });
        if (response.status) {
          setCustomers(response.data.customers || []);
          setTotalPages(response.data.total_pages || 1);
        } else {
          setError(response.message || 'Failed to fetch customers');
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch customers');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page, limit, debouncedSearch, hasOrder, refreshKey]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleHasOrderChange = (e) => {
    setHasOrder(e.target.value);
    setPage(1);
  };

  const renderOrderBadge = (count) => {
    if (count > 0) {
      return (
        <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-green-50 text-green-700 border border-green-100">
          {count} {count === 1 ? 'order' : 'orders'}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-yellow-50 text-yellow-700 border border-yellow-100">
        No orders yet
      </span>
    );
  };

  const renderPaymentStatus = (status) => {
    if (!status) return '—';
    const colorMap = {
      paid: 'bg-green-50 text-green-700 border-green-100',
      pending: 'bg-yellow-50 text-yellow-700 border-yellow-100',
      failed: 'bg-red-50 text-red-700 border-red-100',
      refunded: 'bg-blue-50 text-blue-700 border-blue-100',
    };
    const classes = colorMap[status] || 'bg-gray-50 text-gray-700 border-gray-100';
    return (
      <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border ${classes}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Users className="w-4 h-4" />
            <span>Customers</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Customer List</h1>
          <p className="text-sm text-gray-600">Track addresses and who has placed orders.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setRefreshKey((k) => k + 1)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-1/2">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search by name, email, or phone"
            className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={hasOrder}
            onChange={handleHasOrderChange}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="">All customers</option>
            <option value="true">With orders</option>
            <option value="false">No orders</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Address</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Orders</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Last Payment</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Last Order Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {!loading && customers.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-6 text-center text-sm text-gray-500">
                    No customers found
                  </td>
                </tr>
              )}

              {loading && (
                <tr>
                  <td colSpan="5" className="px-6 py-6 text-center text-sm text-gray-500">
                    Loading customers...
                  </td>
                </tr>
              )}

              {!loading && customers.map((customer) => (
                <tr key={customer._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-gray-900">{customer.name || '—'}</div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span>{customer.email || '—'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{customer.phone || customer.shipping_address?.phone || '—'}</span>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="space-y-1 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span>{customer.shipping_address?.address || '—'}</span>
                      </div>
                      <div className="text-xs text-gray-600">
                        {customer.shipping_address?.city || '—'}, {customer.shipping_address?.state || '—'} {customer.shipping_address?.pincode ? `- ${customer.shipping_address.pincode}` : ''}
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">{renderOrderBadge(customer.order_count || 0)}</td>

                  <td className="px-6 py-4">{renderPaymentStatus(customer.last_payment_status)}</td>

                  <td className="px-6 py-4 text-sm text-gray-700">{formatDate(customer.last_order_date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-3 bg-gray-50 border-t border-gray-100">
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
              Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg disabled:opacity-50"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}
    </div>
  );
};

export default CustomerList;

