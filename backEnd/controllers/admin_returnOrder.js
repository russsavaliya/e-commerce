const returnOrder_model = require('../model/returnOrder');
const order_model = require('../model/order');
const shipment_model = require('../model/shipment');

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

