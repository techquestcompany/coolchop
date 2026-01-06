const express = require('express');
const userController = require('../controllers/authController');
const router = express.Router();
const tokenMiddleware = require("../utils/tokenAuth")

router.post('/signup', userController.signup);
router.post('/login', userController.login);
router.post('/verify', userController.verifyCode);
router.post('/token', userController.verifyUserId);
router.get('/me', tokenMiddleware,userController.getUserData);
router.post("/forgottenPassword",userController.forgottenPassword)
router.post("/resetPassword",userController.passwordReset);
router.get("/allUsers",userController.getAllUsers)
router.post("/changePassword",userController.changePassword);
router.post("/location", tokenMiddleware, userController.updateUserLocation);

module.exports = router;
