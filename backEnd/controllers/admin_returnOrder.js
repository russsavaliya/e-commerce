const returnOrder_model = require('../model/returnOrder');
const order_model = require('../model/order');
const shipment_model = require('../model/shipment');
const axios = require('axios');

// Shiprocket API Configuration
const SHIPROCKET_BASE_URL = 'https://apiv2.shiprocket.in/v1/external';
let shiprocketToken = null;
let tokenExpiry = null;

/**
 * Get Shiprocket authentication token
 * Reuses token if still valid, otherwise fetches new token
 */
const getShiprocketToken = async () => {
  try {
    // Check if token exists and is still valid (refresh 5 minutes before expiry)
    if (shiprocketToken && tokenExpiry && Date.now() < tokenExpiry - 5 * 60 * 1000) {
      return shiprocketToken;
    }

    const email = process.env.SHIPROCKET_EMAIL;
    const password = process.env.SHIPROCKET_PASSWORD;

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
 * Create return order in Shiprocket
 * This schedules a pickup for the return items
 */
const createShiprocketReturnOrder = async (order, returnOrder, shipment, returnDetails = {}) => {
  try {
    const token = await getShiprocketToken();

    // Validate that shipment has Shiprocket shipment_id
    if (!shipment || !shipment.shipment_id) {
      throw new Error('Original shipment not found or missing Shiprocket shipment ID. Cannot create return order.');
    }

    // Prepare return order items for Shiprocket
    const returnOrderItems = returnOrder.products.map((product) => ({
      name: product.product_name || 'Product',
      sku: product.product_id?.toString() || '',
      units: product.quantity || 1,
      selling_price: product.unit_price || 0,
    }));

    // Use provided dimensions or fallback to shipment dimensions or defaults
    const length = returnDetails.length || shipment.length || 10;
    const breadth = returnDetails.breadth || shipment.breadth || 10;
    const height = returnDetails.height || shipment.height || 10;
    const weight = returnDetails.weight || shipment.weight || (returnOrder.products.length * 0.5);
    const returnType = returnDetails.return_type || 'exchange'; // Default to 'exchange'

    // Validate return_type
    if (!['exchange', 'refund'].includes(returnType)) {
      throw new Error('Invalid return_type. Must be either "exchange" or "refund".');
    }

    // Prepare Shiprocket return order payload
    // Note: Shiprocket return API typically requires the original shipment_id
    const shiprocketReturnPayload = {
      shipment_id: shipment.shipment_id, // Original shipment ID from Shiprocket
      return_type: returnType,
      return_items: returnOrderItems,
      // Pickup address (customer's address where pickup will be scheduled)
      pickup_customer_name: order.shipping_address.fullName,
      pickup_last_name: '',
      pickup_address: order.shipping_address.address,
      pickup_address_2: order.shipping_address.landmark || '',
      pickup_city: order.shipping_address.city,
      pickup_pincode: order.shipping_address.pincode,
      pickup_state: order.shipping_address.state,
      pickup_country: 'India',
      pickup_email: order.shipping_address.email,
      pickup_phone: order.shipping_address.phone,
      // Package dimensions (from form or shipment)
      length: length,
      breadth: breadth,
      height: height,
      weight: weight,
      // Return reason
      return_reason: returnOrder.reason || 'Customer return request',
    };

    // Call Shiprocket return order API
    // Note: The endpoint might vary based on Shiprocket API version
    // Common endpoints: /orders/create/return, /returns/create, /orders/{order_id}/return
    // If this endpoint doesn't work, check Shiprocket API documentation and update accordingly
    console.log("shiprocketReturnPayload==>", shiprocketReturnPayload);
    const response = await axios.post(
      `${SHIPROCKET_BASE_URL}/orders/create/return`,
      shiprocketReturnPayload,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Check if response is successful
    if (response.data && (response.data.return_id || response.data.order_id)) {
      return {
        shiprocket_return_id: response.data.return_id || response.data.order_id,
        return_shipment_id: response.data.shipment_id || null,
        return_awb_code: response.data.awb_code || null,
        pickup_scheduled_date: response.data.pickup_scheduled_date || null,
        tracking_url: response.data.tracking_url || null,
      };
    } else {
      throw new Error(response.data?.message || 'Failed to create return order in Shiprocket');
    }
  } catch (error) {
    console.error('Error creating Shiprocket return order:', error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message ||
      error.response?.data?.errors?.[0]?.message ||
      'Failed to create return order in Shiprocket'
    );
  }
};

/**
 * Get all return orders with pagination and filters
 * GET /return-order/list
 */
exports.get_return_orders_list = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status = '',
    } = req.query || {};

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build filter query
    const filter = {};
    if (status && status.trim()) {
      filter.status = status.trim();
    }

    // Fetch return orders with pagination
    const returnOrders = await returnOrder_model
      .find(filter)
      .populate('order_id', 'order_id shipping_address.email shipping_address.fullName shipping_address.phone total_amount createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Get total count
    const totalCount = await returnOrder_model.countDocuments(filter);

    // Calculate total items for each return order
    const returnOrdersWithDetails = returnOrders.map((returnOrder) => {
      const totalItems = returnOrder.products.reduce((sum, product) => sum + product.quantity, 0);
      return {
        _id: returnOrder._id,
        order_id: returnOrder.order_id?.order_id || 'N/A',
        customer_email: returnOrder.order_id?.shipping_address?.email || 'N/A',
        customer_name: returnOrder.order_id?.shipping_address?.fullName || 'N/A',
        total_items: totalItems,
        status: returnOrder.status,
        requestedAt: returnOrder.requestedAt,
        createdAt: returnOrder.createdAt,
        updatedAt: returnOrder.updatedAt,
      };
    });

    return res.status(200).json({
      status: true,
      message: 'Return orders fetched successfully',
      data: {
        returnOrders: returnOrdersWithDetails,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total_count: totalCount,
          total_pages: Math.ceil(totalCount / limitNum),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching return orders list:', error);
    return res.status(500).json({
      status: false,
      message: error.message || 'Failed to fetch return orders',
    });
  }
};

/**
 * Get single return order details
 * GET /return-order/get-one?returnOrderId=xxx
 */
exports.get_one_return_order = async (req, res) => {
  try {
    const { returnOrderId } = req.query;

    if (!returnOrderId) {
      return res.status(400).json({
        status: false,
        message: 'Return order ID is required',
      });
    }

    const mongoose = require('mongoose');
    const ObjectId = mongoose.Types.ObjectId;

    // Aggregation pipeline to fetch return order with order details and product images
    const pipeline = [
      // Match return order by ID
      {
        $match: {
          _id: new ObjectId(returnOrderId),
        },
      },
      // Lookup order details
      {
        $lookup: {
          from: 'orders',
          localField: 'order_id',
          foreignField: '_id',
          as: 'orderDetails',
        },
      },
      // Unwind order details (should be single order)
      {
        $unwind: {
          path: '$orderDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      // Add products with images by matching with order products
      {
        $addFields: {
          products: {
            $map: {
              input: '$products',
              as: 'returnProduct',
              in: {
                $let: {
                  vars: {
                    matchedOrderProduct: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: '$orderDetails.products',
                            as: 'orderProduct',
                            cond: {
                              $and: [
                                {
                                  $eq: [
                                    { $toString: '$$returnProduct.product_id' },
                                    { $toString: '$$orderProduct.product_id' },
                                  ],
                                },
                                {
                                  $or: [
                                    {
                                      $and: [
                                        { $ifNull: ['$$returnProduct.variant_id', false] },
                                        { $ifNull: ['$$orderProduct.variant_id', false] },
                                        {
                                          $eq: [
                                            { $toString: '$$returnProduct.variant_id' },
                                            { $toString: '$$orderProduct.variant_id' },
                                          ],
                                        },
                                      ],
                                    },
                                    {
                                      $and: [
                                        { $not: { $ifNull: ['$$returnProduct.variant_id', false] } },
                                        { $not: { $ifNull: ['$$orderProduct.variant_id', false] } },
                                      ],
                                    },
                                  ],
                                },
                              ],
                            },
                          },
                        },
                        0,
                      ],
                    },
                  },
                  in: {
                    product_id: '$$returnProduct.product_id',
                    variant_id: '$$returnProduct.variant_id',
                    product_name: '$$returnProduct.product_name',
                    variant_name: '$$returnProduct.variant_name',
                    quantity: '$$returnProduct.quantity',
                    unit_price: '$$returnProduct.unit_price',
                    image: {
                      $ifNull: ['$$matchedOrderProduct.image', null],
                    },
                  },
                },
              },
            },
          },
        },
      },
      // Project final formatted response
      {
        $project: {
          _id: 1,
          order: {
            order_id: '$orderDetails.order_id',
            total_amount: '$orderDetails.total_amount',
            sub_total: '$orderDetails.sub_total',
            shipping_amount: '$orderDetails.shipping_amount',
            payment_method: '$orderDetails.payment_method',
            payment_status: '$orderDetails.payment_status',
            order_status: '$orderDetails.order_status',
            created_at: '$orderDetails.createdAt',
          },
          customer: {
            fullName: '$orderDetails.shipping_address.fullName',
            email: '$orderDetails.shipping_address.email',
            phone: '$orderDetails.shipping_address.phone',
            address: '$orderDetails.shipping_address.address',
            city: '$orderDetails.shipping_address.city',
            state: '$orderDetails.shipping_address.state',
            pincode: '$orderDetails.shipping_address.pincode',
          },
          products: 1,
          return_details: {
            status: '$status',
            reason: { $ifNull: ['$reason', ''] },
            requestedAt: '$requestedAt',
            shiprocket_return_id: '$shiprocket_return_id',
            createdAt: '$createdAt',
            updatedAt: '$updatedAt',
          },
          order_id_for_delivery: '$orderDetails._id',
        },
      },
    ];

    const result = await returnOrder_model.aggregate(pipeline);

    if (!result || result.length === 0) {
      return res.status(404).json({
        status: false,
        message: 'Return order not found',
      });
    }

    const returnOrder = result[0];

    // Get delivery date
    const deliveryDate = await getDeliveryDate(returnOrder.order_id_for_delivery);

    // Calculate return window
    let returnWindowEnd = null;
    let isEligible = false;
    if (deliveryDate) {
      returnWindowEnd = new Date(deliveryDate);
      returnWindowEnd.setDate(returnWindowEnd.getDate() + 7);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      isEligible = today <= returnWindowEnd;
    }

    // Add delivery info to response
    const response = {
      ...returnOrder,
      delivery_info: {
        delivery_date: deliveryDate,
        return_window_end: returnWindowEnd,
        is_eligible: isEligible,
      },
    };

    // Remove temporary field
    delete response.order_id_for_delivery;

    return res.status(200).json({
      status: true,
      message: 'Return order fetched successfully',
      data: response,
    });
  } catch (error) {
    console.error('Error fetching return order:', error);
    return res.status(500).json({
      status: false,
      message: error.message || 'Failed to fetch return order',
    });
  }
};

/**
 * Update return order status
 * PATCH /return-order/update-status
 */
exports.update_return_status = async (req, res) => {
  try {
    const { returnOrderId, status } = req.body || {};

    if (!returnOrderId || !status) {
      return res.status(400).json({
        status: false,
        message: 'Return order ID and status are required',
      });
    }

    // Validate status
    const validStatuses = ['Return Requested', 'Pickup Scheduled', 'Picked', 'Refunded'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        status: false,
        message: `Invalid status. Allowed values: ${validStatuses.join(', ')}`,
      });
    }

    // Find return order
    const returnOrder = await returnOrder_model.findById(returnOrderId);
    if (!returnOrder) {
      return res.status(404).json({
        status: false,
        message: 'Return order not found',
      });
    }

    // Validate status transition (basic validation)
    const currentStatus = returnOrder.status;
    const statusOrder = {
      'Return Requested': 1,
      'Pickup Scheduled': 2,
      'Picked': 3,
      'Refunded': 4,
    };

    // Allow same status or forward progression
    if (statusOrder[status] < statusOrder[currentStatus]) {
      return res.status(400).json({
        status: false,
        message: `Cannot change status from "${currentStatus}" to "${status}". Status can only progress forward.`,
      });
    }

    // Update status
    returnOrder.status = status;
    await returnOrder.save();

    return res.status(200).json({
      status: true,
      message: 'Return order status updated successfully',
      data: {
        returnOrderId: returnOrder._id,
        status: returnOrder.status,
        updatedAt: returnOrder.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error updating return order status:', error);
    return res.status(500).json({
      status: false,
      message: error.message || 'Failed to update return order status',
    });
  }
};

/**
 * Create Shiprocket return order
 * POST /return-order/create-shiprocket-return
 * 
 * This endpoint creates a return order in Shiprocket and schedules a pickup
 */
exports.create_shiprocket_return = async (req, res) => {
  try {
    const {
      returnOrderId,
      length,
      breadth,
      height,
      weight,
      return_type
    } = req.body || {};

    if (!returnOrderId) {
      return res.status(400).json({
        status: false,
        message: 'Return order ID is required',
      });
    }

    // Validate return_type if provided
    if (return_type && !['exchange', 'refund'].includes(return_type)) {
      return res.status(400).json({
        status: false,
        message: 'Invalid return_type. Must be either "exchange" or "refund".',
      });
    }

    // Find return order with populated order details
    const returnOrder = await returnOrder_model
      .findById(returnOrderId)
      .populate('order_id')
      .lean();

    if (!returnOrder) {
      return res.status(404).json({
        status: false,
        message: 'Return order not found',
      });
    }

    // Check if Shiprocket return already exists
    if (returnOrder.shiprocket_return_id) {
      return res.status(400).json({
        status: false,
        message: 'Shiprocket return order already exists for this return request',
        data: {
          shiprocket_return_id: returnOrder.shiprocket_return_id,
        },
      });
    }

    // Find the original shipment for this order
    const shipment = await shipment_model.findOne({
      order_id: returnOrder.order_id._id,
    });

    if (!shipment || !shipment.shipment_id) {
      return res.status(400).json({
        status: false,
        message: 'Original shipment not found or missing Shiprocket shipment ID. Please create shipment first.',
      });
    }

    // Prepare return details from request body
    const returnDetails = {
      length: length ? parseFloat(length) : undefined,
      breadth: breadth ? parseFloat(breadth) : undefined,
      height: height ? parseFloat(height) : undefined,
      weight: weight ? parseFloat(weight) : undefined,
      return_type: return_type || 'exchange',
    };

    // Create return order in Shiprocket
    const shiprocketReturnData = await createShiprocketReturnOrder(
      returnOrder.order_id,
      returnOrder,
      shipment,
      returnDetails
    );

    // Update return order with Shiprocket return ID and status
    const updatedReturnOrder = await returnOrder_model.findByIdAndUpdate(
      returnOrderId,
      {
        $set: {
          shiprocket_return_id: shiprocketReturnData.shiprocket_return_id,
          status: 'Pickup Scheduled', // Update status to Pickup Scheduled
        },
      },
      { new: true }
    );

    return res.status(200).json({
      status: true,
      message: 'Shiprocket return order created successfully. Pickup has been scheduled.',
      data: {
        returnOrderId: updatedReturnOrder._id,
        shiprocket_return_id: shiprocketReturnData.shiprocket_return_id,
        return_shipment_id: shiprocketReturnData.return_shipment_id,
        return_awb_code: shiprocketReturnData.return_awb_code,
        pickup_scheduled_date: shiprocketReturnData.pickup_scheduled_date,
        tracking_url: shiprocketReturnData.tracking_url,
        status: updatedReturnOrder.status,
      },
    });
  } catch (error) {
    console.error('Error creating Shiprocket return order:', error);
    return res.status(500).json({
      status: false,
      message: error.message || 'Failed to create Shiprocket return order',
    });
  }
};

/**
 * Get shipment details for return order
 * GET /return-order/get-shipment-details?returnOrderId=xxx
 * 
 * This endpoint fetches the original shipment details for a return order
 */
exports.get_shipment_details = async (req, res) => {
  try {
    const { returnOrderId } = req.query;

    if (!returnOrderId) {
      return res.status(400).json({
        status: false,
        message: 'Return order ID is required',
      });
    }

    // Find return order
    const returnOrder = await returnOrder_model
      .findById(returnOrderId)
      .populate('order_id')
      .lean();

    if (!returnOrder) {
      return res.status(404).json({
        status: false,
        message: 'Return order not found',
      });
    }

    // Find the original shipment for this order
    const shipment = await shipment_model.findOne({
      order_id: returnOrder.order_id._id,
    });

    if (!shipment) {
      return res.status(404).json({
        status: false,
        message: 'Original shipment not found for this order',
      });
    }

    return res.status(200).json({
      status: true,
      message: 'Shipment details fetched successfully',
      data: {
        length: shipment.length || 10,
        breadth: shipment.breadth || 10,
        height: shipment.height || 10,
        weight: shipment.weight || (returnOrder.products.length * 0.5),
      },
    });
  } catch (error) {
    console.error('Error fetching shipment details:', error);
    return res.status(500).json({
      status: false,
      message: error.message || 'Failed to fetch shipment details',
    });
  }
};
/**
 * Helper: Get delivery date for an order
 */
const getDeliveryDate = async (orderId) => {
  try {
    // Check shipment - if delivered, use shipment updatedAt
    const shipment = await shipment_model.findOne({
      order_id: orderId,
      shipment_status: 'delivered',
    });

    if (shipment && shipment.updatedAt) {
      return shipment.updatedAt;
    }

    // Check order status - if delivered, use order updatedAt
    const order = await order_model.findById(orderId);
    if (order && order.order_status === 'delivered' && order.updatedAt) {
      return order.updatedAt;
    }

    // Fallback: if order status is delivered but no updatedAt, use createdAt + 5 days (estimated)
    if (order && order.order_status === 'delivered') {
      const estimatedDelivery = new Date(order.createdAt);
      estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);
      return estimatedDelivery;
    }

    return null;
  } catch (error) {
    console.error('Error getting delivery date:', error);
    return null;
  }
};

