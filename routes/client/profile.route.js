const router = require('express').Router();
const multer = require('multer');
const { storage } = require('../../helpers/cloudinary.helper');
const profileController = require('../../controllers/client/profile.controller');

const upload = multer({ storage });

router.get('/', profileController.index);
router.post('/edit', upload.single('avatar'), profileController.editPost);

module.exports = router;
