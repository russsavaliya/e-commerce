const product_model = require("../model/product");
const mongoose = require("mongoose");
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
            quantity,
            discount_percentage,
            is_best_seller,
            is_new,
            is_trending,
            sort_order,
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
            quantity: quantity || 0,
            discount_percentage: discount_percentage || 0,
            is_best_seller: is_best_seller === true || is_best_seller === 'true',
            is_new: is_new === true || is_new === 'true',
            is_trending: is_trending === true || is_trending === 'true',
            sort_order: sort_order || 0,
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
            quantity,
            discount_percentage,
            is_best_seller,
            is_new,
            is_trending,
            sort_order,
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
                quantity: quantity !== undefined ? quantity : existingProduct.quantity,
                discount_percentage: discount_percentage !== undefined ? discount_percentage : existingProduct.discount_percentage,
                is_best_seller: is_best_seller !== undefined ? (is_best_seller === true || is_best_seller === 'true') : existingProduct.is_best_seller,
                is_new: is_new !== undefined ? (is_new === true || is_new === 'true') : existingProduct.is_new,
                is_trending: is_trending !== undefined ? (is_trending === true || is_trending === 'true') : existingProduct.is_trending,
                sort_order: sort_order !== undefined ? sort_order : existingProduct.sort_order,
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

exports.get_product_list = async (req, res) => {
    try {
        let { page = 1, limit = 10, search = '' } = req.query;

        page = parseInt(page);
        limit = parseInt(limit);
        const skip = (page - 1) * limit;

        // Build match condition for search
        let matchCondition = {};
        if (search && search.trim()) {
            const searchRegex = { $regex: search.trim(), $options: 'i' };
            matchCondition = {
                $or: [
                    { name: searchRegex },
                    { SKU: searchRegex }
                ]
            };
        }

        const productData = await product_model.aggregate([
            {
                $match: matchCondition
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "category",
                    foreignField: "_id",
                    as: "category"
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    SKU: 1,
                    images: 1,
                    category: "$category.name",
                    selling_price: 1,
                }
            },
            {
                $skip: skip
            },
            {
                $limit: limit
            }
        ]);
        
        // Count total documents matching search
        const countMatchCondition = matchCondition;
        const total_count = await product_model.countDocuments(countMatchCondition);
        const total_pages = Math.ceil(total_count / limit);
        
        return res.status(200).json({
            status: true,
            message: "Product list fetched successfully",
            data: {
                productData,
                total_count,
                total_pages,
                page,
                limit,
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: error.message
        });
    }
}

