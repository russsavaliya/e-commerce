var express = require('express');
var router = express.Router();
const authorization = require('../auth/authorization')
const upload = require('../helper/multer');
const permission = require('../helper/permission');
const admin_controller = require('../controllers/admin')
const category_controller = require('../controllers/category')
const attributes_controller = require('../controllers/attributes')
const product_controller = require('../controllers/product')
const role_controller = require('../controllers/role')
const marketing_spend_controller = require('../controllers/marketing_spend')
const banner_controller = require('../controllers/banner')
const admin_order_controller = require('../controllers/admin_order')
const admin_customer_controller = require('../controllers/admin_customer')
const admin_dashboard_controller = require('../controllers/dashboard')
const admin_review_controller = require('../controllers/admin_review')
const utils_controller = require('../controllers/utils')
const shipment_controller = require('../controllers/shipment');
const note_controller = require('../controllers/note');
const coupon_controller = require('../controllers/coupon');
const admin_returnOrder_controller = require('../controllers/admin_returnOrder');
/* GET home page. */
router.post('/admin/auth/signup', authorization.authorization, permission.checkPermission('admin_create'), admin_controller.signup);
router.post('/admin/auth/login', admin_controller.login);
router.get('/admin/list', authorization.authorization, admin_controller.get_admin_list);
router.get('/admin/profile', authorization.authorization, admin_controller.get_admin_profile);
router.put('/admin/update-password', authorization.authorization, admin_controller.update_password);
router.delete('/admin/delete', authorization.authorization, permission.checkPermission('admin_delete'), admin_controller.delete_admin);

// category routes
router.post('/category/create', authorization.authorization, permission.checkPermission('category_add'), category_controller.create_category);
router.get('/category/list', authorization.authorization, category_controller.get_category_list);
router.put('/category/update', authorization.authorization, permission.checkPermission('category_update'), category_controller.update_category);
router.delete('/category/delete', authorization.authorization, permission.checkPermission('category_delete'), category_controller.delete_category);

// attributes routes
router.post('/attributes/create', authorization.authorization, permission.checkPermission('attribute_add'), attributes_controller.create_attribute);
router.put('/attributes/update/:id', authorization.authorization, permission.checkPermission('attribute_update'), attributes_controller.update_attribute);
router.get('/attributes/list', authorization.authorization, attributes_controller.get_attributes);
router.delete('/attributes/delete/:id', authorization.authorization, permission.checkPermission('attribute_delete'), attributes_controller.delete_attribute);

// product routes
router.post('/product/create', authorization.authorization, permission.checkPermission('product_add'), upload.any(), product_controller.create_product);
router.put('/product/update/:id', authorization.authorization, permission.checkPermission('product_update'), upload.any(), product_controller.update_product);
router.get('/product/get_one/:id', authorization.authorization, product_controller.get_one_product);
router.get('/product/list', authorization.authorization, product_controller.get_product_list);

// role routes
router.post('/role/create', authorization.authorization, permission.checkPermission('role_create'), role_controller.create_role);
router.get('/role/list', authorization.authorization, role_controller.get_role_list);
router.get('/role/one', authorization.authorization, role_controller.get_role_one);
router.put('/role/update', authorization.authorization, permission.checkPermission('role_update'), role_controller.update_role);
router.delete('/role/delete', authorization.authorization, permission.checkPermission('role_delete'), role_controller.delete_role);

// marketing spend routes
router.post('/marketing-spend/create', authorization.authorization, permission.checkPermission('marketing_spend_add'), marketing_spend_controller.create_marketing_spend);
router.get('/marketing-spend/list', authorization.authorization, marketing_spend_controller.get_marketing_spend_list);
router.get('/marketing-spend/one/:id', authorization.authorization, marketing_spend_controller.get_marketing_spend_one);
router.put('/marketing-spend/update/:id', authorization.authorization, permission.checkPermission('marketing_spend_update'), marketing_spend_controller.update_marketing_spend);
router.delete('/marketing-spend/delete/:id', authorization.authorization, permission.checkPermission('marketing_spend_delete'), marketing_spend_controller.delete_marketing_spend);

