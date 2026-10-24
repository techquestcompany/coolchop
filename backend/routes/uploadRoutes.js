const express = require('express');
const { uploadUserImage } = require('../controllers/uploadController');
const tokenMiddleware = require("../utils/tokenAuth");

const router = express.Router();

router.post('/upload_image', tokenMiddleware, uploadUserImage);


module.exports = router;
