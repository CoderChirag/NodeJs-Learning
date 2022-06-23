const { validationResult } = require('express-validator');

const Post = require('../models/post');

/** @type {import('express').RequestHandler} */
exports.getPosts = (req, res, next) => {
	Post.find()
		.then(posts => {
			return res.status(200).json({
				message: 'Fetched posts successfully.',
				posts,
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
exports.getPost = (req, res, next) => {
	const postId = req.params.postId;
	Post.findById(postId)
		.then(post => {
			if (!post) {
				const error = new Error('Could not find post.');
				error.statusCode = 404;
				throw error;
			}
			return res.status(200).json({
				message: 'Post fetched.',
				post,
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
exports.createPost = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const error = new Error(
			'Validation failed, entered data is incorrect.'
		);
		error.statusCode = 422;
		throw error;
	}
	const title = req.body.title;
	const content = req.body.content;
	// Create post in db
	const post = new Post({
		title,
		content,
		imageUrl: 'images/duck.jpg',
		creator: { name: 'Coder' },
	});
	post.save()
		.then(post => {
			console.log(post);
			res.status(201).json({
				message: 'Post created successfully',
				post,
			});
		})
		.catch(err => {
			if (!err.statusCode) {
				err.statusCode = 500;
			}
			next(err);
		});
};
