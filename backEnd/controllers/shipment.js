const shipment_model = require('../model/shipment');
const order_model = require('../model/order');
const axios = require('axios');

// Shiprocket API Configuration
const SHIPROCKET_BASE_URL = 'https://apiv2.shiprocket.in/v1/external';
let shiprocketToken = null;
let tokenExpiry = null;

/**
 * Get Shiprocket authentication token
 */
const getShiprocketToken = async () => {
  try {
    // Check if token exists and is still valid (refresh 5 minutes before expiry)
    if (shiprocketToken && tokenExpiry && Date.now() < tokenExpiry - 5 * 60 * 1000) {
      return shiprocketToken;
    }

    const email = process.env.SHIPROCKET_EMAIL;
    const password = process.env.SHIPROCKET_PASSWORD;
    // console.log(email, password, 'email and password');
    if (!email || !password) {
      throw new Error('Shiprocket credentials not configured');
    }

    const response = await axios.post(`${SHIPROCKET_BASE_URL}/auth/login`, {
      email,
      password,
    });

    if (response.data && response.data.token) {
      shiprocketToken = response.data.token;
      // Token expires in 24 hours, but we'll refresh after 23 hours
      tokenExpiry = Date.now() + 23 * 60 * 60 * 1000;
      return shiprocketToken;
    }

    throw new Error('Failed to get Shiprocket token');
  } catch (error) {
    console.error('Error getting Shiprocket token:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to authenticate with Shiprocket');
  }
};

/**
 * Create shipment in Shiprocket
 */
const createShiprocketOrder = async (order, shipmentData) => {
  try {
    const token = await getShiprocketToken();

    // Prepare order items for Shiprocket
    const orderItems = order.products.map((product) => ({
      name: product.product_name || 'Product',
      sku: product.product_id?.toString() || '',
      units: product.quantity || 1,
      selling_price: product.unit_price || 0,
    }));

    // Calculate total weight (default 500g per item if not provided)
    const totalWeight = shipmentData.weight || order.products.length * 0.5;

    // Prepare Shiprocket order payload
    const shiprocketPayload = {
      order_id: order.order_id,
      order_date: new Date(order.createdAt || Date.now()).toISOString().split('T')[0],
      pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION_NAME || 'Primary',
      billing_customer_name: order.shipping_address.fullName,
      billing_last_name: '',
      billing_address: order.shipping_address.address,
      billing_address_2: order.shipping_address.landmark || '',
      billing_city: order.shipping_address.city,
      billing_pincode: order.shipping_address.pincode,
      billing_state: order.shipping_address.state,
      billing_country: 'India',
      billing_email: order.shipping_address.email,
      billing_phone: order.shipping_address.phone,
      shipping_is_billing: true,
      shipping_customer_name: order.shipping_address.fullName,
      shipping_last_name: '',
      shipping_address: order.shipping_address.address,
      shipping_address_2: order.shipping_address.landmark || '',
      shipping_city: order.shipping_address.city,
      shipping_pincode: order.shipping_address.pincode,
      shipping_country: 'India',
      shipping_state: order.shipping_address.state,
      shipping_email: order.shipping_address.email,
      shipping_phone: order.shipping_address.phone,
      order_items: orderItems,
      payment_method: order.payment_method === 'cod' ? 'COD' : 'Prepaid',
      sub_total: order.sub_total || 0,
      length: shipmentData.length || 10,
      breadth: shipmentData.breadth || 10,
      height: shipmentData.height || 10,
      weight: totalWeight,
    };

    const response = await axios.post(
      `${SHIPROCKET_BASE_URL}/orders/create/adhoc`,
      shiprocketPayload,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );
    // console.log(response.data, 'response data');
    if (response.data && response.data.order_id) {
      return {
        shiprocket_order_id: response.data.order_id,
        shipment_id: response.data.shipment_id || null,
        awb_code: response.data.awb_code || null,
        courier_name: response.data.courier_name || null,
        courier_id: response.data.courier_id || null,
        tracking_url: response.data.tracking_url || null,
      };
    } else {
      throw new Error(response.data.message);
    }

  } catch (error) {
    console.log(error, 'create order error');
    console.error('Error creating Shiprocket order:', error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || error.response?.data?.errors?.[0]?.message || 'Failed to create Shiprocket order'
    );
  }
};

/**
 * Internal helper: Create shipment for an order (can be called from other controllers)
 * Exported for use in admin_order controller
 */
exports.createShipmentForOrder = async (orderId, shipmentData = {}) => {
  // Find the order
  const order = await order_model.findOne({ order_id: orderId });

  if (!order) {
    throw new Error('Order not found');
  }

  // Check if shipment already exists
  const existingShipment = await shipment_model.findOne({ order_id: order._id });

  if (existingShipment) {
    return existingShipment; // Return existing shipment
  }

  // Prepare shipment data with defaults
  const finalShipmentData = {
    weight: shipmentData.weight || order.products.length * 0.5, // Default 500g per item
    length: shipmentData.length || 10,
    breadth: shipmentData.breadth || 10,
    height: shipmentData.height || 10,
  };

  // Create order in Shiprocket
  const shiprocketData = await createShiprocketOrder(order, finalShipmentData);

  // Create shipment record in database
  const shipment = new shipment_model({
    order_id: order._id,
    shiprocket_order_id: shiprocketData.shiprocket_order_id,
    shipment_id: shiprocketData.shipment_id,
    awb_code: shiprocketData.awb_code,
    courier_name: shiprocketData.courier_name,
    courier_id: shiprocketData.courier_id,
    tracking_url: shiprocketData.tracking_url,
    weight: finalShipmentData.weight,
    length: finalShipmentData.length,
    breadth: finalShipmentData.breadth,
    height: finalShipmentData.height,
    shipment_status: 'created',
  });

  await shipment.save();

  // Note: Order status update to 'shipment' is handled by admin_order controller
  // to avoid duplicate updates

  return shipment;
};

