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
const utils_controller = require('../controllers/utils')
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

// utils routes
router.post('/utils/add-random-data', authorization.authorization, utils_controller.add_random_data);

module.exports = router;
