/**
 * Payment Controller
 * Handles Razorpay payment integration
 */

const Razorpay = require('razorpay');
const crypto = require('crypto');
const order_model = require('../../model/order');
const { sendOrderSuccessEmail } = require('../../helper/emailHelper');

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Create Razorpay Order
 * This creates an order in Razorpay and returns order details for frontend
 */
exports.create_razorpay_order = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { amount, currency = 'INR' } = req.body;

    if (!orderId) {
      return res.status(400).json({
        status: false,
        message: 'Order ID is required',
      });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({
        status: false,
        message: 'Valid amount is required',
      });
    }

    // Verify order exists in database
    const order = await order_model.findOne({ order_id: orderId });
    if (!order) {
      return res.status(404).json({
        status: false,
        message: 'Order not found',
      });
    }

    // Check if order is already paid
    if (order.payment_status === 'paid') {
      return res.status(400).json({
        status: false,
        message: 'Order is already paid',
      });
    }

    // Convert amount to paise (Razorpay expects amount in smallest currency unit)
    const amountInPaise = Math.round(amount * 100);

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: currency,
      receipt: orderId,
      notes: {
        order_id: orderId,
        customer_email: order.shipping_address?.email || '',
      },
    });

    // Update order with Razorpay order ID
    await order_model.findOneAndUpdate(
      { order_id: orderId },
      {
        $set: {
          razorpay_order_id: razorpayOrder.id,
          payment_method: 'online',
        },
      }
    );

    return res.status(200).json({
      status: true,
      message: 'Razorpay order created successfully',
      data: {
        order_id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key_id: process.env.RAZORPAY_KEY_ID,
        orderId: orderId, // Our internal order ID
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
 * This verifies the payment signature and updates order status
 */
exports.verify_payment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        status: false,
        message: 'Missing required payment verification data',
      });
    }

    // Find order in database
    const order = await order_model.findOne({ order_id: orderId });
    if (!order) {
      return res.status(404).json({
        status: false,
        message: 'Order not found',
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

      // Update order with payment details
      const updatedOrder = await order_model.findOneAndUpdate(
        { order_id: orderId },
        {
          $set: {
            razorpay_payment_id: razorpay_payment_id,
            razorpay_order_id: razorpay_order_id,
            payment_status: 'paid',
            payment_method: 'online',
            order_status: 'confirmed',
            paid_at: new Date(),
          },
        },
        { new: true }
      );

      // Clear cart from session
      if (req.session) {
        req.session.cart = [];
      }

      // Send order confirmation emails (customer + admin)
      // Note: Email sending is non-blocking - errors won't affect order creation
      try {
        await sendOrderSuccessEmail(updatedOrder.toObject());
      } catch (err) {
        console.error('Failed to send order confirmation emails:', err);
        // Don't throw - order is already created successfully
      }

      return res.status(200).json({
        status: true,
        message: 'Payment verified and order confirmed successfully',
        data: {
          order_id: updatedOrder.order_id,
          payment_status: updatedOrder.payment_status,
          order_status: updatedOrder.order_status,
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
