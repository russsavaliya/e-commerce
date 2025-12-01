const banner_model = require("../../model/banner");

// User: Get Active Banners by Position
// Used for homepage hero, category strip, etc.
exports.get_active_banners = async (req, res) => {
    try {
        const { position } = req.query;

        // Build query
        const query = { is_active: true };
        if (position) {
            query.position = position;
        }

        const banners = await banner_model.find(query)
            .populate('category', 'name') // so FE knows which category banner belongs to
            .sort({ order: 1, createdAt: -1 })
            .select('image_url title position order category');

        return res.status(200).json({
            status: true,
            message: "Active banners fetched successfully",
            data: banners
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: error.message
        });
    }
};

