var express = require('express');
var router = express.Router();
const upload = require('../helper/multer');
const admin_controller = require('../controllers/admin')
const category_controller = require('../controllers/category')
const attributes_controller = require('../controllers/attributes')
const product_controller = require('../controllers/product')
/* GET home page. */
router.post('/admin/auth/signup', admin_controller.signup);
router.post('/admin/auth/login', admin_controller.login);

// category routes
router.post('/category/create', category_controller.create_category);
router.get('/category/list', category_controller.get_category_list);
router.delete('/category/delete', category_controller.delete_category);

// attributes routes
router.post('/attributes/create', attributes_controller.create_attribute);
router.put('/attributes/update/:id', attributes_controller.update_attribute);
router.get('/attributes/list', attributes_controller.get_attributes);
router.delete('/attributes/delete/:id', attributes_controller.delete_attribute);

// product routes
router.post('/product/create', upload.any(), product_controller.create_product);
router.put('/product/update/:id', upload.any(), product_controller.update_product);

module.exports = router;
