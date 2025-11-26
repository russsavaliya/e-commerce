const marketing_spend_model = require("../model/marketing_spend");
const product_model = require("../model/product");

// Helper function to normalize date format (e.g., "1/2024" -> "1/2024", "01/2024" -> "1/2024")
const normalizeDate = (dateString) => {
    if (!dateString) return dateString;
    const parts = dateString.trim().split('/');
    if (parts.length !== 2) return dateString;
    const month = parseInt(parts[0], 10);
    const year = parts[1];
    // Remove leading zero from month if present
    return `${month}/${year}`;
};

exports.create_marketing_spend = async (req, res) => {
    try {
        let { product_id, date, description, amount } = req.body;

        // Validation
        if (!product_id) {
            return res.status(400).json({
                status: false,
                message: "Product ID is required"
            });
        }

        if (!date) {
            return res.status(400).json({
                status: false,
                message: "Date is required"
            });
        }

        if (!amount) {
            return res.status(400).json({
                status: false,
                message: "Amount is required"
            });
        }


        // Normalize date format
        const normalizedDate = normalizeDate(date);

        // Check if marketing spend already exists for this product and date
        // Check both normalized format and original format to catch any existing records
        const existingSpend = await marketing_spend_model.findOne({
            product_id: product_id,
            $or: [
                { date: normalizedDate },
                { date: date.trim() }
            ]
        });

        if (existingSpend) {
            return res.status(400).json({
                status: false,
                message: `Marketing spend already exists for this product in ${date}. Please update the existing entry instead.`
            });
        }

        const marketing_spend = await marketing_spend_model.create({
            product_id: product_id,
            date: normalizedDate, // Store normalized date
            description: description || '',
            amount: amount
        });

        return res.status(201).json({
            status: true,
            message: "Marketing spend created successfully",
            data: marketing_spend
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        });
    }
}

exports.get_marketing_spend_list = async (req, res) => {
    try {
        let { page = 1, limit = 10, search = '', product_id = '', date = '' } = req.query;

        page = parseInt(page);
        limit = parseInt(limit);
        const skip = (page - 1) * limit;

        // Build search condition
        let searchCondition = {};
        
        if (product_id && product_id.trim()) {
            searchCondition.product_id = product_id.trim();
        }

        // Filter by date (month/year)
        if (date && date.trim()) {
            const normalizedDate = normalizeDate(date.trim());
            // Check both normalized and original format
            if (!searchCondition.$and) {
                searchCondition.$and = [];
            }
            searchCondition.$and.push({
                $or: [
                    { date: normalizedDate },
                    { date: date.trim() }
                ]
            });
        }

        // Search condition
        if (search && search.trim()) {
            const searchRegex = { $regex: search.trim(), $options: 'i' };
            const searchOrCondition = {
                $or: [
                    { description: searchRegex },
                    { amount: searchRegex },
                    { date: searchRegex }
                ]
            };
            
            if (searchCondition.$and) {
                searchCondition.$and.push(searchOrCondition);
            } else {
                searchCondition.$or = searchOrCondition.$or;
            }
        }

        const marketing_spends = await marketing_spend_model
            .find(searchCondition)
            .populate('product_id', 'name SKU')
            .sort({ date: -1, createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total_count = await marketing_spend_model.countDocuments(searchCondition);
        const total_pages = Math.ceil(total_count / limit);

        return res.status(200).json({
            status: true,
            message: "Marketing spend list fetched successfully",
            data: {
                marketing_spends,
                total_count,
                total_pages,
                page,
                limit,
            }
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        });
    }
}

exports.get_marketing_spend_one = async (req, res) => {
    try {
        const { id } = req.params;

        const marketing_spend = await marketing_spend_model
            .findById(id)
            .populate('product_id', 'name SKU');

        if (!marketing_spend) {
            return res.status(404).json({
                status: false,
                message: "Marketing spend not found"
            });
        }

        return res.status(200).json({
            status: true,
            message: "Marketing spend fetched successfully",
            data: marketing_spend
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        });
    }
}

exports.update_marketing_spend = async (req, res) => {
    try {
        const { id } = req.params;
        let { product_id, date, description, amount } = req.body;

        const marketing_spend = await marketing_spend_model.findById(id);

        if (!marketing_spend) {
            return res.status(404).json({
                status: false,
                message: "Marketing spend not found"
            });
        }

        // Determine final product_id and date for duplicate check
        const finalProductId = product_id || marketing_spend.product_id;
        const finalDate = date !== undefined ? normalizeDate(date) : marketing_spend.date;

        // If product_id is being updated, verify it exists
        if (product_id && product_id !== marketing_spend.product_id.toString()) {
            const product = await product_model.findById(product_id);
            if (!product) {
                return res.status(404).json({
                    status: false,
                    message: "Product not found"
                });
            }
        }

        // Check if another marketing spend already exists for this product and date (excluding current record)
        const existingSpend = await marketing_spend_model.findOne({
            product_id: finalProductId,
            $or: [
                { date: finalDate },
                { date: date !== undefined ? date.trim() : marketing_spend.date }
            ],
            _id: { $ne: id } // Exclude current record
        });

        if (existingSpend) {
            return res.status(400).json({
                status: false,
                message: `Marketing spend already exists for this product in ${finalDate}. Please update the existing entry instead.`
            });
        }

        // Update fields
        if (product_id) marketing_spend.product_id = product_id;
        if (date !== undefined) marketing_spend.date = finalDate; // Store normalized date
        if (description !== undefined) marketing_spend.description = description;
        if (amount !== undefined) marketing_spend.amount = amount;

        await marketing_spend.save();

        return res.status(200).json({
            status: true,
            message: "Marketing spend updated successfully",
            data: marketing_spend
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        });
    }
}

exports.delete_marketing_spend = async (req, res) => {
    try {
        const { id } = req.params;

        const marketing_spend = await marketing_spend_model.findById(id);

        if (!marketing_spend) {
            return res.status(404).json({
                status: false,
                message: "Marketing spend not found"
            });
        }

        await marketing_spend_model.findByIdAndDelete(id);

        return res.status(200).json({
            status: true,
            message: "Marketing spend deleted successfully"
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        });
    }
}

