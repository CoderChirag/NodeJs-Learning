const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');

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

	User.findOne({ email })
		.then(user => {
			if (user) {
				req.flash('error', 'Email already exists');
				return res.redirect('/auth/signup');
			}
			return bcrypt
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
		})
		.catch(err => {
			console.log(err);
		});
};
