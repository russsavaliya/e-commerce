const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Coupon code is required'],
    unique: true,
    uppercase: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  discountType: {
    type: String,
    enum: ['percentage', 'flat'],
    required: [true, 'Discount type is required'],
  },
  discountValue: {
    type: Number,
    required: [true, 'Discount value is required'],
    min: [0, 'Discount value cannot be negative'],
  },
  minOrderValue: {
    type: Number,
    required: [true, 'Minimum order value is required'],
    min: [0, 'Minimum order value cannot be negative'],
  },
  maxDiscountAmount: {
    type: Number,
    default: null, // null means no limit for percentage discounts
    min: [0, 'Max discount amount cannot be negative'],
  },
  usageLimit: {
    type: Number,
    required: [true, 'Usage limit is required'],
    min: [0, 'Usage limit cannot be negative'],
  },
  usedCount: {
    type: Number,
    default: 0,
    min: [0, 'Used count cannot be negative'],
  },
  validFrom: {
    type: Date,
    required: [true, 'Valid from date is required'],
  },
  validTill: {
    type: Date,
    required: [true, 'Valid till date is required'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  showOnUserSide: {
    type: Boolean,
    default: false,
  },
  applicableToCOD: {
    type: Boolean,
    default: true, // Default to true for backward compatibility
  },
  applicableToOnline: {
    type: Boolean,
    default: true, // Default to true for backward compatibility
  },
}, {
  timestamps: true,
});

// Index for faster queries
couponSchema.index({ code: 1 });
couponSchema.index({ isActive: 1, showOnUserSide: 1, validFrom: 1, validTill: 1 });

// Validation: validTill should be after validFrom
couponSchema.pre('save', function(next) {
  if (this.validTill && this.validFrom && this.validTill < this.validFrom) {
    return next(new Error('Valid till date must be after valid from date'));
  }
  next();
});

// Validation: For percentage discounts, discountValue should be between 0 and 100
couponSchema.pre('save', function(next) {
  if (this.discountType === 'percentage' && (this.discountValue < 0 || this.discountValue > 100)) {
    return next(new Error('Percentage discount must be between 0 and 100'));
  }
  next();
});

const Coupon = mongoose.model('coupon', couponSchema);
module.exports = Coupon;

