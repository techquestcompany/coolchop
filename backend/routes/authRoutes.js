
const express = require('express');
const userController = require('../controllers/authController');
const router = express.Router();
const tokenMiddleware = require("../utils/tokenAuth")
const requireRole = require("../utils/requireRole");

router.post('/signup', userController.signup);
router.post('/login', userController.login);
router.post('/verify', userController.verifyCode);
router.post('/token', userController.verifyUserId);
router.get('/me', tokenMiddleware, requireRole("customer", "rider", "admin"), userController.getUserData);
router.post("/forgottenPassword",userController.forgottenPassword)
router.post("/resetPassword",userController.passwordReset);
router.get("/allUsers", tokenMiddleware, requireRole("admin"), userController.getAllUsers)
router.post("/changePassword",userController.changePassword);
router.post("/location", tokenMiddleware, requireRole("customer", "rider"), userController.updateUserLocation);

module.exports = router;
