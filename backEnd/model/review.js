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
  },
  {
    timestamps: true,
  }
);

const reviewModel = mongoose.model('review', reviewSchema);
module.exports = reviewModel;


