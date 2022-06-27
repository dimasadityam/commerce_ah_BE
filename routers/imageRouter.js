const { imageController } = require('../controllers')
const router = require('express').Router();

router.get('/get', imageController.getData);
router.post('/add', imageController.addData);

module.exports = router;