const product_model = require("../model/product");
exports.create_product = async (req, res) => {
    try {
        let {
            name,
            SKU,
            description,
            category,
            selling_price,
            original_price,
            cost_price,
            attributes,
            variants
        } = req.body;

        // Parse JSON fields
        attributes = typeof attributes === "string" ? JSON.parse(attributes) : attributes;
        variants = typeof variants === "string" ? JSON.parse(variants) : variants;

        // -----------------------------------------
        // 1️⃣ HANDLE FILES (images + variant_images)
        // -----------------------------------------
        let productImages = [];
        let variantImages = [];

        // Loop all uploaded files
        req.files.forEach(file => {

            // product images
            if (file.fieldname === "images") {
                productImages.push(file.path);
            }

            // variant images: variant_images[0], variant_images[1]
            if (file.fieldname.startsWith("variant_images[")) {
                let index = file.fieldname.match(/\[(\d+)\]/)[1];
                variantImages[index] = file.path;
            }
        });

        // Attach variant image to variant objects
        variants = variants.map((v, i) => ({
            ...v,
            variant_image: variantImages[i] || null   // optional
        }));

        let exist = await product_model.findOne({ SKU });
        if (exist) {
            return res.status(400).json({
                status: false,
                message: "Product SKU already exists"
            });
        }

        const product = await product_model.create({
            name,
            SKU,
            description,
            images: productImages,          // all product images
            category,
            selling_price,
            original_price,
            cost_price,
            attributes,
            variants
        });

        return res.status(201).json({
            status: true,
            message: "Product created successfully",
            data: product
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: error.message
        });
    }
};

exports.update_product = async (req, res) => {
    try {
        const { id } = req.params; // Product ID from URL params

        let {
            name,
            SKU,
            description,
            category,
            selling_price,
            original_price,
            cost_price,
            attributes,
            variants,
            existing_images,           // existing product images (JSON array of URLs)
            existing_variant_images    // existing variant images (JSON array)
        } = req.body;

        // Parse JSON fields
        attributes = typeof attributes === "string" ? JSON.parse(attributes) : attributes;
        variants = typeof variants === "string" ? JSON.parse(variants) : variants;
        existing_images = typeof existing_images === "string" ? JSON.parse(existing_images) : existing_images || [];
        existing_variant_images = typeof existing_variant_images === "string" ? JSON.parse(existing_variant_images) : existing_variant_images || [];

        // -----------------------------------------
        // 1️⃣ CHECK IF PRODUCT EXISTS
        // -----------------------------------------
        const existingProduct = await product_model.findById(id);
        if (!existingProduct) {
            return res.status(404).json({
                status: false,
                message: "Product not found"
            });
        }

        // Check SKU uniqueness (if SKU is being changed)
        if (SKU && SKU !== existingProduct.SKU) {
            const skuExists = await product_model.findOne({ SKU, _id: { $ne: id } });
            if (skuExists) {
                return res.status(400).json({
                    status: false,
                    message: "Product SKU already exists"
                });
            }
        }

        // -----------------------------------------
        // 2️⃣ HANDLE PRODUCT IMAGES
        // -----------------------------------------
        let productImages = [...existing_images]; // Start with existing images from FE

        // Add new images from req.files (if uploaded)
        if (req.files && req.files.length > 0) {
            req.files.forEach(file => {
                if (file.fieldname === "images") {
                    productImages.push(file.path);
                }
            });
        }

        // -----------------------------------------
        // 3️⃣ HANDLE VARIANT IMAGES
        // -----------------------------------------
        let variantImages = [...existing_variant_images]; // Start with existing variant images

        // Add new variant images from req.files
        if (req.files && req.files.length > 0) {
            req.files.forEach(file => {
                if (file.fieldname.startsWith("variant_images[")) {
                    let index = file.fieldname.match(/\[(\d+)\]/)[1];
                    variantImages[index] = file.path;
                }
            });
        }

        // Attach variant images to variant objects
        variants = variants.map((v, i) => ({
            ...v,
            variant_image: variantImages[i] || v.variant_image || null
        }));

        // -----------------------------------------
        // 4️⃣ UPDATE PRODUCT
        // -----------------------------------------
        const updatedProduct = await product_model.findByIdAndUpdate(
            id,
            {
                name,
                SKU,
                description,
                images: productImages,
                category,
                selling_price,
                original_price,
                cost_price,
                attributes,
                variants
            },
            { new: true, runValidators: true }
        );

        return res.status(200).json({
            status: true,
            message: "Product updated successfully",
            data: updatedProduct
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: error.message
        });
    }
};
