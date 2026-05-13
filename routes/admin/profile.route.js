const router = require('express').Router();
const multer = require('multer');
const profileController = require('../../controllers/admin/profile.controller');
const cloudinaryHelper = require('../../helpers/cloudinary.helper');

const upload = multer({ storage: cloudinaryHelper.storage });

router.get('/', profileController.edit);
router.patch('/', upload.single('avatar'), profileController.editPatch);
router.get('/change-password', profileController.changePassword);
router.patch('/change-password', profileController.changePasswordPatch);

module.exports = router;
