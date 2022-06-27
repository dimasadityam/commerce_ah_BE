const { bannerController } = require('../controllers')
const router = require('express').Router();

router.get('/get', bannerController.getData);
router.post('/add', bannerController.addData);
router.delete('/del', bannerController.deleteData);
router.patch('/update', bannerController.update);

module.exports = router;