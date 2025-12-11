let mongoose = require('mongoose');
let schema = mongoose.Schema;

let field = new schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    unique: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  shipping_address: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    landmark: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
  },
  orders: [
    {
      type: String, // store order_id for quick lookup
    },
  ],
}, {
  timestamps: true,
});

field.index({ email: 1 }, { unique: true });

let customerModel = mongoose.model('customer', field);
module.exports = customerModel;

