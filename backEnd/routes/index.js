var express = require('express');
var router = express.Router();
const authorization = require('../auth/authorization')
const upload = require('../helper/multer');
const admin_controller = require('../controllers/admin')
const category_controller = require('../controllers/category')
const attributes_controller = require('../controllers/attributes')
const product_controller = require('../controllers/product')
/* GET home page. */
router.post('/admin/auth/signup', admin_controller.signup);
router.post('/admin/auth/login', admin_controller.login);

// category routes
router.post('/category/create', authorization.authorization, category_controller.create_category);
router.get('/category/list', authorization.authorization, category_controller.get_category_list);
router.delete('/category/delete', authorization.authorization, category_controller.delete_category);

// attributes routes
router.post('/attributes/create', authorization.authorization, attributes_controller.create_attribute);
router.put('/attributes/update/:id', authorization.authorization, attributes_controller.update_attribute);
router.get('/attributes/list', authorization.authorization, attributes_controller.get_attributes);
router.delete('/attributes/delete/:id', authorization.authorization, attributes_controller.delete_attribute);

// product routes
router.post('/product/create', authorization.authorization, upload.any(), product_controller.create_product);
router.put('/product/update/:id', authorization.authorization, upload.any(), product_controller.update_product);
router.get('/product/get_one/:id', authorization.authorization, product_controller.get_one_product);
router.get('/product/list', authorization.authorization, product_controller.get_product_list);

module.exports = router;
