require('dotenv').config();
const jwt = require('jsonwebtoken');

/** @type {import('express').RequestHandler} */
module.exports = (req, res, next) => {
	const authHeader = req.get('Authorization');
	if (!authHeader) {
		const error = new Error('Not authenticated.');
		error.statusCode = 401;
		throw error;
	}
	const token = authHeader.split(' ')[1];
	let decodedToken;
	try {
		decodedToken = jwt.verify(token, process.env.JWT_SECRET);
	} catch (err) {
		err.statusCode = 500;
		next(err);
	}
	if (!decodedToken) {
		const error = new Error('Not authenticated.');
		error.statusCode = 401;
		next(error);
	}
	req.userId = decodedToken.userId;
	next();
};
