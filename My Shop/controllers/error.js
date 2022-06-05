/** @type {import("express").RequestHandler} */
exports.get404 = (req, res, next) => {
	res.status(404).render('404', {
		pageTitle: 'Page not found',
		path: req.url,
		isAuthenticated: req.session.isAuthenticated,
	});
};
