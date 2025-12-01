const banner_model = require("../model/banner");
const { uploadToCloudinary } = require("../helper/cloudinary_upload");

// Admin: Create Banner
exports.create_banner = async (req, res) => {
    try {
        const { title, position, order, is_active, category } = req.body;

        // Check if image is uploaded
        if (!req.file) {
            return res.status(400).json({
                status: false,
                message: "Banner image is required"
            });
        }

        // Upload image to Cloudinary
        let imageUrl = '';
        try {
            const result = await uploadToCloudinary(req.file.buffer, 'banners');
            imageUrl = result.secure_url;
        } catch (error) {
            console.error('Error uploading banner image to Cloudinary:', error);
            return res.status(500).json({
                status: false,
                message: `Failed to upload banner image: ${error.message}`
            });
        }

        // Create banner
        const banner = await banner_model.create({
            image_url: imageUrl,
            title: title || '',
            position: position || 'homepage_hero',
            category: category || null,
            order: order || 0,
            is_active: is_active !== undefined ? (is_active === true || is_active === 'true') : true
        });

        return res.status(201).json({
            status: true,
            message: "Banner created successfully",
            data: banner
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: error.message
        });
    }
};

// Admin: Get All Banners
exports.get_banner_list = async (req, res) => {
    try {
        const banners = await banner_model.find()
            .sort({ order: 1, createdAt: -1 });

        return res.status(200).json({
            status: true,
            message: "Banners fetched successfully",
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

// Admin: Update Banner
exports.update_banner = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, position, order, is_active, existing_image, category } = req.body;

        const existingBanner = await banner_model.findById(id);
        if (!existingBanner) {
            return res.status(404).json({
                status: false,
                message: "Banner not found"
            });
        }

        let imageUrl = existing_image || existingBanner.image_url;

        // If new image is uploaded, upload to Cloudinary
        if (req.file) {
            try {
                const result = await uploadToCloudinary(req.file.buffer, 'banners');
                imageUrl = result.secure_url;
            } catch (error) {
                console.error('Error uploading banner image to Cloudinary:', error);
                return res.status(500).json({
                    status: false,
                    message: `Failed to upload banner image: ${error.message}`
                });
            }
        }

        // Update banner
        const updatedBanner = await banner_model.findByIdAndUpdate(
            id,
            {
                image_url: imageUrl,
                title: title !== undefined ? title : existingBanner.title,
                position: position !== undefined ? position : existingBanner.position,
                category: category !== undefined ? (category || null) : existingBanner.category,
                order: order !== undefined ? order : existingBanner.order,
                is_active: is_active !== undefined ? (is_active === true || is_active === 'true') : existingBanner.is_active
            },
            { new: true, runValidators: true }
        );

        return res.status(200).json({
            status: true,
            message: "Banner updated successfully",
            data: updatedBanner
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: error.message
        });
    }
};

// Admin: Delete Banner
exports.delete_banner = async (req, res) => {
    try {
        const { id } = req.params;

        const banner = await banner_model.findById(id);
        if (!banner) {
            return res.status(404).json({
                status: false,
                message: "Banner not found"
            });
        }

        await banner_model.findByIdAndDelete(id);

        return res.status(200).json({
            status: true,
            message: "Banner deleted successfully"
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: error.message
        });
    }
};

// Admin: Toggle Active Status
exports.toggle_banner_status = async (req, res) => {
    try {
        const { id } = req.params;

        const banner = await banner_model.findById(id);
        if (!banner) {
            return res.status(404).json({
                status: false,
                message: "Banner not found"
            });
        }

        const updatedBanner = await banner_model.findByIdAndUpdate(
            id,
            { is_active: !banner.is_active },
            { new: true }
        );

        return res.status(200).json({
            status: true,
            message: `Banner ${updatedBanner.is_active ? 'activated' : 'deactivated'} successfully`,
            data: updatedBanner
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: error.message
        });
    }
};


