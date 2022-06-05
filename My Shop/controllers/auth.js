/** @type {import("express").RequestHandler} */
exports.getLogin = (req, res, next) => {
	console.log(req.session);
	res.render('auth/login', {
		path: '/login',
		pageTitle: 'Login',
		isAuthenticated: req.session.isLoggedIn,
	});
};

/** @type {import("express").RequestHandler} */
exports.postLogin = (req, res, next) => {
	req.session.isLoggedIn = true;
	res.redirect('/');
};
