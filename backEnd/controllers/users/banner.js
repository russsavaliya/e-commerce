const banner_model = require("../../model/banner");

// User: Get Active Banners by Position
// Used for homepage hero, category strip, etc.
exports.get_active_banners = async (req, res) => {
    try {
        const { position, homepage } = req.query;

        // If homepage=true, fetch all homepage banners in one query and group by position
        if (homepage === 'true') {
            const homepagePositions = [
                'homepage_hero',
                'homepage_category_strip',
                'homepage_middle',
                'homepage_bottom'
            ];

            const banners = await banner_model.find({
                is_active: true,
                position: { $in: homepagePositions }
            })
                .populate('category', 'name')
                .sort({ position: 1, order: 1, createdAt: -1 })
                .select('image_url title position order category');

            // Group banners by position
            const groupedBanners = {
                homepage_hero: [],
                homepage_category_strip: [],
                homepage_middle: [],
                homepage_bottom: []
            };

            banners.forEach(banner => {
                if (groupedBanners[banner.position]) {
                    groupedBanners[banner.position].push(banner);
                }
            });

            return res.status(200).json({
                status: true,
                message: "Homepage banners fetched successfully",
                data: groupedBanners
            });
        }

        // Original logic for single position query
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

