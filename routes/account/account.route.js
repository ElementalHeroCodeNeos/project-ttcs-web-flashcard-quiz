const router = require('express').Router();
const accountController = require('../../controllers/account/account.controller');

router.get('/login', accountController.login);
router.get('/register', accountController.register);
router.get('/forgot-password', accountController.forgotPassword);
router.get('/otp', accountController.otp);
router.get('/reset-password', accountController.resetPassword);
router.get('/logout', accountController.logout);

module.exports = router;
