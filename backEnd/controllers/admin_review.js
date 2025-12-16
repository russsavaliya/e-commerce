const mongoose = require('mongoose');
const review_model = require('../model/review');
const product_model = require('../model/product');

/**
 * Get all reviews with pagination and filters (admin)
 * Query: page, limit, search, productId, rating
 */
exports.get_review_list = async (req, res) => {
  try {
    let { page = 1, limit = 10, search = '', productId = '', rating = '' } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;

    // Build match conditions
    const matchConditions = {};

    // Filter by productId
    if (productId && mongoose.Types.ObjectId.isValid(productId)) {
      matchConditions.product = new mongoose.Types.ObjectId(productId);
    }

    // Filter by rating
    if (rating && !isNaN(rating) && rating >= 1 && rating <= 5) {
      matchConditions.rating = parseInt(rating);
    }

    // Search by name, email, or comment
    if (search && search.trim()) {
      matchConditions.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } },
        { comment: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    // Build aggregation pipeline
    const pipeline = [];

    if (Object.keys(matchConditions).length > 0) {
      pipeline.push({ $match: matchConditions });
    }

    // Lookup product details
    pipeline.push({
      $lookup: {
        from: 'products',
        localField: 'product',
        foreignField: '_id',
        as: 'product_details',
      },
    });

    // Unwind product details
    pipeline.push({
      $unwind: {
        path: '$product_details',
        preserveNullAndEmptyArrays: true,
      },
    });

    // Add product name field
    pipeline.push({
      $addFields: {
        product_name: '$product_details.name',
      },
    });

    // Sort by newest first
    pipeline.push({ $sort: { createdAt: -1 } });

    // Use $facet to get both paginated results and total count
    pipeline.push({
      $facet: {
        reviews: [
          { $skip: skip },
          { $limit: limit },
        ],
        totalCount: [
          { $count: 'count' },
        ],
      },
    });

    // Execute aggregation
    const aggregationResult = await review_model.aggregate(pipeline);

    // Extract results
    const result = aggregationResult[0] || { reviews: [], totalCount: [] };
    const reviews = result.reviews || [];
    const total_count = result.totalCount[0]?.count || 0;
    const total_pages = Math.ceil(total_count / limit);

    // Format reviews (remove product_details, keep product_name)
    const formattedReviews = reviews.map((review) => {
      const { product_details, ...rest } = review;
      return rest;
    });

    return res.status(200).json({
      status: true,
      message: 'Review list fetched successfully',
      data: {
        reviews: formattedReviews,
        total_count,
        total_pages,
        page,
        limit,
      },
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return res.status(500).json({
      status: false,
      message: error.message || 'Failed to fetch reviews',
    });
  }
};

/**
 * Add a new review (admin)
 * Body: { productId, name, email?, rating (1-5), comment? }
 */
exports.add_review = async (req, res) => {
  try {
    const { productId, name, email, rating, comment } = req.body || {};

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        status: false,
        message: 'Valid productId is required',
      });
    }

    if (!name || !rating) {
      return res.status(400).json({
        status: false,
        message: 'Name and rating are required',
      });
    }

    const numericRating = Number(rating);
    if (Number.isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({
        status: false,
        message: 'Rating must be between 1 and 5',
      });
    }

    // Check if product exists
    const productExists = await product_model.exists({
      _id: new mongoose.Types.ObjectId(productId),
    });

    if (!productExists) {
      return res.status(404).json({
        status: false,
        message: 'Product not found',
      });
    }

    const review = await review_model.create({
      product: productId,
      name: name.trim(),
      email: email?.trim() || undefined,
      rating: numericRating,
      comment: comment?.trim() || '',
    });

    return res.status(201).json({
      status: true,
      message: 'Review added successfully',
      data: review,
    });
  } catch (error) {
    console.error('Error adding review:', error);
    return res.status(500).json({
      status: false,
      message: error.message || 'Failed to add review',
    });
  }
};

/**
 * Update a review (admin)
 * Params: reviewId
 * Body: { name?, email?, rating?, comment? }
 */
exports.update_review = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { name, email, rating, comment } = req.body || {};

    if (!reviewId || !mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({
        status: false,
        message: 'Valid reviewId is required',
      });
    }

    const updateFields = {};

    if (name !== undefined) {
      updateFields.name = name.trim();
    }

    if (email !== undefined) {
      updateFields.email = email?.trim() || undefined;
    }

    if (rating !== undefined) {
      const numericRating = Number(rating);
      if (Number.isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
        return res.status(400).json({
          status: false,
          message: 'Rating must be between 1 and 5',
        });
      }
      updateFields.rating = numericRating;
    }

    if (comment !== undefined) {
      updateFields.comment = comment?.trim() || '';
    }

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({
        status: false,
        message: 'At least one field is required to update',
      });
    }

    const review = await review_model.findByIdAndUpdate(
      reviewId,
      { $set: updateFields },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({
        status: false,
        message: 'Review not found',
      });
    }

    return res.status(200).json({
      status: true,
      message: 'Review updated successfully',
      data: review,
    });
  } catch (error) {
    console.error('Error updating review:', error);
    return res.status(500).json({
      status: false,
      message: error.message || 'Failed to update review',
    });
  }
};

/**
 * Delete a review (admin)
 * Params: reviewId
 */
exports.delete_review = async (req, res) => {
  try {
    const { reviewId } = req.params;

    if (!reviewId || !mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({
        status: false,
        message: 'Valid reviewId is required',
      });
    }

    const review = await review_model.findByIdAndDelete(reviewId);

    if (!review) {
      return res.status(404).json({
        status: false,
        message: 'Review not found',
      });
    }

    return res.status(200).json({
      status: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    return res.status(500).json({
      status: false,
      message: error.message || 'Failed to delete review',
    });
  }
};

/**
 * Get single review by ID (admin)
 * Params: reviewId
 */
exports.get_review_one = async (req, res) => {
  try {
    const { reviewId } = req.params;

    if (!reviewId || !mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({
        status: false,
        message: 'Valid reviewId is required',
      });
    }

    const review = await review_model.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(reviewId),
        },
      },
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'product_details',
        },
      },
      {
        $unwind: {
          path: '$product_details',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          product_name: '$product_details.name',
        },
      },
    ]);

    if (!review || review.length === 0) {
      return res.status(404).json({
        status: false,
        message: 'Review not found',
      });
    }

    const { product_details, ...formattedReview } = review[0];

    return res.status(200).json({
      status: true,
      message: 'Review fetched successfully',
      data: formattedReview,
    });
  } catch (error) {
    console.error('Error fetching review:', error);
    return res.status(500).json({
      status: false,
      message: error.message || 'Failed to fetch review',
    });
  }
};