/**
 * Admin: Create shipment for an order
 */
exports.create_shipment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { weight, length, breadth, height } = req.body;

    // Find the order
    const order = await order_model.findOne({ order_id: orderId });

    if (!order) {
      return res.status(404).json({
        status: false,
        message: 'Order not found',
      });
    }

    // Check if shipment already exists
    const existingShipment = await shipment_model.findOne({ order_id: order._id });

    if (existingShipment) {
      return res.status(400).json({
        status: false,
        message: 'Shipment already exists for this order',
        data: existingShipment,
      });
    }

    // Check if order is confirmed or accepted
    if (order.order_status !== 'confirmed' && order.order_status !== 'accepted') {
      return res.status(400).json({
        status: false,
        message: 'Order must be confirmed or accepted before creating shipment',
      });
    }

    // Create shipment
    const shipment = await exports.createShipmentForOrder(orderId, {
      weight,
      length,
      breadth,
      height,
    });

    // Update order status to 'shipment' when called via API
    await order_model.findOneAndUpdate(
      { order_id: orderId },
      { $set: { order_status: 'shipment' } },
      { new: true }
    );

    return res.status(201).json({
      status: true,
      message: 'Shipment created successfully',
      data: shipment,
    });
  } catch (error) {
    console.error('Error creating shipment:', error);
    return res.status(500).json({
      status: false,
      message: error.message || 'Failed to create shipment',
    });
  }
};

/**
 * Admin: Get shipment details by order ID
 */
exports.get_shipment_by_order = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await order_model.findOne({ order_id: orderId });

    if (!order) {
      return res.status(404).json({
        status: false,
        message: 'Order not found',
      });
    }

    const shipment = await shipment_model
      .findOne({ order_id: order._id })
      .populate('order_id', 'order_id shipping_address');

    if (!shipment) {
      return res.status(404).json({
        status: false,
        message: 'Shipment not found for this order',
      });
    }

    return res.status(200).json({
      status: true,
      message: 'Shipment fetched successfully',
      data: shipment,
    });
  } catch (error) {
    console.error('Error fetching shipment:', error);
    return res.status(500).json({
      status: false,
      message: error.message || 'Failed to fetch shipment',
    });
  }
};

/**
 * Admin: Update shipment status (sync with Shiprocket)
 */
exports.update_shipment_status = async (req, res) => {
  try {
    const { shipmentId } = req.params;
    const { shipment_status } = req.body;

    const allowedStatuses = [
      'created',
      'pickup_scheduled',
      'picked_up',
      'in_transit',
      'out_for_delivery',
      'delivered',
      'rto',
      'cancelled',
    ];

    if (!allowedStatuses.includes(shipment_status)) {
      return res.status(400).json({
        status: false,
        message: 'Invalid shipment status',
      });
    }

    const shipment = await shipment_model.findByIdAndUpdate(
      shipmentId,
      { $set: { shipment_status } },
      { new: true }
    );

    if (!shipment) {
      return res.status(404).json({
        status: false,
        message: 'Shipment not found',
      });
    }

    // If delivered, update order status as well
    if (shipment_status === 'delivered') {
      await order_model.findByIdAndUpdate(shipment.order_id, {
        $set: { order_status: 'delivered' },
      });
    }

    return res.status(200).json({
      status: true,
      message: 'Shipment status updated successfully',
      data: shipment,
    });
  } catch (error) {
    console.error('Error updating shipment status:', error);
    return res.status(500).json({
      status: false,
      message: error.message || 'Failed to update shipment status',
    });
  }
};

/**
 * Admin: Get all shipments with pagination
 */
exports.get_shipment_list = async (req, res) => {
  try {
    let { page = 1, limit = 10, search = '', shipment_status = '' } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;

    const matchConditions = {};

    if (search && search.trim()) {
      matchConditions.$or = [
        { awb_code: { $regex: search.trim(), $options: 'i' } },
        { shiprocket_order_id: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    if (shipment_status && shipment_status.trim()) {
      matchConditions.shipment_status = shipment_status.trim();
    }

    const pipeline = [];

    if (Object.keys(matchConditions).length > 0) {
      pipeline.push({ $match: matchConditions });
    }

    pipeline.push({ $sort: { created_at: -1 } });

    // Add lookup for order details before pagination
    pipeline.push({
      $lookup: {
        from: 'orders',
        localField: 'order_id',
        foreignField: '_id',
        as: 'order_details',
      },
    });

    pipeline.push({
      $unwind: {
        path: '$order_details',
        preserveNullAndEmptyArrays: true,
      },
    });

    // Use $facet to get both paginated results and total count
    pipeline.push({
      $facet: {
        shipments: [{ $skip: skip }, { $limit: limit }],
        totalCount: [{ $count: 'count' }],
      },
    });

    const result = await shipment_model.aggregate(pipeline);

    const aggregationResult = result[0] || { shipments: [], totalCount: [] };
    const shipments = aggregationResult.shipments || [];
    const total_count = aggregationResult.totalCount[0]?.count || 0;
    const total_pages = Math.ceil(total_count / limit);

    return res.status(200).json({
      status: true,
      message: 'Shipments fetched successfully',
      data: {
        shipments,
        total_count,
        total_pages,
        page,
        limit,
      },
    });
  } catch (error) {
    console.error('Error fetching shipments:', error);
    return res.status(500).json({
      status: false,
      message: error.message || 'Failed to fetch shipments',
    });
  }
};

