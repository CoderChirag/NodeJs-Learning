const bcrypt = require('bcryptjs');

const User = require('../models/user');

/** @type {import("express").RequestHandler} */
exports.getLogin = (req, res, next) => {
	if (req.session.isAuthenticated) return res.redirect('/');
	res.render('auth/login', {
		path: '/login',
		pageTitle: 'Login',
	});
};

/** @type {import("express").RequestHandler} */
exports.getSignup = (req, res, next) => {
	if (req.session.isAuthenticated) return res.redirect('/');
	res.render('auth/signup', {
		path: '/signup',
		pageTitle: 'Signup',
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
				return res.redirect('/login');
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
					res.redirect('/login');
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
				return res.redirect('/signup');
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
					return res.redirect('/login');
				})
				.catch(err => {
					console.log(err);
				});
		})
		.catch(err => {
			console.log(err);
		});
};
