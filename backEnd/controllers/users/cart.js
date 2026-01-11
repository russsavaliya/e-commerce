const product_model = require('../../model/product');
const { createCanonicalCart, extractGuestId, clearCart, createCartItemId, applyTotals } = require('../../helper/cartHelper');

exports.get_cart = async (req, res) => {
  try {
    const guestId = extractGuestId(req);
    if (!guestId) {
      return res.status(400).json({
        status: false,
        message: 'guestId is required for cart operations',
      });
    }

    const cart = await createCanonicalCart(guestId);

    // Populate product details for cart items
    const cartWithProducts = await Promise.all(
      cart.items.map(async (item) => {
        try {
          const product = await product_model.findById(item.productId)
            .populate('category', 'name')
            .select('name images selling_price original_price discount_percentage category variants');
          
          if (!product) {
            return null;
          }

          // Calculate price and get image (use variant if variant selected, otherwise product)
          let price = product.selling_price;
          let displayImage = product.images && product.images.length > 0 ? product.images[0] : null;
          if (item.variantId) {
            const variant = product.variants?.find(v => v._id.toString() == item.variantId.toString());
            if (variant) {
              if (variant.variant_price) {
                price = variant.variant_price;
              }
              // Use variant image if available, otherwise use product image
              if (variant.variant_image) {
                displayImage = variant.variant_image;
              }
            }
          }

          return {
            cartItemId: item.cartItemId,
            productId: item.productId,
            variantId: item.variantId || null,
            variantName: item.variantName || null,
            quantity: item.quantity,
            product: {
              _id: product._id,
              name: product.name,
              images: product.images,
              selling_price: product.selling_price,
              original_price: product.original_price,
              discount_percentage: product.discount_percentage,
              category: product.category
            },
            image: displayImage, // Use variant image if variant selected, otherwise product image
            price: price,
            subtotal: price * item.quantity
          };
        } catch (error) {
          console.error('Error populating product:', error);
          return null;
        }
      })
    );

    // Filter out null items (products that no longer exist)
    const validCartItems = cartWithProducts.filter(item => item !== null);

    // Calculate totals
    const subtotal = validCartItems.reduce((sum, item) => sum + item.subtotal, 0);
    const totalItems = validCartItems.reduce((sum, item) => sum + item.quantity, 0);

    return res.status(200).json({
      status: true,
      message: 'Cart fetched successfully',
      data: {
        items: validCartItems,
        subtotal: subtotal,
        totalItems: totalItems
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message
    });
  }
};

// Add item to cart
exports.add_to_cart = async (req, res) => {
  try {
    const { productId, variantId, quantity = 1 } = req.body;
    const guestId = extractGuestId(req);
    console.log("guestId==>", guestId);
    console.log("productId==>", productId);
    console.log("variantId==>", variantId);
    console.log("quantity==>", quantity);
    if (!guestId) {
      return res.status(400).json({
        status: false,
        message: 'guestId is required for cart operations',
      });
    }

    if (!productId) {
      return res.status(400).json({
        status: false,
        message: 'Product ID is required'
      });
    }

    // Validate product exists
    const product = await product_model.findById(productId);
    if (!product) {
      return res.status(404).json({
        status: false,
        message: 'Product not found'
      });
    }

    // If variant is provided, validate it exists
    let variantName = null;
    let price = product.selling_price;
    if (variantId) {
      const variant = product.variants?.find(v => v._id.toString() == variantId.toString());
      if (!variant) {
        return res.status(404).json({
          status: false,
          message: 'Variant not found'
        });
      }
      variantName = variant.variant_name;
      price = variant.variant_price || price;
    }

    const cart = await createCanonicalCart(guestId);

    const existingItem = cart.items.find(
      item => item.productId.toString() === productId && (item.variantId?.toString() || null) === (variantId || null)
    );

    if (existingItem) {
      existingItem.quantity += parseInt(quantity);
      existingItem.price = price;
    } else {
      cart.items.push({
        cartItemId: createCartItemId(),
        productId,
        variantId: variantId || null,
        variantName: variantName || null,
        quantity: parseInt(quantity),
        price: price
      });
    }

    await applyTotals(cart);
    await cart.save();

    return res.status(200).json({
      status: true,
      message: 'Item added to cart successfully',
      data: {
        cartItemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0)
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message
    });
  }
};

// Update cart item quantity
exports.update_cart_item = async (req, res) => {
  try {
    const { cartItemId } = req.params;
    const { quantity } = req.body;
    const guestId = extractGuestId(req);

    if (!guestId) {
      return res.status(400).json({
        status: false,
        message: 'guestId is required for cart operations',
      });
    }

    const cart = await createCanonicalCart(guestId);

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        status: false,
        message: 'Quantity must be at least 1'
      });
    }

    const item = cart.items.find(item => item.cartItemId === cartItemId);
    if (!item) {
      return res.status(404).json({
        status: false,
        message: 'Cart item not found'
      });
    }

    item.quantity = parseInt(quantity);
    await applyTotals(cart);
    await cart.save();
    await cart.save();

    return res.status(200).json({
      status: true,
      message: 'Cart item updated successfully',
      data: {
        cartItemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0)
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message
    });
  }
};

// Remove item from cart
exports.remove_from_cart = async (req, res) => {
  try {
    const { cartItemId } = req.params;
    const guestId = extractGuestId(req);

    if (!guestId) {
      return res.status(400).json({
        status: false,
        message: 'guestId is required for cart operations',
      });
    }

    const cart = await createCanonicalCart(guestId);
    const initialLength = cart.items.length;
    cart.items = cart.items.filter(item => item.cartItemId !== cartItemId);

    if (cart.items.length === initialLength) {
      return res.status(404).json({
        status: false,
        message: 'Cart item not found'
      });
    }

    await applyTotals(cart);
    await cart.save();

    return res.status(200).json({
      status: true,
      message: 'Item removed from cart successfully',
      data: {
        cartItemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0)
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message
    });
  }
};

// Clear entire cart
exports.clear_cart = async (req, res) => {
  try {
    const guestId = extractGuestId(req);

    if (!guestId) {
      return res.status(400).json({
        status: false,
        message: 'guestId is required for cart operations',
      });
    }

    await clearCart(guestId);

    return res.status(200).json({
      status: true,
      message: 'Cart cleared successfully'
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message
    });
  }
};

// Get cart item count (for navbar badge)
exports.get_cart_count = async (req, res) => {
  try {
    const guestId = extractGuestId(req);

    if (!guestId) {
      return res.status(400).json({
        status: false,
        message: 'guestId is required for cart operations',
      });
    }

    const cart = await createCanonicalCart(guestId);
    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    return res.status(200).json({
      status: true,
      message: 'Cart count fetched successfully',
      data: {
        count: totalItems
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message
    });
  }
};

