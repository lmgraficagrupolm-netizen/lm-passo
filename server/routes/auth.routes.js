const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth_controller');

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(process.cwd(), 'public/uploads/')),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

router.post('/login', authController.login);
router.post('/register', authController.register);
router.get('/users', authController.getAllUsers);
router.get('/users/passwords', authController.getUserPasswords);
router.put('/users/:id/password', authController.changePassword);
router.put('/users/:id/role', authController.updateRole);
router.delete('/users/:id', authController.deleteUser);
router.post('/users/:id/avatar', upload.single('avatar'), authController.uploadAvatar);

module.exports = router;

