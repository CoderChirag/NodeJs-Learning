const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const { validationResult } = require('express-validator');

const User = require('../models/user');

const transporter = nodemailer.createTransport(
	sendgridTransport({
		auth: {
			api_key: process.env.SENDGRID_KEY,
		},
	})
);

/** @type {import("express").RequestHandler} */
exports.getLogin = (req, res, next) => {
	if (req.session.isAuthenticated) return res.redirect('/');
	let message = req.flash('error');
	if (message.length > 0) {
		message = message[0];
	} else {
		message = null;
	}
	res.render('auth/login', {
		path: '/auth/login',
		pageTitle: 'Login',
		errorMessage: message,
	});
};

/** @type {import("express").RequestHandler} */
exports.getSignup = (req, res, next) => {
	if (req.session.isAuthenticated) return res.redirect('/');
	let message = req.flash('error');
	if (message.length > 0) {
		message = message[0];
	} else {
		message = null;
	}
	res.render('auth/signup', {
		path: '/auth/signup',
		pageTitle: 'Signup',
		errorMessage: message,
		oldInput: null,
		validationErrors: [],
	});
};

/** @type {import("express").RequestHandler} */
exports.getLogout = (req, res, next) => {
	if (req.session.isAuthenticated) {
		req.session.destroy(err => {
			if (err) {
				console.log(err);
			}
			return res.redirect('/');
		});
	} else {
		return res.redirect('/');
	}
};

/** @type {import("express").RequestHandler} */
exports.getReset = (req, res, next) => {
	if (req.session.isAuthenticated) return res.redirect('/');
	let message = req.flash('error');
	if (message.length > 0) {
		message = message[0];
	} else {
		message = null;
	}
	res.render('auth/reset', {
		path: '/auth/reset',
		pageTitle: 'Reset Password',
		errorMessage: message,
	});
};

/** @type {import("express").RequestHandler} */
exports.getUpdatePassword = (req, res, next) => {
	if (req.session.isAuthenticated) return res.redirect('/');
	const token = req.params.token;
	User.findOne({
		resetToken: token,
		resetTokenExpiration: { $gt: Date.now() },
	}).then(user => {
		if (!user) {
			req.flash('error', 'Invalid Token');
			return res.redirect('/auth/reset');
		}
		let message = req.flash('error');
		if (message.length > 0) {
			message = message[0];
		} else {
			message = null;
		}
		res.render('auth/update-password', {
			path: '/auth/update-password',
			pageTitle: 'Update Password',
			errorMessage: message,
			userId: user._id.toString(),
			passwordToken: token,
		});
	});
};

/** @type {import("express").RequestHandler} */
exports.postLogin = (req, res, next) => {
	if (req.session.isAuthenticated) return res.redirect('/');
	const email = req.body.email;
	const password = req.body.password;
	return User.findOne({ email })
		.then(user => {
			if (!user) {
				req.flash('error', 'Invalid Login Credentials');
				return res.redirect('/auth/login');
			}
			bcrypt
				.compare(password, user.password)
				.then(result => {
					if (result) {
						req.session.user = user;
						req.session.isAuthenticated = true;
						return req.session.save(err => {
							if (err) console.log(err);
							res.redirect('/');
						});
					}
					req.flash('error', 'Invalid Login Credentials');
					return res.redirect('/auth/login');
				})
				.catch(err => {
					console.log(err);
				});
		})
		.catch(err => {
			console.log(err);
		});
};

/** @type {import("express").RequestHandler} */
exports.postSignup = (req, res, next) => {
	const email = req.body.email;
	const password = req.body.password;
	const confirmPassword = req.body.confirmPassword;
	const errors = validationResult(req);
	console.log(errors.array());
	if (!errors.isEmpty()) {
		return res.status(422).render('auth/signup', {
			path: '/auth/signup',
			pageTitle: 'Signup',
			errorMessage: errors.array()[0].msg,
			oldInput: {
				email,
				password,
				confirmPassword,
			},
			validationErrors: errors.array(),
		});
	}

	bcrypt
		.hash(password, 12)
		.then(hashedPwd => {
			const newUser = new User({
				email,
				password: hashedPwd,
				cart: { items: [] },
			});
			return newUser.save();
		})
		.then(newUser => {
			res.redirect('/auth/login');
			return transporter.sendMail({
				to: email,
				from: 'jain.chirag0174@gmail.com',
				subject: 'Signup succeeded!',
				html: '<h1>You successfully signed up!</h1>',
			});
		})
		.then(result => {
			console.log('Email Sent');
		})
		.catch(err => {
			console.log(err);
		});
};

/** @type {import("express").RequestHandler} */
exports.postReset = (req, res, next) => {
	crypto.randomBytes(32, (err, buffer) => {
		if (err) {
			console.log(err);
			return res.redirect('/auth/reset');
		}
		const token = buffer.toString('hex');
		User.findOne({ email: req.body.email })
			.then(user => {
				if (!user) {
					req.flash('error', 'No account with that email found');
					return null;
				}
				user.resetToken = token;
				user.resetTokenExpiration = Date.now() + 1000 * 60 * 60; // 1 hour from now
				return user.save();
			})
			.then(result => {
				if (!result) {
					return res.redirect('/auth/reset');
				}
				res.redirect('/');
				transporter
					.sendMail({
						to: req.body.email,
						from: 'jain.chirag0174@gmail.com',
						subject: 'Password Reset',
						html: `
                <p>You requested a password reset</p>
                <p>Click this <a href="http://localhost:3000/auth/reset/${token}">link</a> to set a new password</p>
                `,
					})
					.then(result => {
						console.log('Email Sent');
					})
					.catch(err => console.log(err));
			})
			.catch(err => console.log(err));
	});
};

/** @type {import("express").RequestHandler} */
exports.postUpdatePassword = (req, res, next) => {
	const userId = req.body.userId;
	const newPassword = req.body.password;
	const passwordToken = req.body.passwordToken;
	User.findOne({
		resetToken: passwordToken,
		resetTokenExpiration: { $gt: Date.now() },
		_id: userId,
	})
		.then(user => {
			if (!user) {
				req.flash(
					'error',
					'Password reset token is invalid or has expired'
				);
				return res.redirect('/auth/reset');
			}
			bcrypt
				.hash(newPassword, 12)
				.then(hashedPwd => {
					user.password = hashedPwd;
					user.resetToken = undefined;
					user.resetTokenExpiration = undefined;
					return user.save();
				})
				.then(result => {
					return res.redirect('/auth/login');
				});
		})
		.catch(err => console.log(err));
};
