import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Loader2,
    ChevronLeft,
    ChevronDown,
    RefreshCw,
    Package,
    MapPin,
    Calendar,
    User,
    Phone,
    Mail,
    FileText,
    Truck,
    CheckCircle2,
    Clock,
    AlertCircle,
    X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getReturnOrderOne, updateReturnOrderStatus, createShiprocketReturn, getShipmentDetails } from '../../services/admin/returnOrderService';
import { API_BASE_URL } from '../../utils/constants';

const getStatusColor = (status) => {
    const colors = {
        'Return Requested': 'bg-yellow-100 text-yellow-800 border-yellow-200',
        'Pickup Scheduled': 'bg-blue-100 text-blue-800 border-blue-200',
        'Picked': 'bg-purple-100 text-purple-800 border-purple-200',
        'Refunded': 'bg-green-100 text-green-800 border-green-200',
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

const ReturnOrderDetail = () => {
    const { returnOrderId } = useParams();
    const navigate = useNavigate();
    const [returnOrder, setReturnOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [creatingShiprocketReturn, setCreatingShiprocketReturn] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [showShiprocketModal, setShowShiprocketModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState('');
    const [shipmentDetails, setShipmentDetails] = useState({
        length: '',
        breadth: '',
        height: '',
        weight: '',
    });
    const [returnType, setReturnType] = useState('exchange');
    const [loadingShipmentDetails, setLoadingShipmentDetails] = useState(false);
    const statusDropdownRef = useRef(null);
    const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

    useEffect(() => {
        const fetchReturnOrderDetail = async () => {
            try {
                setLoading(true);
                setError('');
                const response = await getReturnOrderOne(returnOrderId);

                if (response.status && response.data) {
                    setReturnOrder(response.data);
                } else {
                    setError('Return order not found');
                }
            } catch (err) {
                console.error('Error fetching return order:', err);
                setError(err.message || 'Failed to load return order');
                toast.error(err.message || 'Failed to load return order');
            } finally {
                setLoading(false);
            }
        };

        if (returnOrderId) {
            fetchReturnOrderDetail();
        }
    }, [returnOrderId]);

    // Close status dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                statusDropdownRef.current &&
                !statusDropdownRef.current.contains(event.target)
            ) {
                setStatusDropdownOpen(false);
            }
        };

        if (statusDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [statusDropdownOpen]);

    const handleStatusUpdate = async () => {
        if (!returnOrder || !selectedStatus || updatingStatus) return;

        try {
            setUpdatingStatus(true);
            const response = await updateReturnOrderStatus({
                returnOrderId: returnOrder._id,
                status: selectedStatus,
            });

            if (response.status) {
                setReturnOrder(prev => ({
                    ...prev,
                    return_details: {
                        ...prev.return_details,
                        status: selectedStatus,
                        updatedAt: response.data.updatedAt,
                    },
                }));
                toast.success(`Return order status updated to ${selectedStatus}`);
                setShowStatusModal(false);
                setSelectedStatus('');
            }
        } catch (err) {
            console.error('Error updating return order status:', err);
            toast.error(err.message || 'Failed to update return order status');
        } finally {
            setUpdatingStatus(false);
        }
    };

    const openStatusModal = (status) => {
        setSelectedStatus(status);
        setShowStatusModal(true);
    };

    /**
     * Open Shiprocket return modal and fetch shipment details
     */
    const handleOpenShiprocketModal = async () => {
        if (!returnOrder) return;

        // Check if Shiprocket return already exists
        if (returnOrder.return_details.shiprocket_return_id) {
            toast.error('Shiprocket return order already exists for this return request');
            return;
        }

        try {
            setLoadingShipmentDetails(true);
            const response = await getShipmentDetails(returnOrder._id);

            if (response.status && response.data) {
                setShipmentDetails({
                    length: response.data.length || '',
                    breadth: response.data.breadth || '',
                    height: response.data.height || '',
                    weight: response.data.weight || '',
                });
                setShowShiprocketModal(true);
            }
        } catch (err) {
            console.error('Error fetching shipment details:', err);
            toast.error(err.message || 'Failed to fetch shipment details');
        } finally {
            setLoadingShipmentDetails(false);
        }
    };

    /**
     * Handle form submission - show confirmation modal
     */
    const handleShiprocketFormSubmit = (e) => {
        e.preventDefault();
        setShowConfirmModal(true);
    };

    /**
     * Handle Shiprocket return order creation after confirmation
     */
    const handleCreateShiprocketReturn = async () => {
        if (!returnOrder || creatingShiprocketReturn) return;

        try {
            setCreatingShiprocketReturn(true);
            setShowConfirmModal(false);
            setShowShiprocketModal(false);

            const response = await createShiprocketReturn({
                returnOrderId: returnOrder._id,
                length: shipmentDetails.length,
                breadth: shipmentDetails.breadth,
                height: shipmentDetails.height,
                weight: shipmentDetails.weight,
                return_type: returnType,
            });

            if (response.status) {
                // Refresh return order data to get updated Shiprocket return ID
                const updatedResponse = await getReturnOrderOne(returnOrderId);
                if (updatedResponse.status && updatedResponse.data) {
                    setReturnOrder(updatedResponse.data);
                }

                toast.success(
                    response.message || 'Shiprocket return order created successfully. Pickup has been scheduled.'
                );

                // Reset form
                setShipmentDetails({ length: '', breadth: '', height: '', weight: '' });
                setReturnType('exchange');
            }
        } catch (err) {
            console.error('Error creating Shiprocket return order:', err);
            toast.error(err.message || 'Failed to create Shiprocket return order');
            // Reopen modal on error
            setShowShiprocketModal(true);
        } finally {
            setCreatingShiprocketReturn(false);
        }
    };

    const getStatusOptions = () => {
        const currentStatus = returnOrder?.return_details?.status;
        const allStatuses = ['Return Requested', 'Pickup Scheduled', 'Picked', 'Refunded'];
        const currentIndex = allStatuses.indexOf(currentStatus);
        return allStatuses.filter((_, index) => index >= currentIndex);
    };

    const getTimelineSteps = () => {
        if (!returnOrder) return [];
        const status = returnOrder.return_details.status;
        const steps = [
            { status: 'Return Requested', icon: Clock, date: returnOrder.return_details.requestedAt },
            { status: 'Pickup Scheduled', icon: Calendar },
            { status: 'Picked', icon: Package },
            { status: 'Refunded', icon: CheckCircle2 },
        ];

        const statusOrder = ['Return Requested', 'Pickup Scheduled', 'Picked', 'Refunded'];
        const currentIndex = statusOrder.indexOf(status);

        return steps.map((step, index) => ({
            ...step,
            completed: index <= currentIndex,
            current: index === currentIndex,
        }));
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 min-h-[400px]">
                <Loader2 className="w-10 h-10 animate-spin text-green-600 mb-4" />
                <span className="text-lg font-medium text-gray-700">Loading return order details...</span>
            </div>
        );
    }

    if (error || !returnOrder) {
        return (
            <div className="flex flex-col items-center justify-center py-20 min-h-[400px]">
                <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                <p className="text-lg font-medium text-gray-900">{error || 'Return order not found'}</p>
                <button
                    onClick={() => navigate('/admin/return-orders')}
                    className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                    Back to Return Orders
                </button>
            </div>
        );
    }

    return (
        <div className="w-full space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin/return-orders')}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Return Order Details</h1>
                        <p className="text-sm text-gray-500 mt-1">Order ID: {returnOrder.order.order_id}</p>
                    </div>
                </div>

                {/* Status Update Dropdown */}
                <div className="relative" ref={statusDropdownRef}>
                    <button
                        type="button"
                        onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200"
                    >
                        Update Status
                        <ChevronDown className={`w-4 h-4 transition-transform ${statusDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {statusDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-56 rounded-lg bg-white border border-gray-200 shadow-lg focus:outline-none z-10 overflow-hidden">
                            {getStatusOptions().map((status) => (
                                <button
                                    key={status}
                                    type="button"
                                    onClick={() => {
                                        setStatusDropdownOpen(false);
                                        openStatusModal(status);
                                    }}
                                    disabled={status === returnOrder.return_details.status}
                                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${status === returnOrder.return_details.status
                                        ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                                        : 'text-gray-700'
                                        }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Status Timeline */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Return Status Timeline</h2>
                <div className="flex items-center justify-between">
                    {getTimelineSteps().map((step, index) => (
                        <div key={step.status} className="flex-1 flex items-center">
                            <div className="flex flex-col items-center flex-1">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step.completed
                                        ? 'bg-green-100 border-green-500 text-green-600'
                                        : 'bg-gray-100 border-gray-300 text-gray-400'
                                        }`}
                                >
                                    <step.icon className="w-5 h-5" />
                                </div>
                                <p className={`text-xs font-medium mt-2 ${step.completed ? 'text-gray-900' : 'text-gray-400'}`}>
                                    {step.status}
                                </p>
                                {step.date && (
                                    <p className="text-xs text-gray-500 mt-1">{formatDate(step.date)}</p>
                                )}
                            </div>
                            {index < getTimelineSteps().length - 1 && (
                                <div
                                    className={`h-0.5 flex-1 mx-2 ${step.completed ? 'bg-green-500' : 'bg-gray-300'}`}
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Left Column - Order & Customer Info */}
                <div className="lg:col-span-2 space-y-5">
                    {/* Order Information */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Package className="w-5 h-5" />
                            Order Information
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Order ID</p>
                                <p className="text-sm font-medium text-gray-900 mt-1">{returnOrder.order.order_id}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Order Date</p>
                                <p className="text-sm font-medium text-gray-900 mt-1">{formatDate(returnOrder.order.created_at)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Total Amount</p>
                                <p className="text-sm font-medium text-gray-900 mt-1">₹{returnOrder.order.total_amount?.toLocaleString('en-IN')}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Payment Method</p>
                                <p className="text-sm font-medium text-gray-900 mt-1 capitalize">{returnOrder.order.payment_method}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Payment Status</p>
                                <p className="text-sm font-medium text-gray-900 mt-1 capitalize">{returnOrder.order.payment_status}</p>
                            </div>
                            {returnOrder.delivery_info.delivery_date && (
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Delivery Date</p>
                                    <p className="text-sm font-medium text-gray-900 mt-1">{formatDate(returnOrder.delivery_info.delivery_date)}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Customer Information */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <User className="w-5 h-5" />
                            Customer Information
                        </h2>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <User className="w-4 h-4 text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-500">Full Name</p>
                                    <p className="text-sm font-medium text-gray-900">{returnOrder.customer.fullName}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Mail className="w-4 h-4 text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-500">Email</p>
                                    <p className="text-sm font-medium text-gray-900">{returnOrder.customer.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="w-4 h-4 text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-500">Phone</p>
                                    <p className="text-sm font-medium text-gray-900">{returnOrder.customer.phone}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                                <div>
                                    <p className="text-xs text-gray-500">Address</p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {returnOrder.customer.address}, {returnOrder.customer.city}, {returnOrder.customer.state} - {returnOrder.customer.pincode}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Products to Return */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Package className="w-5 h-5" />
                            Products to Return
                        </h2>
                        <div className="space-y-4">
                            {returnOrder.products.map((product, index) => (
                                <div key={index} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg">
                                    <div className="w-20 h-24 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0 border border-gray-200">
                                        {product.image ? (
                                            <img
                                                src={normalizeImagePath(product.image)}
                                                alt={product.product_name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'flex';
                                                }}
                                            />
                                        ) : null}
                                        <div className={`w-full h-full flex items-center justify-center ${product.image ? 'hidden' : ''}`}>
                                            <Package className="w-8 h-8 text-gray-400" />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900">{product.product_name}</p>
                                        {product.variant_name && (
                                            <p className="text-xs text-gray-500 mt-1">Variant: {product.variant_name}</p>
                                        )}
                                        <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                                            <span>Quantity: {product.quantity}</span>
                                            <span>Unit Price: ₹{product.unit_price?.toLocaleString('en-IN')}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column - Return Details */}
                <div className="space-y-5">
                    {/* Return Status */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <RefreshCw className="w-5 h-5" />
                            Return Details
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Current Status</p>
                                <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border ${getStatusColor(returnOrder.return_details.status)}`}>
                                    {returnOrder.return_details.status}
                                </span>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Requested Date</p>
                                <p className="text-sm font-medium text-gray-900 mt-1">{formatDate(returnOrder.return_details.requestedAt)}</p>
                            </div>
                            {returnOrder.return_details.shiprocket_return_id && (
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Shiprocket Return ID</p>
                                    <p className="text-sm font-medium text-gray-900 mt-1">{returnOrder.return_details.shiprocket_return_id}</p>
                                </div>
                            )}
                            {returnOrder.delivery_info.return_window_end && (
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Return Window Ends</p>
                                    <p className="text-sm font-medium text-gray-900 mt-1">{formatDate(returnOrder.delivery_info.return_window_end)}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Return Reason */}
                    {returnOrder.return_details.reason && (
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                Return Reason
                            </h2>
                            <p className="text-sm text-gray-700">{returnOrder.return_details.reason}</p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
                        <div className="space-y-3">
                            {/* Shiprocket Return Button */}
                            {returnOrder.return_details.shiprocket_return_id ? (
                                <div className="w-full px-4 py-2.5 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="flex items-center gap-2 text-sm">
                                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                                        <span className="text-green-800 font-medium">Shiprocket Return Created</span>
                                    </div>
                                    <p className="text-xs text-green-700 mt-1">
                                        Return ID: {returnOrder.return_details.shiprocket_return_id}
                                    </p>
                                </div>
                            ) : (
                                <button
                                    onClick={handleOpenShiprocketModal}
                                    disabled={loadingShipmentDetails || returnOrder.return_details.status === 'Refunded'}
                                    className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loadingShipmentDetails ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Loading...
                                        </>
                                    ) : (
                                        <>
                                            <Truck className="w-4 h-4" />
                                            Create Shiprocket Return
                                        </>
                                    )}
                                </button>
                            )}
                            <button
                                onClick={() => navigate(`/admin/orders/${returnOrder.order.order_id}`)}
                                className="w-full px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                            >
                                View Original Order
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Shiprocket Return Modal */}
            {showShiprocketModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-semibold text-gray-900">Create Shiprocket Return</h3>
                                <button
                                    onClick={() => {
                                        setShowShiprocketModal(false);
                                        setShipmentDetails({ length: '', breadth: '', height: '', weight: '' });
                                        setReturnType('exchange');
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleShiprocketFormSubmit} className="space-y-4">
                                {/* Return Type */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Return Type <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={returnType}
                                            onChange={(e) => setReturnType(e.target.value)}
                                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white cursor-pointer"
                                            required
                                        >
                                            <option value="exchange">Exchange</option>
                                            <option value="refund">Refund</option>
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                            <ChevronDown className="w-4 h-4 text-gray-400" />
                                        </div>
                                    </div>
                                </div>

                                {/* Dimensions Grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Length */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Length (cm) <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            value={shipmentDetails.length}
                                            onChange={(e) => setShipmentDetails(prev => ({ ...prev, length: e.target.value }))}
                                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>

                                    {/* Breadth */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Breadth (cm) <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            value={shipmentDetails.breadth}
                                            onChange={(e) => setShipmentDetails(prev => ({ ...prev, breadth: e.target.value }))}
                                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>

                                    {/* Height */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Height (cm) <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            value={shipmentDetails.height}
                                            onChange={(e) => setShipmentDetails(prev => ({ ...prev, height: e.target.value }))}
                                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>

                                    {/* Weight */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Weight (kg) <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={shipmentDetails.weight}
                                            onChange={(e) => setShipmentDetails(prev => ({ ...prev, weight: e.target.value }))}
                                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowShiprocketModal(false);
                                            setShipmentDetails({ length: '', breadth: '', height: '', weight: '' });
                                            setReturnType('exchange');
                                        }}
                                        className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Confirm
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Confirm Return Order</h3>
                                <button
                                    onClick={() => setShowConfirmModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <p className="text-sm text-gray-600 mb-6">
                                Are you sure you want to create a return order? This will schedule a pickup for the return items in Shiprocket.
                            </p>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setShowConfirmModal(false)}
                                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    No
                                </button>
                                <button
                                    onClick={handleCreateShiprocketReturn}
                                    disabled={creatingShiprocketReturn}
                                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {creatingShiprocketReturn ? (
                                        <>
                                            <Loader2 className="w-4 h-4 inline animate-spin mr-2" />
                                            Creating...
                                        </>
                                    ) : (
                                        'Yes'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Status Update Modal */}
            {showStatusModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Update Return Status</h3>
                                <button
                                    onClick={() => {
                                        setShowStatusModal(false);
                                        setSelectedStatus('');
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <p className="text-sm text-gray-600 mb-4">
                                Are you sure you want to update the return status to <strong>{selectedStatus}</strong>?
                            </p>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => {
                                        setShowStatusModal(false);
                                        setSelectedStatus('');
                                    }}
                                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleStatusUpdate}
                                    disabled={updatingStatus}
                                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {updatingStatus ? (
                                        <>
                                            <Loader2 className="w-4 h-4 inline animate-spin mr-2" />
                                            Updating...
                                        </>
                                    ) : (
                                        'Confirm'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReturnOrderDetail;

