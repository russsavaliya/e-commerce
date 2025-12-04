const product_model = require("../../model/product");
const mongoose = require("mongoose");

// User: Get products by Category
exports.get_products_by_category = async (req, res) => {
    try {
        let { category_id, page = 1, limit = 20 } = req.query;

        if (!category_id) {
            return res.status(400).json({
                status: false,
                message: "category_id is required"
            });
        }

        page = parseInt(page);
        limit = parseInt(limit);
        const skip = (page - 1) * limit;

        const query = {
            category: category_id,
            status: 'ACTIVE'
        };

        const [products, total_count] = await Promise.all([
            product_model.find(query)
                .populate('category', 'name')
                .select('name SKU images selling_price original_price discount_percentage is_best_seller is_new is_trending')
                .sort({ sort_order: 1, createdAt: -1 })
                .skip(skip)
                .limit(limit),
            product_model.countDocuments(query)
        ]);

        const total_pages = Math.ceil(total_count / limit);

        return res.status(200).json({
            status: true,
            message: "Products fetched successfully",
            data: {
                products,
                total_count,
                total_pages,
                page,
                limit
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: error.message
        });
    }
};

// User: Get Bestseller Products
exports.get_bestseller_products = async (req, res) => {
    try {
        let { limit = 12 } = req.query;
        limit = parseInt(limit);

        const products = await product_model.find({ 
            is_best_seller: true,
            status: 'ACTIVE'
        })
        .populate('category', 'name')
        .select('name SKU images selling_price original_price discount_percentage is_best_seller is_new is_trending')
        .sort({ sort_order: 1, createdAt: -1 })
        .limit(limit);

        return res.status(200).json({
            status: true,
            message: "Bestseller products fetched successfully",
            data: products
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: error.message
        });
    }
};

// User: Get Trending Products
exports.get_trending_products = async (req, res) => {
    try {
        let { limit = 12 } = req.query;
        limit = parseInt(limit);

        const products = await product_model.find({ 
            is_trending: true,
            status: 'ACTIVE'
        })
        .populate('category', 'name')
        .select('name SKU images selling_price original_price discount_percentage is_best_seller is_new is_trending')
        .sort({ sort_order: 1, createdAt: -1 })
        .limit(limit);

        return res.status(200).json({
            status: true,
            message: "Trending products fetched successfully",
            data: products
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: error.message
        });
    }
};

// User: Get All Products with Filters and Pagination
exports.get_all_products = async (req, res) => {
    try {
        let { 
            page = 1, 
            limit = 20,
            category_id,
            min_price,
            max_price,
            attribute_id,
            attribute_value_id,
            sort_by = 'createdAt',
            sort_order = 'desc'
        } = req.query;

        page = parseInt(page);
        limit = parseInt(limit);
        const skip = (page - 1) * limit;

        // Build query
        const query = {
            status: 'ACTIVE'
        };

        // Category filter
        if (category_id) {
            query.category = category_id;
        }

        // Price filter
        if (min_price || max_price) {
            query.selling_price = {};
            if (min_price) {
                query.selling_price.$gte = parseFloat(min_price);
            }
            if (max_price) {
                query.selling_price.$lte = parseFloat(max_price);
            }
        }

        // Attribute filter - using $elemMatch for array filtering
        if (attribute_id && attribute_value_id) {
            query.attributes = {
                $elemMatch: {
                    attributeId: new mongoose.Types.ObjectId(attribute_id),
                    attributeValuesIds: new mongoose.Types.ObjectId(attribute_value_id)
                }
            };
        } else if (attribute_id) {
            // If only attribute_id is provided, filter by attribute only
            query.attributes = {
                $elemMatch: {
                    attributeId: new mongoose.Types.ObjectId(attribute_id)
                }
            };
        }

        // Sort options
        const sortOptions = {};
        if (sort_by === 'price') {
            sortOptions.selling_price = sort_order === 'asc' ? 1 : -1;
        } else if (sort_by === 'name') {
            sortOptions.name = sort_order === 'asc' ? 1 : -1;
        } else {
            sortOptions.sort_order = 1;
            sortOptions.createdAt = sort_order === 'asc' ? 1 : -1;
        }

        const [products, total_count] = await Promise.all([
            product_model.find(query)
                .populate('category', 'name')
                .populate('attributes.attributeId', 'name')
                .populate('attributes.attributeValuesIds', 'value')
                .select('name SKU images selling_price original_price discount_percentage is_best_seller is_new is_trending category attributes')
                .sort(sortOptions)
                .skip(skip)
                .limit(limit),
            product_model.countDocuments(query)
        ]);

        const total_pages = Math.ceil(total_count / limit);

        return res.status(200).json({
            status: true,
            message: "Products fetched successfully",
            data: {
                products,
                total_count,
                total_pages,
                page,
                limit
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: error.message
        });
    }
};

