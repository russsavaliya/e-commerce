const category_model = require("../../model/category");

// User: Get Categories List (for filters)
exports.get_categories_list = async (req, res) => {
    try {
        const categories = await category_model.find({})
            .select('name _id')
            .sort({ name: 1 });

        return res.status(200).json({
            status: true,
            message: "Categories fetched successfully",
            data: categories
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: error.message
        });
    }
};