// banner routes (admin)
router.post('/banners', authorization.authorization, permission.checkPermission('banner_add'), upload.single('image'), banner_controller.create_banner);
router.get('/banners', authorization.authorization, banner_controller.get_banner_list);
router.put('/banners/:id', authorization.authorization, permission.checkPermission('banner_update'), upload.single('image'), banner_controller.update_banner);
router.delete('/banners/:id', authorization.authorization, permission.checkPermission('banner_delete'), banner_controller.delete_banner);
router.patch('/banners/:id/toggle', authorization.authorization, permission.checkPermission('banner_update'), banner_controller.toggle_banner_status);

// order routes (admin)
router.get('/orders/list', authorization.authorization, admin_order_controller.get_order_list);
router.get('/orders/accepted', authorization.authorization, admin_order_controller.get_accepted_orders);
router.get('/orders/export', authorization.authorization, admin_order_controller.export_orders);
router.get('/orders/export-one', authorization.authorization, admin_order_controller.export_order_one);
router.get('/orders/:orderId', authorization.authorization, admin_order_controller.get_order_one);
router.patch('/orders/:orderId/status', authorization.authorization, permission.checkPermission('order_update'), admin_order_controller.update_order_status);
router.patch('/orders/:orderId/payment-status', authorization.authorization, permission.checkPermission('order_update'), admin_order_controller.update_payment_status);

// shipment routes (admin)
router.post('/shipments/create/:orderId', authorization.authorization, permission.checkPermission('order_update'), shipment_controller.create_shipment);
router.get('/shipments/one', authorization.authorization, shipment_controller.get_one_shipment);
router.get('/shipments/order/:orderId', authorization.authorization, shipment_controller.get_shipment_by_order);
router.get('/shipments/list', authorization.authorization, shipment_controller.get_shipment_list);
router.patch('/shipments/:shipmentId/status', authorization.authorization, permission.checkPermission('order_update'), shipment_controller.update_shipment_status);

// customer routes (admin)
router.get('/customers/list', authorization.authorization, admin_customer_controller.get_customer_list);

// dashboard routes (admin)
router.get('/dashboard/summary', authorization.authorization, admin_dashboard_controller.get_dashboard_summary);

// review routes (admin)
router.get('/reviews/list', authorization.authorization, admin_review_controller.get_review_list);
router.post('/reviews', authorization.authorization, permission.checkPermission('review_add'), admin_review_controller.add_review);
router.get('/reviews/:reviewId', authorization.authorization, admin_review_controller.get_review_one);
router.put('/reviews/:reviewId', authorization.authorization, permission.checkPermission('review_update'), admin_review_controller.update_review);
router.delete('/reviews/:reviewId', authorization.authorization, permission.checkPermission('review_delete'), admin_review_controller.delete_review);

// utils routes
router.post('/utils/add-random-data', authorization.authorization, utils_controller.add_random_data);

// note routes (admin)
router.post('/notes/create', authorization.authorization, note_controller.create_note);
router.get('/notes/list', authorization.authorization, note_controller.get_all_notes);
router.get('/notes/one/:id', authorization.authorization, note_controller.get_note_by_id);
router.put('/notes/update/:id', authorization.authorization, note_controller.update_note);
router.delete('/notes/delete/:id', authorization.authorization, note_controller.delete_note);

// coupon routes (admin)
router.post('/coupons', authorization.authorization, permission.checkPermission('coupon_add'), coupon_controller.create_coupon);
router.get('/coupons/list', authorization.authorization, coupon_controller.get_coupon_list);
router.get('/coupons/get-one', authorization.authorization, coupon_controller.get_coupon_one);
router.put('/coupons/update', authorization.authorization, permission.checkPermission('coupon_update'), coupon_controller.update_coupon);
router.delete('/coupons/delete', authorization.authorization, permission.checkPermission('coupon_delete'), coupon_controller.delete_coupon);

// return order routes (admin)
router.get('/return-order/list', authorization.authorization, admin_returnOrder_controller.get_return_orders_list);
router.get('/return-order/get-one', authorization.authorization, admin_returnOrder_controller.get_one_return_order);
router.get('/return-order/get-shipment-details', authorization.authorization, admin_returnOrder_controller.get_shipment_details);
router.patch('/return-order/update-status', authorization.authorization, permission.checkPermission('order_update'), admin_returnOrder_controller.update_return_status);
router.post('/return-order/create-shiprocket-return', authorization.authorization, permission.checkPermission('order_update'), admin_returnOrder_controller.create_shiprocket_return);

module.exports = router;
