const coupon_model = require('../../model/coupon');

/**
 * User: Get Available Coupons
 * GET /coupons/available?paymentMethod=cod|online
 * Returns only coupons that are:
 * - isActive = true
 * - showOnUserSide = true
 * - current date within valid range
 * - applicable to the specified payment method (if provided)
 */
exports.get_available_coupons = async (req, res) => {
  try {
    const { paymentMethod } = req.query;
    const now = new Date();

    // Build query
    const query = {
      isActive: true,
      showOnUserSide: true,
      validFrom: { $lte: now },
      validTill: { $gte: now },
      $expr: { $lt: ['$usedCount', '$usageLimit'] }, // usageLimit not exceeded
    };

    // Filter by payment method if provided
    if (paymentMethod === 'cod') {
      query.applicableToCOD = true;
    } else if (paymentMethod === 'online') {
      query.applicableToOnline = true;
    }
    // If paymentMethod is not provided or invalid, return coupons applicable to both

    const coupons = await coupon_model.find(query)
      .select('code description discountType discountValue minOrderValue maxDiscountAmount validTill applicableToCOD applicableToOnline')
      .sort({ createdAt: -1 })
      .lean();

    // Format coupons for frontend
    const formattedCoupons = coupons.map(coupon => {
      let discountText = '';
      if (coupon.discountType === 'percentage') {
        discountText = `${coupon.discountValue}% OFF`;
      } else {
        discountText = `₹${coupon.discountValue} OFF`;
      }

      return {
        _id: coupon._id,
        code: coupon.code,
        description: coupon.description,
        discountText,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minOrderValue: coupon.minOrderValue,
        maxDiscountAmount: coupon.maxDiscountAmount,
        validTill: coupon.validTill,
        applicableToCOD: coupon.applicableToCOD,
        applicableToOnline: coupon.applicableToOnline,
      };
    });

    return res.status(200).json({
      status: true,
      message: 'Available coupons fetched successfully',
      data: formattedCoupons,
    });
  } catch (error) {
    console.error('Error fetching available coupons:', error);
    return res.status(500).json({
      status: false,
      message: error.message || 'Failed to fetch available coupons',
    });
  }
};

/**
 * User: Apply Coupon
 * POST /coupons/apply
 * Validates coupon and returns discount amount (no order creation)
 * Body: { code: string, cartTotal: number, paymentMethod: string (optional) }
 */
exports.apply_coupon = async (req, res) => {
  try {
    const { code, cartTotal, paymentMethod } = req.body;

    // Validation
    if (!code || !code.trim()) {
      return res.status(400).json({
        status: false,
        message: 'Coupon code is required',
      });
    }

    if (cartTotal === undefined || cartTotal === null || cartTotal < 0) {
      return res.status(400).json({
        status: false,
        message: 'Cart total is required and must be non-negative',
      });
    }

    // Find coupon
    const coupon = await coupon_model.findOne({ code: code.toUpperCase().trim() });

    if (!coupon) {
      return res.status(404).json({
        status: false,
        message: 'Invalid coupon code',
      });
    }

    // Check if coupon is active
    if (!coupon.isActive) {
      return res.status(400).json({
        status: false,
        message: 'This coupon is no longer active',
      });
    }

    // Check date validity
    const now = new Date();
    if (now < coupon.validFrom) {
      return res.status(400).json({
        status: false,
        message: 'This coupon is not yet valid',
      });
    }

    if (now > coupon.validTill) {
      return res.status(400).json({
        status: false,
        message: 'This coupon has expired',
      });
    }

    // Check usage limit
    if (coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({
        status: false,
        message: 'This coupon has reached its usage limit',
      });
    }

    // Check minimum order value
    if (cartTotal < coupon.minOrderValue) {
      return res.status(400).json({
        status: false,
        message: `Minimum order value of ₹${coupon.minOrderValue} is required to use this coupon`,
      });
    }

    // Check payment method compatibility
    if (paymentMethod) {
      if (paymentMethod === 'cod' && !coupon.applicableToCOD) {
        return res.status(400).json({
          status: false,
          message: 'This coupon is not applicable for Cash on Delivery orders',
        });
      }
      if (paymentMethod === 'online' && !coupon.applicableToOnline) {
        return res.status(400).json({
          status: false,
          message: 'This coupon is not applicable for online payments',
        });
      }
    }

    // Calculate discount amount
    let discountAmount = 0;

    if (coupon.discountType === 'percentage') {
      discountAmount = (cartTotal * coupon.discountValue) / 100;
      // Apply max discount limit if set
      if (coupon.maxDiscountAmount !== null && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else {
      // Flat discount
      discountAmount = coupon.discountValue;
      // Ensure discount doesn't exceed cart total
      if (discountAmount > cartTotal) {
        discountAmount = cartTotal;
      }
    }

    // Final payable amount
    const finalAmount = Math.max(0, cartTotal - discountAmount);

    return res.status(200).json({
      status: true,
      message: 'Coupon applied successfully',
      data: {
        couponCode: coupon.code,
        couponId: coupon._id,
        discountAmount: Math.round(discountAmount * 100) / 100, // Round to 2 decimal places
        cartTotal: cartTotal,
        finalAmount: Math.round(finalAmount * 100) / 100,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
    });
  } catch (error) {
    console.error('Error applying coupon:', error);
    return res.status(500).json({
      status: false,
      message: error.message || 'Failed to apply coupon',
    });
  }
};

