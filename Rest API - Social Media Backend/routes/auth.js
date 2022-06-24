const express = require('express');
const { body } = require('express-validator');

const User = require('../models/user');
const authController = require('../controllers/auth');

const router = express.Router();

// PUT /signup
router.put(
	'/signup',
	[
		body('email')
			.isEmail()
			.withMessage('Please enter a valid email.')
			.custom((value, { req }) => {
				return User.findOne({ email: value }).then(userDoc => {
					if (userDoc) {
						return Promise.reject('Email address already exists.');
					}
				});
			})
			.normalizeEmail(),
		body('password')
			.trim()
			.isLength({ min: 5 })
			.withMessage('Password must be at least 5 characters.'),
	],
	authController.signup
);

module.exports = router;
