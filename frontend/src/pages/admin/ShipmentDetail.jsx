import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Loader2,
    ChevronLeft,
    Truck,
    Package,
    MapPin,
    Calendar,
    ExternalLink,
    Ruler,
    Weight,
    Hash,
    CheckCircle,
    XCircle,
    Clock,
    ChevronDown,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getShipmentById, updateShipmentStatus } from '../../services/admin/shipmentService';

const getShipmentStatusColor = (status) => {
    const colors = {
        created: 'bg-blue-100 text-blue-800 border-blue-200',
        pickup_scheduled: 'bg-purple-100 text-purple-800 border-purple-200',
        picked_up: 'bg-indigo-100 text-indigo-800 border-indigo-200',
        in_transit: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        out_for_delivery: 'bg-orange-100 text-orange-800 border-orange-200',
        delivered: 'bg-green-100 text-green-800 border-green-200',
        rto: 'bg-red-100 text-red-800 border-red-200',
        cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
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

const ShipmentDetail = () => {
    const { shipmentId } = useParams();
    const navigate = useNavigate();
    const [shipment, setShipment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [updatingStatus, setUpdatingStatus] = useState(false);

    // Valid shipment statuses
    const getShipmentStatusOptions = () => {
        return [
            'created',
            'pickup_scheduled',
            'picked_up',
            'in_transit',
            'out_for_delivery',
            'delivered',
            'rto',
            'cancelled',
        ];
    };

    useEffect(() => {
        const fetchShipmentDetail = async () => {
            try {
                setLoading(true);
                setError('');
                const response = await getShipmentById(shipmentId);

                if (response.status && response.data) {
                    setShipment(response.data);
                } else {
                    setError('Shipment not found');
                }
            } catch (err) {
                console.error('Error fetching shipment:', err);
                setError(err.message || 'Failed to load shipment');
                toast.error(err.message || 'Failed to load shipment');
            } finally {
                setLoading(false);
            }
        };

        if (shipmentId) {
            fetchShipmentDetail();
        }
    }, [shipmentId]);

    const handleOrderClick = () => {
        if (shipment?.order_id?.order_id) {
            navigate(`/admin/orders/${shipment.order_id.order_id}`);
        }
    };

    const handleStatusChange = async (newStatus) => {
        if (!shipment || updatingStatus) return;

        // Prevent unnecessary updates
        if (newStatus === shipment.shipment_status) {
            return;
        }

        try {
            setUpdatingStatus(true);
            const response = await updateShipmentStatus(shipment._id, newStatus);

            if (response.status) {
                setShipment((prev) => ({ ...prev, shipment_status: newStatus }));
                toast.success(`Shipment status updated to ${newStatus}`);
            }
        } catch (err) {
            console.error('Error updating shipment status:', err);
            toast.error(err.message || 'Failed to update shipment status');
        } finally {
            setUpdatingStatus(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 min-h-[400px]">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
                <span className="text-lg font-medium text-gray-700">Loading shipment details...</span>
            </div>
        );
    }

    if (error || !shipment) {
        return (
            <div className="w-full p-4">
                <button
                    onClick={() => navigate('/admin/shipments/list')}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6"
                >
                    <ChevronLeft className="w-4 h-4" /> Back to Shipments
                </button>
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center">
                    <Truck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-lg text-gray-700">{error || 'Shipment not found'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full p-4 lg:p-6 space-y-6">
            {/* Top Header Row */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate('/admin/shipments/list')}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <ChevronLeft className="w-4 h-4" /> Back to Shipments List
                </button>
            </div>

            {/* Shipment Header Card */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-indigo-100 rounded-lg">
                            <Truck className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-2xl font-bold text-gray-900">Shipment Details</h1>
                                <span
                                    className={`inline-flex items-center px-2 py-1 text-sm font-semibold rounded-lg border ${getShipmentStatusColor(
                                        shipment.shipment_status
                                    )}`}
                                >
                                    {shipment.shipment_status || 'created'}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600">Shipment ID: {shipment._id}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Manage Status Dropdown - pill style */}
                        <div className="bg-indigo-50 rounded-full border border-indigo-300 shadow-sm hover:shadow-md transition-all relative">
                            <select
                                defaultValue=""
                                onChange={(e) => {
                                    if (e.target.value) {
                                        handleStatusChange(e.target.value);
                                        e.target.value = '';
                                    }
                                }}
                                disabled={updatingStatus}
                                className="appearance-none pl-4 pr-9 py-2 text-sm font-semibold text-indigo-900 bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded-full cursor-pointer w-full disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                <option value="" disabled>
                                    {updatingStatus ? 'Updating...' : 'Update Status'}
                                </option>
                                {getShipmentStatusOptions().map((status) => (
                                    <option key={status} value={status} disabled={status === shipment.shipment_status}>
                                        {status === shipment.shipment_status
                                            ? `${status.charAt(0).toUpperCase() + status.slice(1)} (Current)`
                                            : status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                                    </option>
                                ))}
                            </select>
                            {updatingStatus ? (
                                <Loader2 className="w-4 h-4 text-indigo-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none animate-spin" />
                            ) : (
                                <ChevronDown className="w-4 h-4 text-indigo-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Shipment Information */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Shipment Information */}
                    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Package className="w-5 h-5 text-indigo-600" />
                            Shipment Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Shiprocket Order ID</label>
                                <p className="mt-1 text-sm font-medium text-gray-900">{shipment.shiprocket_order_id || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Shipment ID</label>
                                <p className="mt-1 text-sm font-medium text-gray-900">{shipment.shipment_id || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">AWB Code</label>
                                <p className="mt-1 text-sm font-medium text-gray-900">{shipment.awb_code || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Courier Name</label>
                                <p className="mt-1 text-sm font-medium text-gray-900">{shipment.courier_name || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Courier ID</label>
                                <p className="mt-1 text-sm font-medium text-gray-900">{shipment.courier_id || 'N/A'}</p>
                            </div>
                            {shipment.tracking_url && (
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tracking URL</label>
                                    <div className="mt-1">
                                        <a
                                            href={shipment.tracking_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
                                        >
                                            Track Shipment
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Dimensions & Weight */}
                    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Ruler className="w-5 h-5 text-indigo-600" />
                            Package Dimensions & Weight
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
                                    <Ruler className="w-3 h-3" />
                                    Length
                                </label>
                                <p className="mt-1 text-sm font-medium text-gray-900">{shipment.length ? `${shipment.length} cm` : 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
                                    <Ruler className="w-3 h-3" />
                                    Breadth
                                </label>
                                <p className="mt-1 text-sm font-medium text-gray-900">{shipment.breadth ? `${shipment.breadth} cm` : 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
                                    <Ruler className="w-3 h-3" />
                                    Height
                                </label>
                                <p className="mt-1 text-sm font-medium text-gray-900">{shipment.height ? `${shipment.height} cm` : 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
                                    <Weight className="w-3 h-3" />
                                    Weight
                                </label>
                                <p className="mt-1 text-sm font-medium text-gray-900">{shipment.weight ? `${shipment.weight} kg` : 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Linked Order */}
                    {shipment.order_id && (
                        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Hash className="w-5 h-5 text-indigo-600" />
                                Linked Order
                            </h2>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Order ID : </label>
                                    <button
                                        onClick={handleOrderClick}
                                        className="mt-1 text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                                    >
                                        {shipment.order_id.order_id || 'N/A'}
                                    </button>
                                </div>
                                {shipment.order_id.shipping_address && (
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Shipping Address</label>
                                        <div className="mt-1 text-sm text-gray-900">
                                            <p className="font-medium">{shipment.order_id.shipping_address.fullName}</p>
                                            <p className="text-gray-600">{shipment.order_id.shipping_address.address}</p>
                                            <p className="text-gray-600">
                                                {shipment.order_id.shipping_address.city}, {shipment.order_id.shipping_address.state} -{' '}
                                                {shipment.order_id.shipping_address.pincode}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column - Status & Dates */}
                <div className="space-y-6">
                    {/* Status Card */}
                    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-indigo-600" />
                            Status Information
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Shipment Status</label>
                                <div className="mt-2">
                                    <span
                                        className={`inline-flex px-3 py-1.5 text-sm font-semibold rounded-lg border ${getShipmentStatusColor(
                                            shipment.shipment_status
                                        )}`}
                                    >
                                        {shipment.shipment_status || 'created'}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Pickup Scheduled</label>
                                <div className="mt-1 flex items-center gap-2">
                                    {shipment.pickup_scheduled ? (
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                    ) : (
                                        <XCircle className="w-4 h-4 text-gray-400" />
                                    )}
                                    <span className="text-sm text-gray-900">{shipment.pickup_scheduled ? 'Yes' : 'No'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Dates Card */}
                    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-indigo-600" />
                            Important Dates
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    Created At
                                </label>
                                <p className="mt-1 text-sm text-gray-900">{formatDate(shipment.created_at || shipment.createdAt)}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    Updated At
                                </label>
                                <p className="mt-1 text-sm text-gray-900">{formatDate(shipment.updatedAt)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShipmentDetail;

