const router = require('express').Router();
const accountController = require('../../controllers/account/account.controller');

router.get('/login', accountController.login);
router.post('/login', accountController.loginPost);
router.get('/register', accountController.register);
router.post('/register', accountController.registerPost);
router.get('/forgot-password', accountController.forgotPassword);
router.post('/forgot-password', accountController.forgotPasswordPost);
router.get('/otp', accountController.otp);
router.post('/otp', accountController.otpPost);
router.get('/reset-password', accountController.resetPassword);
router.post('/reset-password', accountController.resetPasswordPost);
router.get('/logout', accountController.logout);

module.exports = router;
