const order_model = require('../../model/order');
const returnOrder_model = require('../../model/returnOrder');
const shipment_model = require('../../model/shipment');
const { send_email, send_html_email } = require('../../helper/mailer');
const { generateOTP, storeOTP, verifyOTP } = require('../../helper/otpHelper');

/**
 * Send OTP for return order verification
 * POST /users/return/send-otp
 */
exports.send_otp = async (req, res) => {
  try {
    const { orderId, email } = req.body || {};

    if (!orderId || !email) {
      return res.status(400).json({
        status: false,
        message: 'Order ID and email are required',
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        status: false,
        message: 'Invalid email format',
      });
    }

    // Find order and verify email matches
    const order = await order_model.findOne({
      order_id: orderId,
      'shipping_address.email': email.toLowerCase(),
    });

    if (!order) {
      return res.status(404).json({
        status: false,
        message: 'Order not found or email does not match',
      });
    }

    // Check if order is delivered (only delivered orders can be returned)
    if (order.order_status !== 'delivered') {
      return res.status(400).json({
        status: false,
        message: 'Only delivered orders can be returned',
      });
    }

    // Generate and store OTP
    const otp = generateOTP();
    storeOTP(orderId, email, otp);

    // Send OTP via email
    const subject = 'OTP for Return Order Request';
    const text = `Your OTP for return order request (Order ID: ${orderId}) is: ${otp}\n\nThis OTP is valid for 10 minutes.\n\nIf you did not request this, please ignore this email.`;

    try {
      await send_email({
        to: email,
        subject,
        text,
      });
    } catch (emailError) {
      console.error('Error sending OTP email:', emailError);
      // Don't fail the request if email fails - OTP is still stored
    }

    return res.status(200).json({
      status: true,
      message: 'OTP sent successfully to your email',
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    return res.status(500).json({
      status: false,
      message: error.message || 'Failed to send OTP',
    });
  }
};

/**
 * Verify OTP for return order
 * POST /users/return/verify-otp
 */
exports.verify_otp = async (req, res) => {
  try {
    const { orderId, email, otp } = req.body || {};

    if (!orderId || !email || !otp) {
      return res.status(400).json({
        status: false,
        message: 'Order ID, email, and OTP are required',
      });
    }

    // Verify OTP
    const verification = verifyOTP(orderId, email, otp);

    if (!verification.valid) {
      return res.status(400).json({
        status: false,
        message: verification.message,
      });
    }

    // Fetch order details for return eligibility check
    const order = await order_model.findOne({
      order_id: orderId,
      'shipping_address.email': email.toLowerCase(),
    }).populate('products.product_id', 'name image');

    if (!order) {
      return res.status(404).json({
        status: false,
        message: 'Order not found',
      });
    }

    // Check return eligibility (7 days from delivery)
    const deliveryDate = await getDeliveryDate(order._id);
    if (!deliveryDate) {
      return res.status(400).json({
        status: false,
        message: 'Order delivery date not found. Cannot process return.',
      });
    }

    const returnWindowEnd = new Date(deliveryDate);
    returnWindowEnd.setDate(returnWindowEnd.getDate() + 7);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isEligible = today <= returnWindowEnd;

    return res.status(200).json({
      status: true,
      message: 'OTP verified successfully',
      data: {
        order: {
          order_id: order.order_id,
          products: order.products.map((p) => ({
            product_id: p.product_id,
            variant_id: p.variant_id,
            product_name: p.product_name,
            variant_name: p.variant_name,
            quantity: p.quantity,
            unit_price: p.unit_price,
            image: p.image,
          })),
          created_at: order.createdAt,
          delivery_date: deliveryDate,
        },
        isEligible,
        returnWindowEnd: returnWindowEnd.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return res.status(500).json({
      status: false,
      message: error.message || 'Failed to verify OTP',
    });
  }
};

/**
 * Create return order request
 * POST /users/return/create
 */
exports.create_return = async (req, res) => {
  try {
    const { orderId, email, products, reason } = req.body || {};
    console.log("req.body==>", req.body);
    if (!orderId || !email) {
      return res.status(400).json({
        status: false,
        message: 'Order ID and email are required',
      });
    }

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        status: false,
        message: 'At least one product must be selected for return',
      });
    }

    // Find order
    const order = await order_model.findOne({
      order_id: orderId,
      'shipping_address.email': email.toLowerCase(),
    });
    console.log("order==>", order);
    if (!order) {
      return res.status(404).json({
        status: false,
        message: 'Order not found',
      });
    }

    // Check if return already exists for this order
    const existingReturn = await returnOrder_model.findOne({
      order_id: order._id,
    });
    console.log("existingReturn==>", existingReturn);
    if (existingReturn) {
      return res.status(400).json({
        status: false,
        message: 'Return request already exists for this order',
      });
    }

    // Check return eligibility
    const deliveryDate = await getDeliveryDate(order._id);
    if (!deliveryDate) {
      return res.status(400).json({
        status: false,
        message: 'Order delivery date not found. Cannot process return.',
      });
    }

    const returnWindowEnd = new Date(deliveryDate);
    returnWindowEnd.setDate(returnWindowEnd.getDate() + 7);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (today > returnWindowEnd) {
      return res.status(400).json({
        status: false,
        message: 'Return window has expired. Returns are only allowed within 7 days of delivery.',
      });
    }

    // Validate products - ensure they exist in the order
    // Frontend sends product_id and variant_id as strings, so we validate using string comparison
    for (const returnProduct of products) {
      // Validate required fields
      if (!returnProduct.product_id) {
        return res.status(400).json({
          status: false,
          message: 'Product ID is required for all return items',
        });
      }

      const returnProductId = String(returnProduct.product_id);
      const returnVariantId = returnProduct.variant_id ? String(returnProduct.variant_id) : null;

      // Find matching product in order
      const orderProduct = order.products.find((p) => {
        const orderProductId = String(p.product_id);
        const orderVariantId = p.variant_id ? String(p.variant_id) : null;
        
        // Match by product_id and variant_id (if variant exists)
        if (returnVariantId && orderVariantId) {
          return orderProductId === returnProductId && orderVariantId === returnVariantId;
        }
        // If no variant, match by product_id only
        return orderProductId === returnProductId;
      });

      if (!orderProduct) {
        return res.status(400).json({
          status: false,
          message: `Product ${returnProduct.product_name || returnProductId} not found in order`,
        });
      }

      // User must return all items - quantity must match order quantity exactly
      if (returnProduct.quantity !== orderProduct.quantity) {
        return res.status(400).json({
          status: false,
          message: `Return quantity for product ${returnProduct.product_name} must match order quantity. All items must be returned.`,
        });
      }
    }

    // Create return order
    // Use product data as received from frontend (already in correct format)
    const returnOrder = await returnOrder_model.create({
      order_id: order._id,
      products: products.map((p) => ({
        product_id: p.product_id,
        variant_id: p.variant_id || null,
        product_name: p.product_name,
        variant_name: p.variant_name,
        quantity: p.quantity,
        unit_price: p.unit_price,
      })),
      reason: reason || '',
      status: 'Return Requested',
      requestedAt: new Date(),
    });

    // Send email notifications
    try {
      await sendReturnRequestEmails(order, returnOrder);
    } catch (emailError) {
      console.error('Error sending return request emails:', emailError);
      // Don't fail the request if email fails
    }

    return res.status(201).json({
      status: true,
      message: 'Return request submitted successfully',
      data: {
        return_id: returnOrder._id,
        status: returnOrder.status,
      },
    });
  } catch (error) {
    console.error('Error creating return order:', error);
    return res.status(500).json({
      status: false,
      message: error.message || 'Failed to create return request',
    });
  }
};

/**
 * Helper: Get delivery date for an order
 * Checks shipment status first, then order status
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

/**
 * Send email notifications for return request
 */
const sendReturnRequestEmails = async (order, returnOrder) => {
  const customerEmail = order.shipping_address.email;
  const adminEmail = process.env.ADMIN_EMAIL;

  // Email to customer
  const customerSubject = 'Return Request Submitted - Order ' + order.order_id;
  const customerText = `Dear ${order.shipping_address.fullName},\n\n` +
    `Your return request for Order ${order.order_id} has been submitted successfully.\n\n` +
    `Return Details:\n` +
    `- Order ID: ${order.order_id}\n` +
    `- Status: ${returnOrder.status}\n` +
    `- Requested At: ${returnOrder.requestedAt.toLocaleString('en-IN')}\n\n` +
    `Our team will review your request and schedule a pickup soon. You will receive further updates via email.\n\n` +
    `Thank you for your patience.\n\n` +
    `Best regards,\n` +
    `SIYARA Team`;

  try {
    await send_email({
      to: customerEmail,
      subject: customerSubject,
      text: customerText,
    });
  } catch (error) {
    console.error('Error sending customer return email:', error);
  }

  // Email to admin
  if (adminEmail) {
    const adminSubject = `New Return Request - Order ${order.order_id}`;
    const adminText = `A new return request has been submitted.\n\n` +
      `Order Details:\n` +
      `- Order ID: ${order.order_id}\n` +
      `- Customer: ${order.shipping_address.fullName}\n` +
      `- Email: ${order.shipping_address.email}\n` +
      `- Phone: ${order.shipping_address.phone}\n` +
      `- Return Status: ${returnOrder.status}\n` +
      `- Requested At: ${returnOrder.requestedAt.toLocaleString('en-IN')}\n\n` +
      `Products to Return:\n` +
      returnOrder.products.map((p, idx) =>
        `${idx + 1}. ${p.product_name}${p.variant_name ? ` (${p.variant_name})` : ''} - Qty: ${p.quantity}`
      ).join('\n') +
      (returnOrder.reason ? `\n\nReason: ${returnOrder.reason}` : '') +
      `\n\nPlease review and process the return request from the admin panel.`;

    try {
      await send_email({
        to: adminEmail,
        subject: adminSubject,
        text: adminText,
      });
    } catch (error) {
      console.error('Error sending admin return email:', error);
    }
  }
};

