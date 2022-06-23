/** @type {import("express").RequestHandler} */
exports.get404 = (req, res, next) => {
	res.status(404).render('404', {
		pageTitle: 'Page not found',
		path: req.url,
	});
};

/** @type {import("express").RequestHandler} */
exports.get500 = (req, res, next) => {
	res.status(500).render('500', {
		pageTitle: 'Page not found',
		path: req.url,
	});
};
