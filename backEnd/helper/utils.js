const category_model = require("../model/category");
const Attributes = require("../model/attributes");
const product_model = require("../model/product");

/**
 * Add Random Data Function
 * Creates random attributes, categories, and products with variants
 */
const add_random_data = async () => {
    try {
        const results = {
            attributes: [],
            categories: [],
            products: [],
            errors: []
        };

        // ============================================
        // 1. CREATE ATTRIBUTES
        // ============================================
        const attributeData = [
            {
                name: "Color",
                values: [
                    { value: "Red" },
                    { value: "Blue" },
                    { value: "Green" },
                    { value: "Black" },
                    { value: "White" },
                    { value: "Yellow" },
                    { value: "Orange" },
                    { value: "Purple" }
                ]
            },
            {
                name: "Size",
                values: [
                    { value: "Small" },
                    { value: "Medium" },
                    { value: "Large" },
                    { value: "XL" },
                    { value: "XXL" }
                ]
            },
            {
                name: "Brand",
                values: [
                    { value: "Nike" },
                    { value: "Adidas" },
                    { value: "Puma" },
                    { value: "Reebok" },
                    { value: "Under Armour" },
                    { value: "New Balance" }
                ]
            },
            {
                name: "Material",
                values: [
                    { value: "Cotton" },
                    { value: "Polyester" },
                    { value: "Leather" },
                    { value: "Silk" },
                    { value: "Wool" },
                    { value: "Denim" }
                ]
            },
            {
                name: "Weight",
                values: [
                    { value: "Light" },
                    { value: "Medium" },
                    { value: "Heavy" },
                    { value: "Ultra Light" }
                ]
            },
            {
                name: "Length",
                values: [
                    { value: "Short" },
                    { value: "Medium" },
                    { value: "Long" },
                    { value: "Extra Long" }
                ]
            },
            {
                name: "Width",
                values: [
                    { value: "Narrow" },
                    { value: "Standard" },
                    { value: "Wide" },
                    { value: "Extra Wide" }
                ]
            },
            {
                name: "Height",
                values: [
                    { value: "Low" },
                    { value: "Medium" },
                    { value: "High" },
                    { value: "Extra High" }
                ]
            },
            {
                name: "Pattern",
                values: [
                    { value: "Solid" },
                    { value: "Striped" },
                    { value: "Polka Dot" },
                    { value: "Floral" },
                    { value: "Geometric" },
                    { value: "Abstract" }
                ]
            },
            {
                name: "Style",
                values: [
                    { value: "Casual" },
                    { value: "Formal" },
                    { value: "Sporty" },
                    { value: "Vintage" },
                    { value: "Modern" },
                    { value: "Classic" }
                ]
            }
        ];

        for (const attr of attributeData) {
            try {
                // Check if attribute already exists
                const existing = await Attributes.findOne({ name: attr.name });
                if (!existing) {
                    const created = await Attributes.create(attr);
                    results.attributes.push(created);
                } else {
                    results.attributes.push(existing);
                }
            } catch (error) {
                results.errors.push(`Error creating attribute ${attr.name}: ${error.message}`);
            }
        }

        // ============================================
        // 2. CREATE CATEGORIES
        // ============================================
        const categoryData = [
            { name: "Electronics" },
            { name: "Clothing" },
            { name: "Footwear" },
            { name: "Accessories" },
            { name: "Home & Living" },
            { name: "Sports & Outdoors" },
            { name: "Beauty & Personal Care" },
            { name: "Books & Media" },
            { name: "Toys & Games" },
            { name: "Automotive" },
            { name: "Health & Fitness" },
            { name: "Jewelry & Watches" },
            { name: "Kitchen & Dining" },
            { name: "Furniture" },
            { name: "Pet Supplies" },
            { name: "Baby & Kids" },
            { name: "Office Supplies" },
            { name: "Garden & Outdoor" },
            { name: "Musical Instruments" },
            { name: "Travel & Luggage" }
        ];

        for (const cat of categoryData) {
            try {
                // Check if category already exists
                const existing = await category_model.findOne({ name: cat.name });
                if (!existing) {
                    const created = await category_model.create(cat);
                    results.categories.push(created);
                } else {
                    results.categories.push(existing);
                }
            } catch (error) {
                results.errors.push(`Error creating category ${cat.name}: ${error.message}`);
            }
        }

        // ============================================
        // 3. CREATE PRODUCTS WITH VARIANTS
        // ============================================
        const productNames = [
            "Premium T-Shirt",
            "Sports Shoes",
            "Leather Jacket",
            "Smart Watch",
            "Wireless Headphones",
            "Running Shorts",
            "Designer Bag",
            "Sunglasses",
            "Fitness Tracker",
            "Casual Jeans"
        ];

        const descriptions = [
            "High quality product with excellent durability and comfort.",
            "Premium design with modern features and stylish look.",
            "Perfect for everyday use with superior quality materials.",
            "Latest technology with innovative design and functionality.",
            "Comfortable fit with exceptional quality and performance."
        ];

        // Get created attributes and categories
        const colorAttr = results.attributes.find(a => a.name === "Color");
        const sizeAttr = results.attributes.find(a => a.name === "Size");
        const brandAttr = results.attributes.find(a => a.name === "Brand");
        const materialAttr = results.attributes.find(a => a.name === "Material");

        // Create 10 random products
        for (let i = 0; i < 10; i++) {
            try {
                const category = results.categories[Math.floor(Math.random() * results.categories.length)];
                const productName = productNames[i] || `Product ${i + 1}`;
                const description = descriptions[Math.floor(Math.random() * descriptions.length)];
                
                // Generate unique SKU
                const timestamp = Date.now();
                const randomNum = Math.floor(Math.random() * 1000);
                const SKU = `PROD-${timestamp}-${i + 1}-${randomNum}`;

                // Random prices
                const costPrice = Math.floor(Math.random() * 500) + 100;
                const sellingPrice = Math.floor(costPrice * 1.5);
                const originalPrice = Math.floor(sellingPrice * 1.2);

                // Select random attributes for product
                const productAttributes = [];
                if (colorAttr) {
                    const colorValues = colorAttr.values.slice(0, 2); // Take 2 colors
                    productAttributes.push({
                        attributeId: colorAttr._id,
                        attributeValuesIds: colorValues.map(v => v._id)
                    });
                }
                if (sizeAttr) {
                    const sizeValues = sizeAttr.values.slice(0, 2); // Take 2 sizes
                    productAttributes.push({
                        attributeId: sizeAttr._id,
                        attributeValuesIds: sizeValues.map(v => v._id)
                    });
                }
                if (brandAttr && Math.random() > 0.5) {
                    const brandValues = [brandAttr.values[Math.floor(Math.random() * brandAttr.values.length)]];
                    productAttributes.push({
                        attributeId: brandAttr._id,
                        attributeValuesIds: brandValues.map(v => v._id)
                    });
                }

                // Create variants based on selected attributes
                const variants = [];
                if (productAttributes.length > 0) {
                    // Get color and size values
                    const colorValues = colorAttr ? colorAttr.values.slice(0, 2) : [];
                    const sizeValues = sizeAttr ? sizeAttr.values.slice(0, 2) : [];

                    // Create variants for each combination
                    colorValues.forEach((color, colorIdx) => {
                        sizeValues.forEach((size, sizeIdx) => {
                            const variantName = `${color.value}-${size.value}`;
                            const variantSKU = `${SKU}-${color.value.toUpperCase()}-${size.value.toUpperCase()}`;
                            const variantPrice = sellingPrice + (Math.random() * 100 - 50); // ±50 variation

                            const variantAttributes = [];
                            if (colorAttr) {
                                variantAttributes.push({
                                    attribute_id: colorAttr._id,
                                    value_id: color._id
                                });
                            }
                            if (sizeAttr) {
                                variantAttributes.push({
                                    attribute_id: sizeAttr._id,
                                    value_id: size._id
                                });
                            }

                            variants.push({
                                variant_name: variantName,
                                variant_SKU: variantSKU,
                                variant_price: Math.floor(variantPrice),
                                variant_image: null,
                                variant_attributes: variantAttributes,
                                quantity: Math.floor(Math.random() * 100) + 10,
                                status: 'ACTIVE'
                            });
                        });
                    });
                }

                // If no variants created, create at least one default variant
                if (variants.length === 0) {
                    variants.push({
                        variant_name: "Default",
                        variant_SKU: `${SKU}-DEFAULT`,
                        variant_price: sellingPrice,
                        variant_image: null,
                        variant_attributes: [],
                        quantity: Math.floor(Math.random() * 100) + 10,
                        status: 'ACTIVE'
                    });
                }

                // Check if SKU already exists
                const existingProduct = await product_model.findOne({ SKU });
                if (existingProduct) {
                    results.errors.push(`Product with SKU ${SKU} already exists`);
                    continue;
                }

                // Create product
                const product = await product_model.create({
                    name: productName,
                    SKU: SKU,
                    description: description,
                    images: [],
                    category: category._id,
                    selling_price: sellingPrice,
                    original_price: originalPrice,
                    cost_price: costPrice,
                    quantity: variants.reduce((sum, v) => sum + (v.quantity || 0), 0),
                    attributes: productAttributes,
                    variants: variants,
                    status: 'ACTIVE'
                });

                results.products.push(product);
            } catch (error) {
                results.errors.push(`Error creating product ${i + 1}: ${error.message}`);
            }
        }

        return {
            success: true,
            message: "Random data added successfully",
            data: {
                attributesCreated: results.attributes.length,
                categoriesCreated: results.categories.length,
                productsCreated: results.products.length,
                details: results
            }
        };
    } catch (error) {
        return {
            success: false,
            message: error.message,
            error: error
        };
    }
};

module.exports = {
    add_random_data
};

