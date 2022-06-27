const { readToken } = require('../config/encription');
const { userController } = require('../controllers')
const router = require('express').Router();

router.get('/get', userController.getData);
router.post('/regis', userController.register);
router.post('/login', userController.login); // login menggunakan post karna akan mengirim data menggunakan request body, kalo get username dan password akan kebaca di url
router.post('/forgot', userController.forgot);
router.get('/keep', readToken, userController.keepLogin);
router.get('/verification', readToken, userController.edit);
router.get('/sendVerif', readToken, userController.sendVerification);
router.get('/reverified', readToken, userController.reVerified);
router.patch('/verified', readToken, userController.verifiedAccount);
router.patch('/resetpass', readToken, userController.resetPass);

module.exports = router;