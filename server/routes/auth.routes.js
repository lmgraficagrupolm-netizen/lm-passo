const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth_controller');

router.post('/login', authController.login);
router.post('/register', authController.register);
router.get('/users', authController.getAllUsers);
router.put('/users/:id/password', authController.changePassword);

module.exports = router;
