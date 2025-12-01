var express = require('express');
var router = express.Router();
const user_banner_controller = require('../controllers/users/banner');
const user_product_controller = require('../controllers/users/product');

// User routes - No authentication required

// Banner routes
router.get('/banners/list', user_banner_controller.get_active_banners);

// Product routes
router.get('/products/bestsellers', user_product_controller.get_bestseller_products);
router.get('/products/trending', user_product_controller.get_trending_products);
router.get('/products/by-category', user_product_controller.get_products_by_category);

module.exports = router;
