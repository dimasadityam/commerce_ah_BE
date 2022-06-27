const { stockController } = require('../controllers')
const router = require('express').Router();

router.get('/get', stockController.getData);
router.post('/add', stockController.addData);

module.exports = router;