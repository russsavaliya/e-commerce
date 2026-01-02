import React, { useState, useEffect, useRef } from 'react';
import { Truck, Loader2, Search, ChevronLeft, ChevronRight, Filter, ChevronDown, ExternalLink, Plus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getAllShipments, createShipment } from '../../services/admin/shipmentService';
import { getAcceptedOrders } from '../../services/admin/orderService';

const getShipmentStatusColor = (status) => {
  const colors = {
    created: 'bg-blue-100 text-blue-800',
    pickup_scheduled: 'bg-purple-100 text-purple-800',
    picked_up: 'bg-indigo-100 text-indigo-800',
    in_transit: 'bg-yellow-100 text-yellow-800',
    out_for_delivery: 'bg-orange-100 text-orange-800',
    delivered: 'bg-green-100 text-green-800',
    rto: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800',
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
    hour: '2-digit',
    minute: '2-digit',
  });
};

const ShipmentList = () => {
  const navigate = useNavigate();
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total_count: 0,
    total_pages: 0,
  });

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [shipmentStatusFilter, setShipmentStatusFilter] = useState('');

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [acceptedOrders, setAcceptedOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [formData, setFormData] = useState({
    orderId: '',
    weight: '',
    length: '',
    breadth: '',
    height: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [orderDropdownOpen, setOrderDropdownOpen] = useState(false);
  const [orderSearchTerm, setOrderSearchTerm] = useState('');

  // Refs
  const searchTimeoutRef = useRef(null);
  const orderDropdownRef = useRef(null);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      const response = await getAllShipments(
        pagination.page,
        pagination.limit,
        searchTerm,
        shipmentStatusFilter
      );

      if (response.status && response.data) {
        setShipments(response.data.shipments || []);
        setPagination({
          page: response.data.page || 1,
          limit: response.data.limit || 10,
          total_count: response.data.total_count || 0,
          total_pages: response.data.total_pages || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching shipments:', error);
      toast.error(error.message || 'Failed to fetch shipments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, [pagination.page, shipmentStatusFilter]);

  // Close order dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (orderDropdownRef.current && !orderDropdownRef.current.contains(event.target)) {
        setOrderDropdownOpen(false);
        setOrderSearchTerm('');
      }
    };

    if (orderDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [orderDropdownOpen]);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      if (pagination.page === 1) {
        fetchShipments();
      } else {
        setPagination((prev) => ({ ...prev, page: 1 }));
      }
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.total_pages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  const handleShipmentStatusFilterChange = (e) => {
    setShipmentStatusFilter(e.target.value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setShipmentStatusFilter('');
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleOrderClick = (orderId) => {
    navigate(`/admin/orders/${orderId}`);
  };

  const handleShipmentClick = (shipmentId) => {
    navigate(`/admin/shipments/${shipmentId}`);
  };

  // Fetch accepted orders for dropdown
  const fetchAcceptedOrders = async () => {
    try {
      setLoadingOrders(true);
      const response = await getAcceptedOrders();
      if (response.status && response.data) {
        setAcceptedOrders(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching accepted orders:', error);
      toast.error(error.message || 'Failed to fetch accepted orders');
    } finally {
      setLoadingOrders(false);
    }
  };

  // Open create shipment modal
  const handleOpenCreateModal = () => {
    setShowCreateModal(true);
    fetchAcceptedOrders();
    setFormData({
      orderId: '',
      weight: '',
      length: '',
      breadth: '',
      height: '',
    });
    setOrderDropdownOpen(false);
    setOrderSearchTerm('');
  };

  // Close create shipment modal
  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setFormData({
      orderId: '',
      weight: '',
      length: '',
      breadth: '',
      height: '',
    });
    setOrderDropdownOpen(false);
    setOrderSearchTerm('');
  };

  // Filter orders based on search term
  const filteredOrders = acceptedOrders.filter((order) => {
    const searchLower = orderSearchTerm.toLowerCase();
    const orderId = order.order_id?.toLowerCase() || '';
    const customerName = order.shipping_address?.fullName?.toLowerCase() || '';
    const email = order.shipping_address?.email?.toLowerCase() || '';
    return orderId.includes(searchLower) || customerName.includes(searchLower) || email.includes(searchLower);
  });

  // Get selected order display text
  const getSelectedOrderText = () => {
    if (!formData.orderId) return 'Select an order';
    const selectedOrder = acceptedOrders.find((o) => o.order_id === formData.orderId);
    if (selectedOrder) {
      return `${selectedOrder.order_id} - ${selectedOrder.shipping_address?.fullName || 'N/A'} (₹${selectedOrder.total_amount?.toLocaleString('en-IN') || '0'})`;
    }
    return 'Select an order';
  };

  // Handle order selection
  const handleOrderSelect = (orderId) => {
    setFormData((prev) => ({ ...prev, orderId }));
    setOrderDropdownOpen(false);
    setOrderSearchTerm('');
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submit
  const handleCreateShipment = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.orderId) {
      toast.error('Please select an order');
      return;
    }

    if (!formData.weight || !formData.length || !formData.breadth || !formData.height) {
      toast.error('Please fill all dimension fields');
      return;
    }

    const weight = parseFloat(formData.weight);
    const length = parseFloat(formData.length);
    const breadth = parseFloat(formData.breadth);
    const height = parseFloat(formData.height);

    if (isNaN(weight) || weight <= 0) {
      toast.error('Weight must be a positive number');
      return;
    }

    if (isNaN(length) || length <= 0) {
      toast.error('Length must be a positive number');
      return;
    }

    if (isNaN(breadth) || breadth <= 0) {
      toast.error('Breadth must be a positive number');
      return;
    }

    if (isNaN(height) || height <= 0) {
      toast.error('Height must be a positive number');
      return;
    }

    try {
      setSubmitting(true);
      const response = await createShipment(formData.orderId, {
        weight,
        length,
        breadth,
        height,
      });

      if (response.status) {
        toast.success(response.message || 'Shipment created successfully');
        handleCloseCreateModal();
        fetchShipments(); // Refresh the list
      }
    } catch (error) {
      console.error('Error creating shipment:', error);
      toast.error(error.message || 'Failed to create shipment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Truck className="w-7 h-7 text-indigo-600" />
              Shipment Management
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage and track all shipments
            </p>
          </div>
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Create Shipment
          </button>
        </div>

        {/* Search and Filters */}
        <div className="mt-6 space-y-4">
          {/* Search Bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by AWB Code or Shiprocket Order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <label className="text-sm text-gray-700 font-semibold">Filters:</label>
            </div>
            <div className="relative z-10">
              <select
                value={shipmentStatusFilter}
                onChange={handleShipmentStatusFilterChange}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-3.5 py-2 pr-8 text-sm text-gray-700 cursor-pointer hover:border-gray-400 transition-all min-w-[180px]"
              >
                <option value="">All Shipment Status</option>
                <option value="created">Created</option>
                <option value="pickup_scheduled">Pickup Scheduled</option>
                <option value="picked_up">Picked Up</option>
                <option value="in_transit">In Transit</option>
                <option value="out_for_delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
                <option value="rto">RTO</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {(searchTerm || shipmentStatusFilter) && (
              <button
                onClick={clearFilters}
                className="px-3.5 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors border border-gray-300"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Shipments Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
            <span className="text-lg font-medium text-gray-700">Loading shipments...</span>
          </div>
        ) : shipments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Truck className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">No shipments found</p>
            <p className="text-sm text-gray-500">
              {searchTerm || shipmentStatusFilter
                ? 'Try adjusting your filters'
                : 'Shipments will appear here once orders are moved to shipment status'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Shipment ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Shiprocket Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      AWB Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Courier
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Created At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {shipments.map((shipment) => (
                    <tr
                      key={shipment._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div 
                          className="text-sm font-medium text-indigo-600 hover:text-indigo-800 cursor-pointer"
                          onClick={() => handleShipmentClick(shipment._id)}
                        >
                          {shipment._id?.substring(0, 8) || 'N/A'}...
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {shipment.shiprocket_order_id || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {shipment.awb_code || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {shipment.courier_name || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2.5 py-1 text-xs font-bold rounded-full ${getShipmentStatusColor(
                            shipment.shipment_status
                          )}`}
                        >
                          {shipment.shipment_status || 'created'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div 
                          className="text-sm font-medium text-indigo-600 hover:text-indigo-800 cursor-pointer"
                          onClick={() => {
                            if (shipment.order_details?.order_id) {
                              handleOrderClick(shipment.order_details.order_id);
                            }
                          }}
                        >
                          {shipment.order_details?.order_id || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {formatDate(shipment.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {shipment.tracking_url ? (
                          <a
                            href={shipment.tracking_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
                          >
                            Track
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-xs text-gray-400">No tracking</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.total_pages > 1 && (
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing{' '}
                  <span className="font-semibold">
                    {(pagination.page - 1) * pagination.limit + 1}
                  </span>{' '}
                  to{' '}
                  <span className="font-semibold">
                    {Math.min(pagination.page * pagination.limit, pagination.total_count)}
                  </span>{' '}
                  of <span className="font-semibold">{pagination.total_count}</span> shipments
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-gray-700 px-3">
                    Page {pagination.page} of {pagination.total_pages}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.total_pages}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Shipment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className="bg-white rounded-lg shadow-2xl p-6 border border-gray-200 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Create New Shipment
              </h2>
              <button
                onClick={handleCloseCreateModal}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleCreateShipment} className="space-y-4">
              {/* Order ID Dropdown - Searchable */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order ID <span className="text-red-500">*</span>
                </label>
                {loadingOrders ? (
                  <div className="flex items-center justify-center py-3 border border-gray-300 rounded-lg">
                    <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                  </div>
                ) : (
                  <div ref={orderDropdownRef} className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        if (acceptedOrders.length > 0) {
                          setOrderDropdownOpen(!orderDropdownOpen);
                          setOrderSearchTerm('');
                        }
                      }}
                      className={`w-full px-3.5 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all flex items-center justify-between ${
                        !formData.orderId ? 'text-gray-500' : 'text-gray-900'
                      } ${
                        acceptedOrders.length === 0
                          ? 'bg-gray-100 cursor-not-allowed border-gray-300'
                          : 'bg-white cursor-pointer border-gray-300 hover:border-gray-400'
                      }`}
                      disabled={acceptedOrders.length === 0}
                    >
                      <span className="truncate">{getSelectedOrderText()}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-gray-400 transition-transform ${
                          orderDropdownOpen ? 'transform rotate-180' : ''
                        }`}
                      />
                    </button>

                    {orderDropdownOpen && acceptedOrders.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-hidden">
                        {/* Search Input */}
                        <div className="p-2 border-b border-gray-200">
                          <div className="relative">
                            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              placeholder="Search by Order ID, Customer Name, or Email..."
                              value={orderSearchTerm}
                              onChange={(e) => setOrderSearchTerm(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                              autoFocus
                            />
                          </div>
                        </div>

                        {/* Order List */}
                        <div className="max-h-48 overflow-y-auto">
                          {filteredOrders.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-gray-500 text-center">
                              No orders found
                            </div>
                          ) : (
                            filteredOrders.map((order) => (
                              <button
                                key={order._id}
                                type="button"
                                onClick={() => handleOrderSelect(order.order_id)}
                                className={`w-full px-4 py-2.5 text-left text-sm hover:bg-indigo-50 transition-colors ${
                                  formData.orderId === order.order_id
                                    ? 'bg-indigo-100 text-indigo-900'
                                    : 'text-gray-900'
                                }`}
                              >
                                <div className="font-medium">{order.order_id}</div>
                                <div className="text-xs text-gray-600 mt-0.5">
                                  {order.shipping_address?.fullName || 'N/A'} • ₹
                                  {order.total_amount?.toLocaleString('en-IN') || '0'}
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {acceptedOrders.length === 0 && !loadingOrders && (
                  <p className="text-xs text-gray-500 mt-1">
                    Only orders with status "accepted" that don't have shipments yet are shown
                  </p>
                )}
              </div>

              {/* Weight */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weight (kg) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  required
                  min="0.01"
                  step="0.01"
                  placeholder="e.g., 0.5"
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>

              {/* Dimensions Row */}
              <div className="grid grid-cols-3 gap-4">
                {/* Length */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Length (cm) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="length"
                    value={formData.length}
                    onChange={handleInputChange}
                    required
                    min="1"
                    step="0.1"
                    placeholder="e.g., 10"
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>

                {/* Breadth */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Breadth (cm) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="breadth"
                    value={formData.breadth}
                    onChange={handleInputChange}
                    required
                    min="1"
                    step="0.1"
                    placeholder="e.g., 10"
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>

                {/* Height */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Height (cm) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleInputChange}
                    required
                    min="1"
                    step="0.1"
                    placeholder="e.g., 10"
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseCreateModal}
                  disabled={submitting}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Shipment'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShipmentList;
