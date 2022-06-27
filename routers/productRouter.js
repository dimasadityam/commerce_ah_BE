const { readToken } = require('../config/encription');
const { productController } = require('../controllers')
const router = require('express').Router();

router.get('/', productController.getData);
router.post('/', readToken, productController.addData);
// router.get('/get', productController.getData);
// router.post('/add', productController.addData);

module.exports = router;