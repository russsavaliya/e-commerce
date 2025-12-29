const category_model = require("../../model/category");

// User: Get Categories List (for filters)
exports.get_categories_list = async (req, res) => {
    try {
        const categories = await category_model.find({})
            .select('name _id parent_category_id')
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

// User: Get Categories Grouped by Parent (for mega-menu)
exports.get_categories_grouped = async (req, res) => {
    try {
        // Fetch all categories
        const allCategories = await category_model.find({})
            .select('name _id parent_category_id')
            .sort({ name: 1 });

        // Separate parent and child categories
        const parentCategories = [];
        const childrenMap = new Map(); // parent_id -> [children]

        allCategories.forEach(category => {
            const categoryData = {
                _id: category._id,
                name: category.name,
            };

            if (!category.parent_category_id) {
                // Parent category
                parentCategories.push(categoryData);
            } else {
                // Child category
                const parentId = category.parent_category_id.toString();
                if (!childrenMap.has(parentId)) {
                    childrenMap.set(parentId, []);
                }
                childrenMap.get(parentId).push(categoryData);
            }
        });

        // Attach children to their parents
        const groupedCategories = parentCategories.map(parent => ({
            ...parent,
            children: childrenMap.get(parent._id.toString()) || []
        }));

        return res.status(200).json({
            status: true,
            message: "Categories grouped successfully",
            data: groupedCategories
        });
    } catch (error) {
        console.error('Error fetching grouped categories:', error);
        return res.status(500).json({
            status: false,
            message: error.message || 'Failed to fetch grouped categories'
        });
    }
};