exports.get_one_product = async (req, res, next) => {
    try {

        let { id } = req.params;
        const productData = await product_model.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(req.params.id)
                }
            },
            // Product level attributes lookup
            {
                $lookup: {
                    from: "attributes",
                    let: {
                        productAttrs: "$attributes"
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $in: ["$_id", {
                                        $map: {
                                            input: "$$productAttrs",
                                            as: "attr",
                                            in: "$$attr.attributeId"
                                        }
                                    }]
                                }
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                name: 1,
                                slug: 1,
                                status: 1,
                                values: {
                                    $map: {
                                        input: {
                                            $filter: {
                                                input: "$values",
                                                as: "val",
                                                cond: {
                                                    $in: ["$$val._id", {
                                                        $reduce: {
                                                            input: "$$productAttrs",
                                                            initialValue: [],
                                                            in: {
                                                                $cond: [
                                                                    { $eq: ["$$this.attributeId", "$_id"] },
                                                                    { $concatArrays: ["$$value", "$$this.attributeValuesIds"] },
                                                                    "$$value"
                                                                ]
                                                            }
                                                        }
                                                    }]
                                                }
                                            }
                                        },
                                        as: "filteredVal",
                                        in: {
                                            _id: "$$filteredVal._id",
                                            value: "$$filteredVal.value"
                                        }
                                    }
                                }
                            }
                        }
                    ],
                    as: "attributesvalues"
                }
            },
            // Variant-level attributes lookup
            {
                $lookup: {
                    from: "attributes",
                    let: { variants: "$variants" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $in: [
                                        "$_id",
                                        {
                                            $reduce: {
                                                input: "$$variants.variant_attributes.attribute_id",
                                                initialValue: [],
                                                in: { $concatArrays: ["$$value", "$$this"] }
                                            }
                                        }
                                    ]
                                }
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                name: 1,
                                slug: 1,
                                status: 1,
                                values: 1
                            }
                        }
                    ],
                    as: "allVariantAttributes"
                }
            },

            {
                $addFields: {
                    variants: {
                        $map: {
                            input: "$variants",
                            as: "variant",
                            in: {
                                $mergeObjects: [
                                    "$$variant",
                                    {
                                        variant_attributes: {
                                            $map: {
                                                input: "$$variant.variant_attributes",
                                                as: "attr",
                                                in: {
                                                    attribute_id: "$$attr.attribute_id",
                                                    value_id: "$$attr.value_id",
                                                    _id: "$$attr._id",
                                                    name: {
                                                        $let: {
                                                            vars: {
                                                                matchedAttr: {
                                                                    $arrayElemAt: [
                                                                        {
                                                                            $filter: {
                                                                                input: "$allVariantAttributes",
                                                                                as: "lookupAttr",
                                                                                cond: {
                                                                                    $eq: ["$$lookupAttr._id", "$$attr.attribute_id"]
                                                                                }
                                                                            }
                                                                        },
                                                                        0
                                                                    ]
                                                                }
                                                            },
                                                            in: "$$matchedAttr.name"
                                                        }
                                                    },
                                                    slug: {
                                                        $let: {
                                                            vars: {
                                                                matchedAttr: {
                                                                    $arrayElemAt: [
                                                                        {
                                                                            $filter: {
                                                                                input: "$allVariantAttributes",
                                                                                as: "lookupAttr",
                                                                                cond: {
                                                                                    $eq: ["$$lookupAttr._id", "$$attr.attribute_id"]
                                                                                }
                                                                            }
                                                                        },
                                                                        0
                                                                    ]
                                                                }
                                                            },
                                                            in: "$$matchedAttr.slug"
                                                        }
                                                    },
                                                    status: {
                                                        $let: {
                                                            vars: {
                                                                matchedAttr: {
                                                                    $arrayElemAt: [
                                                                        {
                                                                            $filter: {
                                                                                input: "$allVariantAttributes",
                                                                                as: "lookupAttr",
                                                                                cond: {
                                                                                    $eq: ["$$lookupAttr._id", "$$attr.attribute_id"]
                                                                                }
                                                                            }
                                                                        },
                                                                        0
                                                                    ]
                                                                }
                                                            },
                                                            in: "$$matchedAttr.status"
                                                        }
                                                    },
                                                    value: {
                                                        $let: {
                                                            vars: {
                                                                matchedAttr: {
                                                                    $arrayElemAt: [
                                                                        {
                                                                            $filter: {
                                                                                input: "$allVariantAttributes",
                                                                                as: "lookupAttr",
                                                                                cond: {
                                                                                    $eq: ["$$lookupAttr._id", "$$attr.attribute_id"]
                                                                                }
                                                                            }
                                                                        },
                                                                        0
                                                                    ]
                                                                }
                                                            },
                                                            in: {
                                                                $arrayElemAt: [
                                                                    {
                                                                        $map: {
                                                                            input: {
                                                                                $filter: {
                                                                                    input: "$$matchedAttr.values",
                                                                                    as: "val",
                                                                                    cond: {
                                                                                        $eq: ["$$val._id", "$$attr.value_id"]
                                                                                    }
                                                                                }
                                                                            },
                                                                            as: "matchedVal",
                                                                            in: "$$matchedVal.value"
                                                                        }
                                                                    },
                                                                    0
                                                                ]
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        },
                                    }
                                ]
                            }
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "category",
                    foreignField: "_id",
                    as: "category",
                }
            },
            {
                $unwind: {
                    path: "$category",
                    preserveNullAndEmptyArrays: true
                }
            },
            // Remove temporary fields
            {
                $project: {
                    allVariantAttributes: 0,
                    productInfoData: 0,
                    attributes: 0,
                }
            }
        ]);
        return res.status(200).json({
            data: productData,
            message: "Product fetched successfully",
            success: true
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        });
    }
}

