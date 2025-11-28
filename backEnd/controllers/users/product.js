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
                    _id: new mongoose.Types.ObjectId(id)
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