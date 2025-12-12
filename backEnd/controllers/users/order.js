const product_model = require('../../model/product');
const order_model = require('../../model/order');
const customer_controller = require('./customer');

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
      const variant = product.variants?.find(v => v._id.toString() === item.variantId);
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
 * Step 1: Create order + customer right after shipping details (before payment).
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
    const total_amount = subtotal + shipping_amount + total_tax;

    const orderPayload = {
      order_id: `ORD-${Date.now()}`,
      products: items,
      sub_total: subtotal,
      shipping_amount,
      total_tax,
      total_amount,
      payment_method: 'cod', // default; will be updated in payment step
      payment_status: 'pending',
      order_status: 'pending',
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
    };

    const order = await order_model.create(orderPayload);

    // Create/Update customer and attach order_id
    await customer_controller.upsert_from_shipping(order.shipping_address, order.order_id);

    // Clear cart after order creation to avoid duplicate orders
    req.session.cart = [];

    return res.status(201).json({
      status: true,
      message: 'Order created. Proceed to payment step.',
      data: {
        order_id: order.order_id,
        total_amount: order.total_amount,
        order_status: order.order_status,
      },
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return res.status(500).json({
      status: false,
      message: error.message || 'Failed to create order',
    });
  }
};

/**
 * Step 2: Payment selection / status update (no real gateway for now).
 */
exports.update_payment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { payment_method = 'cod' } = req.body || {};

    if (!allowedPaymentMethods.includes(payment_method)) {
      return res.status(400).json({
        status: false,
        message: 'Invalid payment method.',
      });
    }

    const order = await order_model.findOneAndUpdate(
      { order_id: orderId },
      {
        $set: {
          payment_method,
          payment_status: 'pending',
          // Keep order_status as 'pending' - admin will update it step by step
          order_status: 'pending',
        },
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        status: false,
        message: 'Order not found.',
      });
    }

    return res.status(200).json({
      status: true,
      message: 'Payment option saved for order.',
      data: {
        order_id: order.order_id,
        order_status: order.order_status,
        payment_method: order.payment_method,
        payment_status: order.payment_status,
      },
    });
  } catch (error) {
    console.error('Error updating payment:', error);
    return res.status(500).json({
      status: false,
      message: error.message || 'Failed to update payment',
    });
  }
};
