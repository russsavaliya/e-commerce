var express = require('express');
var router = express.Router();
const admin_controller = require('../controllers/admin')
const category_controller = require('../controllers/category')
/* GET home page. */
router.post('/admin/auth/signup', admin_controller.signup);
router.post('/admin/auth/login', admin_controller.login);

router.post('/category/create', category_controller.create_category);
router.get('/category/list', category_controller.get_category_list);
router.delete('/category/delete', category_controller.delete_category);
module.exports = router;
