const coupon_model = require('../model/coupon');

/**
 * Admin: Create Coupon
 * POST /coupons
 */
exports.create_coupon = async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      minOrderValue,
      maxDiscountAmount,
      usageLimit,
      validFrom,
      validTill,
      isActive,
      showOnUserSide,
      applicableToCOD,
      applicableToOnline
    } = req.body;

    // Validation
    if (!code || !code.trim()) {
      return res.status(400).json({
        status: false,
        message: 'Coupon code is required',
      });
    }

    if (!discountType || !['percentage', 'flat'].includes(discountType)) {
      return res.status(400).json({
        status: false,
        message: 'Discount type must be either "percentage" or "flat"',
      });
    }

    if (discountValue === undefined || discountValue === null || discountValue < 0) {
      return res.status(400).json({
        status: false,
        message: 'Discount value is required and must be non-negative',
      });
    }

    if (discountType === 'percentage' && (discountValue < 0 || discountValue > 100)) {
      return res.status(400).json({
        status: false,
        message: 'Percentage discount must be between 0 and 100',
      });
    }

    if (minOrderValue === undefined || minOrderValue === null || minOrderValue < 0) {
      return res.status(400).json({
        status: false,
        message: 'Minimum order value is required and must be non-negative',
      });
    }

    if (usageLimit === undefined || usageLimit === null || usageLimit < 0) {
      return res.status(400).json({
        status: false,
        message: 'Usage limit is required and must be non-negative',
      });
    }

    if (!validFrom || !validTill) {
      return res.status(400).json({
        status: false,
        message: 'Valid from and valid till dates are required',
      });
    }

    const validFromDate = new Date(validFrom);
    const validTillDate = new Date(validTill);

    if (validTillDate < validFromDate) {
      return res.status(400).json({
        status: false,
        message: 'Valid till date must be after valid from date',
      });
    }

    // Check if coupon code already exists
    const existingCoupon = await coupon_model.findOne({ code: code.toUpperCase().trim() });
    if (existingCoupon) {
      return res.status(400).json({
        status: false,
        message: 'Coupon code already exists',
      });
    }

    // Validate payment method restrictions
    const codApplicable = applicableToCOD !== undefined ? (applicableToCOD === true || applicableToCOD === 'true') : true;
    const onlineApplicable = applicableToOnline !== undefined ? (applicableToOnline === true || applicableToOnline === 'true') : true;

    // At least one payment method must be selected
    if (!codApplicable && !onlineApplicable) {
      return res.status(400).json({
        status: false,
        message: 'Coupon must be applicable to at least one payment method (COD or Online)',
      });
    }

    // Create coupon
    const coupon = await coupon_model.create({
      code: code.toUpperCase().trim(),
      description: description || '',
      discountType,
      discountValue: Number(discountValue),
      minOrderValue: Number(minOrderValue),
      maxDiscountAmount: maxDiscountAmount !== undefined && maxDiscountAmount !== null ? Number(maxDiscountAmount) : null,
      usageLimit: Number(usageLimit),
      usedCount: 0,
      validFrom: validFromDate,
      validTill: validTillDate,
      isActive: isActive !== undefined ? (isActive === true || isActive === 'true') : true,
      showOnUserSide: showOnUserSide !== undefined ? (showOnUserSide === true || showOnUserSide === 'true') : false,
      applicableToCOD: codApplicable,
      applicableToOnline: onlineApplicable,
    });

    return res.status(201).json({
      status: true,
      message: 'Coupon created successfully',
      data: coupon,
    });
  } catch (error) {
    console.error('Error creating coupon:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        status: false,
        message: 'Coupon code already exists',
      });
    }
    return res.status(500).json({
      status: false,
      message: error.message || 'Failed to create coupon',
    });
  }
};

/**
 * Admin: Get All Coupons
 * GET /coupons/list
 */
exports.get_coupon_list = async (req, res) => {
  try {
    const coupons = await coupon_model.find({}).sort({ createdAt: -1 }).lean();

    return res.status(200).json({
      status: true,
      message: 'Coupons fetched successfully',
      data: coupons,
    });
  } catch (error) {
    console.error('Error fetching coupons:', error);
    return res.status(500).json({
      status: false,
      message: error.message || 'Failed to fetch coupons',
    });
  }
};

/**
 * Admin: Get Coupon by ID
 * GET /coupons/get-one?coupon_id=xxx
 */
exports.get_coupon_one = async (req, res) => {
  try {
    const { coupon_id } = req.query;

    if (!coupon_id) {
      return res.status(400).json({
        status: false,
        message: 'Coupon ID is required',
      });
    }

    const coupon = await coupon_model.findById(coupon_id);

    if (!coupon) {
      return res.status(404).json({
        status: false,
        message: 'Coupon not found',
      });
    }

    return res.status(200).json({
      status: true,
      message: 'Coupon fetched successfully',
      data: coupon,
    });
  } catch (error) {
    console.error('Error fetching coupon:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        status: false,
        message: 'Invalid coupon ID',
      });
    }
    return res.status(500).json({
      status: false,
      message: error.message || 'Failed to fetch coupon',
    });
  }
};

/**
 * Admin: Update Coupon
 * PUT /coupons/update?coupon_id=xxx
 */
