const product_model = require('../../model/product');
const order_model = require('../../model/order');
const draftOrder_model = require('../../model/draftOrder');
const coupon_model = require('../../model/coupon');
const customer_controller = require('./customer');
const { sendOrderSuccessEmail } = require('../../helper/emailHelper');
const { getNextSequence } = require('../../helper/sequenceHelper');

const allowedPaymentMethods = ['cod', 'online'];

const buildCartItems = async (cart = []) => {
  const items = [];
  let subtotal = 0;

  for (const item of cart) {
    const product = await product_model.findById(item.productId).select('name selling_price original_price discount_percentage variants images category');
    if (!product) {
      throw new Error('One of the products in your cart is no longer available.');
    }

    let price = product.selling_price;
    let variantName = item.variantName || null;
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
 * Step 1: Create DraftOrder (NOT Order) after shipping details (before payment).
 * Order and Customer will be created only after payment success or COD confirmation.
 */
exports.init_order = async (req, res) => {
  try {
    const cart = req.session.cart || [];
    if (!cart.length) {
      return res.status(400).json({
        status: false,
        message: 'Cart is empty. Add items before placing an order.',
      });
    }

    const {
      fullName,
      phone,
      email,
      address,
      city,
      state,
      pincode,
      landmark,
      coupon_id,
      coupon_code,
      discount_amount,
    } = req.body || {};

    if (!fullName || !phone || !email || !address || !city || !state || !pincode) {
      return res.status(400).json({
        status: false,
        message: 'Please provide all required shipping fields.',
      });
    }

    const { items, subtotal } = await buildCartItems(cart);

    const shipping_amount = 0;
    const total_tax = 0;
    const coupon_discount = discount_amount ? Number(discount_amount) : 0;
    const total_amount = Math.max(0, subtotal + shipping_amount + total_tax - coupon_discount);

    // Prepare cart items for DraftOrder
    const cartItems = cart.map((item) => ({
      productId: item.productId,
      variantId: item.variantId || null,
      quantity: item.quantity,
    }));

    // Check if DraftOrder already exists for this email (in_progress)
    // If exists, update it; otherwise create new
    const existingDraftOrder = await draftOrder_model.findOne({
      email: email.toLowerCase(),
      status: 'in_progress',
    });

    const draftOrderPayload = {
      email: email.toLowerCase(),
      shipping_address: {
        fullName,
        phone,
        email,
        address,
        city,
        state,
        pincode,
        landmark,
      },
      cart_items: cartItems,
      step: 'address',
      status: 'in_progress',
      sub_total: subtotal,
      shipping_amount,
      total_tax,
      total_amount
    };

    let draftOrder;
    if (existingDraftOrder) {
      // Update existing DraftOrder
      draftOrder = await draftOrder_model.findByIdAndUpdate(
        existingDraftOrder._id,
        { $set: draftOrderPayload },
        { new: true }
      );
    } else {
      // Create new DraftOrder
      draftOrder = await draftOrder_model.create(draftOrderPayload);
    }

    return res.status(201).json({
      status: true,
      message: 'Address saved. Proceed to payment step.',
      data: {
        draft_order_id: draftOrder._id,
        total_amount: draftOrder.total_amount,
      },
    });
  } catch (error) {
    console.error('Error creating draft order:', error);
    return res.status(500).json({
      status: false,
      message: error.message || 'Failed to save address',
    });
  }
};

/**
 * Helper: Create Order from DraftOrder
 * This is used by both COD and Online Payment flows
 */
const createOrderFromDraftOrder = async (draftOrder, paymentMethod, paymentStatus, orderStatus) => {
  // Build cart items from DraftOrder
  const cart = draftOrder.cart_items || [];
  const { items, subtotal } = await buildCartItems(
    cart.map((item) => ({
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
    }))
  );

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
  };

  const order = await order_model.create(orderPayload);

  // Create/Update customer and attach order_id
  await customer_controller.upsert_from_shipping(order.shipping_address, order.order_id);

  // Delete DraftOrder after successful Order creation
  await draftOrder_model.findByIdAndDelete(draftOrder._id);

  return order;
};

/**
 * Step 2: COD Payment confirmation.
 * Creates Order from DraftOrder and deletes DraftOrder.
 */
exports.update_payment = async (req, res) => {
  try {
    const { draftOrderId } = req.body || {};
    const { payment_method = 'cod' } = req.body || {};

    if (!draftOrderId) {
      return res.status(400).json({
        status: false,
        message: 'Draft Order ID is required.',
      });
    }

    if (!allowedPaymentMethods.includes(payment_method)) {
      return res.status(400).json({
        status: false,
        message: 'Invalid payment method.',
      });
    }

    // Find DraftOrder
    const draftOrder = await draftOrder_model.findById(draftOrderId);
    if (!draftOrder) {
      return res.status(404).json({
        status: false,
        message: 'Draft order not found.',
      });
    }

    // Check if DraftOrder is already converted
    if (draftOrder.status === 'converted') {
      return res.status(400).json({
        status: false,
        message: 'This draft order has already been converted to an order.',
      });
    }

    // Create Order from DraftOrder
    const order = await createOrderFromDraftOrder(
      draftOrder,
      payment_method,
      'pending',
      'confirmed'
    );

    // Populate coupon for email
    await order.populate('coupon.coupon_id');

    // Increment coupon usedCount only after successful order confirmation
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

    // Clear cart only after payment is confirmed/order is placed
    // This ensures cart remains intact if user abandons checkout
    req.session.cart = [];

    // Send order confirmation emails (customer + admin)
    try {
      await sendOrderSuccessEmail(order.toObject());
    } catch (err) {
      console.error('Failed to send order confirmation emails:', err);
      // Don't throw - order is already created successfully
    }

    return res.status(200).json({
      status: true,
      message: 'Order confirmed successfully.',
      data: {
        order_id: order.order_id,
        order_status: order.order_status,
        payment_method: order.payment_method,
        payment_status: order.payment_status,
      },
    });
  } catch (error) {
    console.error('Error creating order from draft:', error);
    return res.status(500).json({
      status: false,
      message: error.message || 'Failed to create order',
    });
  }
};

exports.track_order = async (req, res) => {
  try {
    const { orderId, email } = req.query || {};

    if (!orderId || !email) {
      return res.status(400).json({
        status: false,
        message: 'orderId and email are required',
      });
    }

    const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);

    // Use aggregation to properly include all product fields including image
    const orderResult = await order_model.aggregate([
      {
        $match: {
          order_id: orderId,
          'shipping_address.email': email,
          created_at: { $gte: tenDaysAgo },
        },
      },
      {
        $project: {
          order_id: 1,
          products: {
            $map: {
              input: '$products',
              as: 'product',
              in: {
                product_id: '$$product.product_id',
                category_id: '$$product.category_id',
                variant_id: '$$product.variant_id',
                product_name: '$$product.product_name',
                variant_name: '$$product.variant_name',
                unit_price: '$$product.unit_price',
                quantity: '$$product.quantity',
                total: '$$product.total',
                image: '$$product.image',
              },
            },
          },
          total_amount: 1,
          sub_total: 1,
          shipping_amount: 1,
          total_tax: 1,
          order_status: 1,
          payment_status: 1,
          payment_method: 1,
          shipping_address: 1,
          created_at: 1,
        },
      },
    ]);

    const order = orderResult && orderResult.length > 0 ? orderResult[0] : null;

    if (!order) {
      return res.status(404).json({
        status: false,
        message: 'Order not found or older than 10 days.',
      });
    }

    return res.status(200).json({
      status: true,
      message: 'Order fetched successfully',
      data: order,
    });
  } catch (error) {
    console.error('Error tracking order:', error);
    return res.status(500).json({
      status: false,
      message: error.message || 'Failed to track order',
    });
  }
};

