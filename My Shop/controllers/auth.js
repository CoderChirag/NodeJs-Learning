/** @type {import("express").RequestHandler} */
exports.getLogin = (req, res, next) => {
	const isLoggedIn = req.get('Cookie').split('=')[1];
	res.render('auth/login', {
		path: '/login',
		pageTitle: 'Login',
		isAuthenticated: isLoggedIn,
	});
};

/** @type {import("express").RequestHandler} */
exports.postLogin = (req, res, next) => {
	res.setHeader('Set-Cookie', 'loggedIn=true');
	res.redirect('/');
};
