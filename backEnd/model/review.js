const mongoose = require('mongoose');
const schema = mongoose.Schema;

const reviewSchema = new schema(
  {
    product: {
      type: mongoose.Types.ObjectId,
      ref: 'product',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    added_by: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  },
  {
    timestamps: true,
  }
);

const reviewModel = mongoose.model('review', reviewSchema);
module.exports = reviewModel;


