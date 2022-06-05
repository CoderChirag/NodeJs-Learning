const User = require('../models/user');

/** @type {import("express").RequestHandler} */
exports.getLogin = (req, res, next) => {
	console.log(req.session);
	if (req.session.isAuthenticated) return res.redirect('/');
	res.render('auth/login', {
		path: '/login',
		pageTitle: 'Login',
		isAuthenticated: req.session.isAuthenticated,
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
	return User.findOne()
		.then(user => {
			if (!user) {
				const user = new User({
					name: 'coder',
					email: 'coder@test.com',
					cart: {
						items: [],
					},
				});
				return user.save();
			}
			return user;
		})
		.then(user => {
			req.session.user = user;
			req.session.isAuthenticated = true;
			return res.redirect('/');
		})
		.catch(err => {
			console.log(err);
		});
};
