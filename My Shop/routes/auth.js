const express = require('express');

const authController = require('../controllers/auth');

const router = express.Router();

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.get('/logout', authController.getLogout);

router.get('/reset', authController.getReset);

router.get('/reset/:token', authController.getUpdatePassword);

router.post('/signup', authController.postSignup);

router.post('/login', authController.postLogin);

router.post('/reset', authController.postReset);

router.post('/update-password', authController.postUpdatePassword);

module.exports = router;
