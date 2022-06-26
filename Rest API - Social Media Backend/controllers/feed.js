const path = require('path');
const fs = require('fs');
const { validationResult } = require('express-validator');

const User = require('../models/user');
const Post = require('../models/post');

/** @type {import('express').RequestHandler} */
exports.getPosts = (req, res, next) => {
	const currentPage = +req.query.page || 1;
	const perPage = +req.query.perPage || 2;
	let totalItems;
	Post.find()
		.countDocuments()
		.then(count => {
			totalItems = count;
			return Post.find()
				.populate('creator')
				.skip((currentPage - 1) * perPage)
				.limit(perPage);
		})
		.then(posts => {
			res.status(200).json({
				message: 'Posts fetched successfully.',
				posts,
				totalItems,
				currentPage,
				perPage,
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
		.populate('creator')
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
	if (!req.file) {
		const error = new Error('No image provided.');
		error.statusCode = 422;
		throw error;
	}
	const imageUrl = req.file.path.replace(/\\/g, '/');
	const title = req.body.title;
	const content = req.body.content;
	let creator;
	// Create post in db
	const post = new Post({
		title,
		content,
		imageUrl,
		creator: req.userId,
	});
	post.save()
		.then(result => {
			console.log(result);
			return User.findById(req.userId);
		})
		.then(user => {
			creator = user;
			user.posts.push(post);
			return user.save();
		})
		.then(result => {
			res.status(201).json({
				message: 'Post created successfully',
				post,
				creator: { _id: creator._id, name: creator.name },
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
exports.updatePost = (req, res, next) => {
	const postId = req.params.postId;
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
	let imageUrl = req.body.image;
	if (req.file) {
		imageUrl = req.file.path.replace(/\\/g, '/');
	}
	if (!imageUrl) {
		const error = new Error('No file picked.');
		error.statusCode = 422;
		throw error;
	}
	Post.findById(postId)
		.then(post => {
			if (!post) {
				const error = new Error('Could not find post.');
				error.statusCode = 404;
				throw error;
			}
			if (post.creator.toString() !== req.userId) {
				const error = new Error('Not authorized.');
				error.statusCode = 403;
				throw error;
			}
			if (imageUrl !== post.imageUrl) {
				clearImage(post.imageUrl);
			}
			post.title = title;
			post.content = content;
			post.imageUrl = imageUrl;
			return post.save();
		})
		.then(result => {
			res.status(200).json({
				message: 'Post updated successfully.',
				post: result,
			});
		})
		.catch(err => {
			if (!err.statusCode) {
				err.statusCode = 500;
			}
			next(err);
		});
};

const clearImage = filePath => {
	filePath = path.join(__dirname, '..', filePath);
	fs.unlink(filePath, err => console.log(err));
};

/** @type {import('express').RequestHandler} */
exports.deletePost = (req, res, next) => {
	const postId = req.params.postId;
	Post.findById(postId)
		.then(post => {
			if (!post) {
				const error = new Error('Could not find post.');
				error.statusCode = 404;
				throw error;
			}
			if (post.creator.toString() !== req.userId) {
				const error = new Error('Not authorized.');
				error.statusCode = 403;
				throw error;
			}
			clearImage(post.imageUrl);
			return Post.findByIdAndRemove(postId);
		})
		.then(result => {
			console.log(result);
			return User.findById(req.userId);
		})
		.then(user => {
			user.posts.pull(postId);
			return user.save();
		})
		.then(result => {
			res.status(200).json({
				message: 'Post deleted successfully.',
				post: result,
			});
		})
		.catch(err => {
			if (!err.statusCode) {
				err.statusCode = 500;
			}
			next(err);
		});
};
