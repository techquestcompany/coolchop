const express = require('express');
const { uploadImage } = require('../controllers/uploadController');

const router = express.Router();

router.post('/upload_image', uploadImage);

module.exports = router;