exports.update_coupon = async (req, res) => {
  try {
    const { coupon_id } = req.query;
    const {
      code,
      description,
      discountType,
      discountValue,
      minOrderValue,
      maxDiscountAmount,
      usageLimit,
      validFrom,
      validTill,
      isActive,
      showOnUserSide,
    } = req.body;

    if (!coupon_id) {
      return res.status(400).json({
        status: false,
        message: 'Coupon ID is required',
      });
    }

    const coupon = await coupon_model.findById(coupon_id);
    if (!coupon) {
      return res.status(404).json({
        status: false,
        message: 'Coupon not found',
      });
    }

    // Build update object
    const updateData = {};

    if (code !== undefined && code.trim()) {
      // Check if new code conflicts with existing coupon
      const existingCoupon = await coupon_model.findOne({
        code: code.toUpperCase().trim(),
        _id: { $ne: coupon_id },
      });
      if (existingCoupon) {
        return res.status(400).json({
          status: false,
          message: 'Coupon code already exists',
        });
      }
      updateData.code = code.toUpperCase().trim();
    }

    if (description !== undefined) {
      updateData.description = description;
    }

    if (discountType !== undefined) {
      if (!['percentage', 'flat'].includes(discountType)) {
        return res.status(400).json({
          status: false,
          message: 'Discount type must be either "percentage" or "flat"',
        });
      }
      updateData.discountType = discountType;
    }

    if (discountValue !== undefined) {
      if (discountValue < 0) {
        return res.status(400).json({
          status: false,
          message: 'Discount value cannot be negative',
        });
      }
      updateData.discountValue = Number(discountValue);
    }

    if (minOrderValue !== undefined) {
      if (minOrderValue < 0) {
        return res.status(400).json({
          status: false,
          message: 'Minimum order value cannot be negative',
        });
      }
      updateData.minOrderValue = Number(minOrderValue);
    }

    if (maxDiscountAmount !== undefined) {
      updateData.maxDiscountAmount = maxDiscountAmount !== null && maxDiscountAmount !== '' ? Number(maxDiscountAmount) : null;
    }

    if (usageLimit !== undefined) {
      if (usageLimit < 0) {
        return res.status(400).json({
          status: false,
          message: 'Usage limit cannot be negative',
        });
      }
      if (usageLimit < coupon.usedCount) {
        return res.status(400).json({
          status: false,
          message: 'Usage limit cannot be less than current used count',
        });
      }
      updateData.usageLimit = Number(usageLimit);
    }

    if (validFrom !== undefined) {
      updateData.validFrom = new Date(validFrom);
    }

    if (validTill !== undefined) {
      updateData.validTill = new Date(validTill);
    }

    // Validate date range
    const finalValidFrom = updateData.validFrom || coupon.validFrom;
    const finalValidTill = updateData.validTill || coupon.validTill;
    if (finalValidTill < finalValidFrom) {
      return res.status(400).json({
        status: false,
        message: 'Valid till date must be after valid from date',
      });
    }

    // Validate percentage discount
    const finalDiscountType = updateData.discountType || coupon.discountType;
    const finalDiscountValue = updateData.discountValue !== undefined ? updateData.discountValue : coupon.discountValue;
    if (finalDiscountType === 'percentage' && (finalDiscountValue < 0 || finalDiscountValue > 100)) {
      return res.status(400).json({
        status: false,
        message: 'Percentage discount must be between 0 and 100',
      });
    }

    if (isActive !== undefined) {
      updateData.isActive = isActive === true || isActive === 'true';
    }

    if (showOnUserSide !== undefined) {
      updateData.showOnUserSide = showOnUserSide === true || showOnUserSide === 'true';
    }

    if (applicableToCOD !== undefined) {
      updateData.applicableToCOD = applicableToCOD === true || applicableToCOD === 'true';
    }

    if (applicableToOnline !== undefined) {
      updateData.applicableToOnline = applicableToOnline === true || applicableToOnline === 'true';
    }

    // Validate payment method restrictions
    const finalCodApplicable = updateData.applicableToCOD !== undefined ? updateData.applicableToCOD : coupon.applicableToCOD;
    const finalOnlineApplicable = updateData.applicableToOnline !== undefined ? updateData.applicableToOnline : coupon.applicableToOnline;

    if (!finalCodApplicable && !finalOnlineApplicable) {
      return res.status(400).json({
        status: false,
        message: 'Coupon must be applicable to at least one payment method (COD or Online)',
      });
    }

    // Update coupon
    const updatedCoupon = await coupon_model.findByIdAndUpdate(
      coupon_id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      status: true,
      message: 'Coupon updated successfully',
      data: updatedCoupon,
    });
  } catch (error) {
    console.error('Error updating coupon:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        status: false,
        message: 'Coupon code already exists',
      });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({
        status: false,
        message: 'Invalid coupon ID',
      });
    }
    return res.status(500).json({
      status: false,
      message: error.message || 'Failed to update coupon',
    });
  }
};

/**
 * Admin: Delete/Disable Coupon
 * DELETE /coupons/delete?coupon_id=xxx
 */
exports.delete_coupon = async (req, res) => {
  try {
    const { coupon_id } = req.query;

    if (!coupon_id) {
      return res.status(400).json({
        status: false,
        message: 'Coupon ID is required',
      });
    }

    const coupon = await coupon_model.findById(coupon_id);
    if (!coupon) {
      return res.status(404).json({
        status: false,
        message: 'Coupon not found',
      });
    }

    // Instead of deleting, just disable it
    coupon.isActive = false;
    await coupon.save();

    return res.status(200).json({
      status: true,
      message: 'Coupon disabled successfully',
      data: coupon,
    });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        status: false,
        message: 'Invalid coupon ID',
      });
    }
    return res.status(500).json({
      status: false,
      message: error.message || 'Failed to delete coupon',
    });
  }
};

