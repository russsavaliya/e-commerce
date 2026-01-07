/**
 * Payment Controller
 * Handles Razorpay payment integration
 */

const Razorpay = require('razorpay');
const crypto = require('crypto');
const order_model = require('../../model/order');
const draftOrder_model = require('../../model/draftOrder');
const coupon_model = require('../../model/coupon');
const customer_controller = require('./customer');
const { sendOrderSuccessEmail } = require('../../helper/emailHelper');
const { getNextSequence } = require('../../helper/sequenceHelper');
const product_model = require('../../model/product');

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Helper: Build cart items from DraftOrder cart_items
 */
const buildCartItems = async (cart = []) => {
  const items = [];
  let subtotal = 0;

  for (const item of cart) {
    const product = await product_model.findById(item.productId).select('name selling_price original_price discount_percentage variants images category');
    if (!product) {
      throw new Error('One of the products in your cart is no longer available.');
    }

    let price = product.selling_price;
    let variantName = null;
    let image = product.images?.[0] || null;
    const categoryId = product.category || null;

    if (item.variantId) {
      const variant = product.variants?.find(v => v._id.toString() == item.variantId.toString());
      if (!variant) {
        throw new Error('A selected variant is no longer available.');
      }
      price = variant.variant_price || price;
      variantName = variant.variant_name || variantName;
      if (variant.variant_image) {
        image = variant.variant_image;
      }
    }

    const lineTotal = price * item.quantity;
    subtotal += lineTotal;

    items.push({
      product_id: item.productId,
      category_id: categoryId,
      variant_id: item.variantId || null,
      product_name: product.name,
      variant_name: variantName,
      unit_price: price,
      quantity: item.quantity,
      total: lineTotal,
      image,
    });
  }

  return { items, subtotal };
};

/**
 * Helper: Create Order from DraftOrder
 */
const createOrderFromDraftOrder = async (draftOrder, paymentMethod, paymentStatus, orderStatus, razorpayOrderId = null, razorpayPaymentId = null) => {
  // Build cart items from DraftOrder
  const cart = draftOrder.cart_items || [];
  const { items, subtotal } = await buildCartItems(cart);

  // Get next sequence number for order
  const number_id = await getNextSequence('order');

  // Create Order
  const orderPayload = {
    number_id,
    order_id: `ORD-${Date.now()}`,
    products: items,
    sub_total: draftOrder.sub_total || subtotal,
    shipping_amount: draftOrder.shipping_amount || 0,
    total_tax: draftOrder.total_tax || 0,
    total_amount: draftOrder.total_amount,
    payment_method: paymentMethod,
    payment_status: paymentStatus,
    order_status: orderStatus,
    shipping_address: draftOrder.shipping_address,
    coupon: draftOrder.coupon || null,
    razorpay_order_id: razorpayOrderId,
    razorpay_payment_id: razorpayPaymentId,
    paid_at: paymentStatus === 'paid' ? new Date() : null,
  };

  const order = await order_model.create(orderPayload);

  // Create/Update customer and attach order_id
  await customer_controller.upsert_from_shipping(order.shipping_address, order.order_id);

  // Delete DraftOrder after successful Order creation
  await draftOrder_model.findByIdAndDelete(draftOrder._id);

  return order;
};

/**
 * Create Razorpay Order
 * This creates an order in Razorpay from DraftOrder and returns order details for frontend
 */
exports.create_razorpay_order = async (req, res) => {
  try {
    const { draftOrderId } = req.body || {};
    const { amount, currency = 'INR' } = req.body || {};

    if (!draftOrderId) {
      return res.status(400).json({
        status: false,
        message: 'Draft Order ID is required',
      });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({
        status: false,
        message: 'Valid amount is required',
      });
    }

    // Verify DraftOrder exists in database
    const draftOrder = await draftOrder_model.findById(draftOrderId);
    if (!draftOrder) {
      return res.status(404).json({
        status: false,
        message: 'Draft order not found',
      });
    }

    // Check if DraftOrder is already converted
    if (draftOrder.status === 'converted') {
      return res.status(400).json({
        status: false,
        message: 'This draft order has already been converted to an order.',
      });
    }

    // Update DraftOrder step to 'payment'
    await draftOrder_model.findByIdAndUpdate(draftOrderId, {
      $set: { step: 'payment' },
    });

    // Convert amount to paise (Razorpay expects amount in smallest currency unit)
    const amountInPaise = Math.round(amount * 100);

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: currency,
      receipt: draftOrderId.toString(),
      notes: {
        draft_order_id: draftOrderId.toString(),
        customer_email: draftOrder.shipping_address?.email || '',
      },
    });

    return res.status(200).json({
      status: true,
      message: 'Razorpay order created successfully',
      data: {
        order_id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key_id: process.env.RAZORPAY_KEY_ID,
        draft_order_id: draftOrderId, // Our internal draft order ID
      },
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return res.status(500).json({
      status: false,
      message: error.message || 'Failed to create Razorpay order',
    });
  }
};

