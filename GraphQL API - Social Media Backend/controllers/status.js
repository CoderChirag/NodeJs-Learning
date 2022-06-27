const User = require('../models/user');

/** @type {import('express').RequestHandler} */
exports.getStatus = (req, res, next) => {
	User.findById(req.userId)
		.then(user => {
			if (!user) {
				const error = new Error('User not found.');
				error.statusCode = 404;
				throw error;
			}
			res.status(200).json({
				message: 'User status fetched.',
				status: user.status,
			});
		})
		.catch(err => {
			if (!err.statusCode) {
				err.statusCode = 500;
			}
			next(err);
		});
};

/** @type {import('express').RequestHandler} */
exports.updateStatus = (req, res, next) => {
	const status = req.body.status;
	User.findById(req.userId)
		.then(user => {
			if (!user) {
				const error = new Error('User not found.');
				error.statusCode = 404;
				throw error;
			}
			user.status = status;
			return user.save();
		})
		.then(result => {
			res.status(200).json({
				message: 'User status updated.',
				status: result.status,
			});
		})
		.catch(err => {
			if (!err.statusCode) {
				err.statusCode = 500;
			}
			next(err);
		});
};
