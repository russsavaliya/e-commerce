const customer_model = require('../../model/customer');

/**
 * Create or update customer from order/shipping details.
 * Ensures the order_id is tracked on the customer document.
 */
exports.upsert_from_shipping = async (shipping_address, order_id) => {
  if (!shipping_address?.email || !shipping_address?.fullName) {
    return null;
  }

  const payload = {
    name: shipping_address.fullName,
    email: shipping_address.email.toLowerCase(),
    phone: shipping_address.phone,
    shipping_address,
  };

  const customer = await customer_model.findOneAndUpdate(
    { email: payload.email },
    {
      $set: payload,
      $addToSet: { orders: order_id },
    },
    {
      new: true,
      upsert: true,
    }
  );

  return customer;
};

