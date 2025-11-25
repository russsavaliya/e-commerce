const category_model = require("../model/category");
exports.create_category = async (req, res) => {
    try {
        let { name, parent_category_id } = req.body;
        let exist_category = await category_model.findOne({ name: name });
        if (exist_category) {
            return res.status(400).json({
                status: false,
                message: "Category already exists"
            });
        }
        const category = await category_model.create({
            name: name,
            parent_category_id: parent_category_id
        });
        return res.status(201).json({
            status: true,
            message: "Category created successfully",
            data: category
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        });
    }
}
exports.get_category_list = async (req, res) => {
    try {
        let { page = 1, limit = 10, search = '' } = req.query;

        page = parseInt(page);
        limit = parseInt(limit);
        const skip = (page - 1) * limit;

        // Build search condition
        let searchCondition = {};
        if (search && search.trim()) {
            searchCondition = {
                name: { $regex: search.trim(), $options: 'i' }
            };
        }

        const exist_category = await category_model.find(searchCondition).populate("parent_category_id").skip(skip).limit(limit);

        const total_count = await category_model.countDocuments(searchCondition);
        const total_pages = Math.ceil(total_count / limit);

        return res.status(200).json({
            status: true,
            message: "Category list fetched successfully",
            data: {
                exist_category,
                total_count,
                total_pages,
                page,
                limit
            }
        });

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        });
    }
}
exports.delete_category = async (req, res) => {
    try {
        let { id } = req.query;

        const result = await category_model.findByIdAndDelete(id);

        return res.status(200).json({
            status: true,
            message: "Category deleted successfully",
            data: result
        });

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        });
    }
}

exports.update_category = async (req, res) => {
    try {
        let { id } = req.query;
        let { name, parent_category_id } = req.body;
        let exist_category = await category_model.findOne({ name: name, _id: { $ne: id } });
        if (exist_category) {
            return res.status(400).json({
                status: false,
                message: "Category already exists"
            });
        }
        const category = await category_model.findByIdAndUpdate(id, {
            name: name,
            parent_category_id: parent_category_id
        });
        return res.status(200).json({
            status: true,
            message: "Category updated successfully",
            data: category
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        });
    }
}