/**
 * Verify Razorpay Payment
 * This verifies the payment signature, creates Order from DraftOrder, and deletes DraftOrder
 */
exports.verify_payment = async (req, res) => {
  try {
    const { draftOrderId } = req.body || {};
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};

    if (!draftOrderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        status: false,
        message: 'Missing required payment verification data',
      });
    }

    // Find DraftOrder in database
    const draftOrder = await draftOrder_model.findById(draftOrderId);
    if (!draftOrder) {
      return res.status(404).json({
        status: false,
        message: 'Draft order not found',
      });
    }

    // Check if DraftOrder is already converted
    if (draftOrder.status === 'converted') {
      return res.status(400).json({
        status: false,
        message: 'This draft order has already been converted to an order.',
      });
    }

    // Verify payment signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        status: false,
        message: 'Payment verification failed. Invalid signature.',
      });
    }

    // Verify with Razorpay API
    try {
      const payment = await razorpay.payments.fetch(razorpay_payment_id);

      if (payment.status !== 'captured' && payment.status !== 'authorized') {
        return res.status(400).json({
          status: false,
          message: 'Payment not successful',
        });
      }

      // Create Order from DraftOrder
      const order = await createOrderFromDraftOrder(
        draftOrder,
        'online',
        'paid',
        'confirmed',
        razorpay_order_id,
        razorpay_payment_id
      );

      // Populate coupon for email
      await order.populate('coupon.coupon_id');

      // Increment coupon usedCount only after successful payment
      if (order.coupon && order.coupon.coupon_id) {
        try {
          await coupon_model.findByIdAndUpdate(
            order.coupon.coupon_id,
            { $inc: { usedCount: 1 } },
            { new: true }
          );
        } catch (err) {
          console.error('Failed to increment coupon usage:', err);
          // Don't throw - order is already created successfully
        }
      }

      // Clear cart from session
      if (req.session) {
        req.session.cart = [];
      }

      // Send order confirmation emails (customer + admin)
      // Note: Email sending is non-blocking - errors won't affect order creation
      try {
        await sendOrderSuccessEmail(order.toObject());
      } catch (err) {
        console.error('Failed to send order confirmation emails:', err);
        // Don't throw - order is already created successfully
      }

      return res.status(200).json({
        status: true,
        message: 'Payment verified and order confirmed successfully',
        data: {
          order_id: order.order_id,
          payment_status: order.payment_status,
          order_status: order.order_status,
          payment_id: razorpay_payment_id,
        },
      });
    } catch (razorpayError) {
      console.error('Razorpay API error:', razorpayError);
      return res.status(500).json({
        status: false,
        message: 'Failed to verify payment with Razorpay',
      });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    return res.status(500).json({
      status: false,
      message: error.message || 'Failed to verify payment',
    });
  }
};

/**
 * Get Payment Status
 * Check current payment status of an order
 * Returns full order details if payment is paid (for success page)
 */
exports.get_payment_status = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        status: false,
        message: 'Order ID is required',
      });
    }

    // Get full order details (not just payment status)
    const order = await order_model.findOne({ order_id: orderId });

    if (!order) {
      return res.status(500).json({
        status: false,
        message: 'Order not found',
      });
    }

    // If payment is paid OR COD order is confirmed, return full order details for success page
    const isPaid = order.payment_status === 'paid';
    const isCODConfirmed = order.payment_method === 'cod' && order.order_status === 'confirmed';

    if (isPaid || isCODConfirmed) {
      return res.status(200).json({
        status: true,
        message: 'Order details retrieved successfully',
        data: {
          order_id: order.order_id,
          payment_status: order.payment_status,
          payment_method: order.payment_method,
          order_status: order.order_status,
          razorpay_order_id: order.razorpay_order_id || null,
          razorpay_payment_id: order.razorpay_payment_id || null,
          sub_total: order.sub_total,
          shipping_amount: order.shipping_amount,
          total_tax: order.total_tax,
          total_amount: order.total_amount,
          shipping_address: order.shipping_address,
          products: order.products,
          created_at: order.created_at,
        },
      });
    }

    // If not paid and not confirmed COD, return only payment status
    return res.status(200).json({
      status: true,
      message: 'Payment status retrieved successfully',
      data: {
        order_id: order.order_id,
        payment_status: order.payment_status,
        payment_method: order.payment_method,
        order_status: order.order_status,
        razorpay_order_id: order.razorpay_order_id || null,
        razorpay_payment_id: order.razorpay_payment_id || null,
      },
    });
  } catch (error) {
    console.error('Error getting payment status:', error);
    return res.status(500).json({
      status: false,
      message: error.message || 'Failed to get payment status',
    });
  }
};
