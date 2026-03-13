var express = require('express');
var router = express.Router();
const user_banner_controller = require('../controllers/users/banner');
const user_product_controller = require('../controllers/users/product');
const user_category_controller = require('../controllers/users/category');
const user_attribute_controller = require('../controllers/users/attribute');
const user_cart_controller = require('../controllers/users/cart');
const user_checkout_controller = require('../controllers/users/checkout');
const user_order_controller = require('../controllers/users/order');
const user_payment_controller = require('../controllers/users/payment');
const user_support_controller = require('../controllers/users/support');
const user_review_controller = require('../controllers/users/review');
const user_coupon_controller = require('../controllers/users/coupon');
const user_return_order_controller = require('../controllers/users/returnOrder');

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
router.get('/products/:id/related', user_product_controller.get_related_products);

// Category routes
router.get('/categories/list', user_category_controller.get_categories_list);
router.get('/categories/grouped', user_category_controller.get_categories_grouped);

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

// Order routes
router.post('/orders/init', user_order_controller.init_order);
router.patch('/orders/payment', user_order_controller.update_payment);
router.get('/orders/track', user_order_controller.track_order);
router.post('/orders/cancel', user_order_controller.cancel_order);

// Payment routes (Razorpay)
router.post('/payments/razorpay/create', user_payment_controller.create_razorpay_order);
router.post('/payments/razorpay/verify', user_payment_controller.verify_payment);
router.get('/payments/status/:orderId', user_payment_controller.get_payment_status);

// Support / contact routes
router.post('/support/contact', user_support_controller.send_support_email);

// Product reviews
router.get('/reviews', user_review_controller.get_reviews);
router.post('/reviews', user_review_controller.add_review);

// Coupon routes (user)
router.get('/coupons/available', user_coupon_controller.get_available_coupons);
router.post('/coupons/apply', user_coupon_controller.apply_coupon);

// Return order routes
router.post('/return/send-otp', user_return_order_controller.send_otp);
router.post('/return/verify-otp', user_return_order_controller.verify_otp);
router.post('/return/create', user_return_order_controller.create_return);

module.exports = router;
