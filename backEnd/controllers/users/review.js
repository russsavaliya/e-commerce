const mongoose = require('mongoose');
const review_model = require('../../model/review');
const product_model = require('../../model/product');

/**
 * Add a new review for a product
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

    const productExists = await product_model.exists({
      _id: new mongoose.Types.ObjectId(productId),
      status: 'ACTIVE',
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
 * Get reviews for a product with pagination
 * Query: productId (required), page=1, limit=5
 */
exports.get_reviews = async (req, res) => {
  try {
    let { productId, page = 1, limit = 5 } = req.query || {};

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        status: false,
        message: 'Valid productId is required',
      });
    }

    page = parseInt(page, 10) || 1;
    limit = parseInt(limit, 10) || 5;
    const skip = (page - 1) * limit;

    const [reviews, total_count, avgStats, perRatingStats] = await Promise.all([
      review_model
        .find({ product: productId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      review_model.countDocuments({ product: productId }),
      review_model.aggregate([
        { $match: { product: new mongoose.Types.ObjectId(productId) } },
        {
          $group: {
            _id: null,
            avgRating: { $avg: '$rating' },
            count: { $sum: 1 },
          },
        },
      ]),
      review_model.aggregate([
        { $match: { product: new mongoose.Types.ObjectId(productId) } },
        {
          $group: {
            _id: '$rating',
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const total_pages = Math.ceil(total_count / limit) || 1;
    const baseSummary = avgStats[0]
      ? {
          average: Number(avgStats[0].avgRating.toFixed(1)),
          count: avgStats[0].count,
        }
      : { average: 0, count: 0 };

    const perRating = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    perRatingStats.forEach((row) => {
      if (row && row._id >= 1 && row._id <= 5) {
        perRating[row._id] = row.count || 0;
      }
    });

    const ratingSummary = {
      ...baseSummary,
      perRating,
    };

    return res.status(200).json({
      status: true,
      message: 'Reviews fetched successfully',
      data: {
        reviews,
        total_count,
        total_pages,
        page,
        limit,
        ratingSummary,
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


