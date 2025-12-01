const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema({
    image_url: {
        type: String,
        required: [true, "Banner image is required"]
    },
    title: {
        type: String,
        default: ""
    },
    // Where this banner will be shown on the site
    position: {
        type: String,
        enum: [
            'homepage_hero',
            'homepage_middle',
            'homepage_bottom',
            // Horizontal curved strip cards on homepage (e.g. Haldi, Marriage, etc.)
            'homepage_category_strip',
            'category_page',
            'product_page'
        ],
        default: 'homepage_hero',
        required: true
    },
    // Optional category linked with this banner (for category strip / category specific banners)
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "category",
        default: null
    },
    order: {
        type: Number,
        default: 0
    },
    is_active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const Banner = mongoose.model("banner", bannerSchema);
module.exports = Banner;

