var express = require('express');
var router = express.Router();
const admin_controller = require('../controllers/admin')
const category_controller = require('../controllers/category')
const attributes_controller = require('../controllers/attributes')
/* GET home page. */
router.post('/admin/auth/signup', admin_controller.signup);
router.post('/admin/auth/login', admin_controller.login);

router.post('/category/create', category_controller.create_category);
router.get('/category/list', category_controller.get_category_list);
router.delete('/category/delete', category_controller.delete_category);

router.post('/attributes/create', attributes_controller.create_attribute);
router.put('/attributes/update/:id', attributes_controller.update_attribute);
router.get('/attributes/list', attributes_controller.get_attributes);
router.delete('/attributes/delete/:id', attributes_controller.delete_attribute);

module.exports = router;
