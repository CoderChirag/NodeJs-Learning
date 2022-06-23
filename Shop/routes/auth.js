const express = require('express');
const { check, body } = require('express-validator');

const authController = require('../controllers/auth');
const User = require('../models/user');

const router = express.Router();

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.get('/logout', authController.getLogout);

router.get('/reset', authController.getReset);

router.get('/reset/:token', authController.getUpdatePassword);

router.post(
	'/signup',
	[
		check('email')
			.isEmail()
			.withMessage('Invalid email.')
			.custom(value => {
				return User.findOne({ email: value }).then(userDoc => {
					if (userDoc) {
						return Promise.reject('Email address already exists.');
					}
				});
			})
			.normalizeEmail(),
		body(
			'password',
			'Password must be at least 8 characters long.'
		).isStrongPassword({
			minLength: 8,
			minNumbers: 0,
			minLowercase: 0,
			minSymbols: 0,
			minUppercase: 0,
		}),
		body('confirmPassword').custom((value, { req }) => {
			if (value !== req.body.password) {
				throw new Error('Passwords do not match.');
			}
			return true;
		}),
	],
	authController.postSignup
);

router.post('/login', authController.postLogin);

router.post('/reset', authController.postReset);

router.post('/update-password', authController.postUpdatePassword);

module.exports = router;
