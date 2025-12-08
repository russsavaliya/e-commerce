var express = require('express');
var router = express.Router();
const user_banner_controller = require('../controllers/users/banner');
const user_product_controller = require('../controllers/users/product');
const user_category_controller = require('../controllers/users/category');
const user_attribute_controller = require('../controllers/users/attribute');
const user_cart_controller = require('../controllers/users/cart');
const user_checkout_controller = require('../controllers/users/checkout');

// User routes - No authentication required

// Banner routes
router.get('/banners/list', user_banner_controller.get_active_banners);

// Product routes
router.get('/products/bestsellers', user_product_controller.get_bestseller_products);
router.get('/products/trending', user_product_controller.get_trending_products);
router.get('/products/new', user_product_controller.get_new_products);
router.get('/products/by-category', user_product_controller.get_products_by_category);
router.get('/products/all', user_product_controller.get_all_products);
router.get('/products/:id', user_product_controller.get_product_detail);

// Category routes
router.get('/categories/list', user_category_controller.get_categories_list);

// Attribute routes
router.get('/attributes/list', user_attribute_controller.get_attributes_list);

// Cart routes
router.get('/cart', user_cart_controller.get_cart);
router.post('/cart/add', user_cart_controller.add_to_cart);
router.put('/cart/update/:cartItemId', user_cart_controller.update_cart_item);
router.delete('/cart/remove/:cartItemId', user_cart_controller.remove_from_cart);
router.delete('/cart/clear', user_cart_controller.clear_cart);
router.get('/cart/count', user_cart_controller.get_cart_count);

// Checkout routes
router.get('/checkout/pincode/validate', user_checkout_controller.validate_pincode);

module.exports = router;
