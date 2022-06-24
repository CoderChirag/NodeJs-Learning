const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

const User = require('../models/user');

/** @type {import('express').RequestHandler} */
exports.signup = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const error = new Error(
			'Validation failed, entered data is incorrect.'
		);
		error.statusCode = 422;
		error.data = errors.array();
		throw error;
	}
	const email = req.body.email;
	const name = req.body.name;
	const password = req.body.password;
	bcrypt
		.hash(password, 12)
		.then(hashedPassword => {
			const user = new User({
				email: email,
				password: hashedPassword,
				name: name,
			});
			return user.save();
		})
		.then(result => {
			res.status(201).json({
				message: 'User created successfully!',
				user: result,
			});
		})
		.catch(err => {
			if (!err.statusCode) {
				err.statusCode = 500;
			}
			next(err);
		});
};
