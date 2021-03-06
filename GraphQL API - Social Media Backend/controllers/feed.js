const path = require('path');
const fs = require('fs');
const { validationResult } = require('express-validator');

const io = require('../socket');
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
				.sort({ createdAt: -1 })
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
exports.createPost = async (req, res, next) => {
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
	// Create post in db
	const post = new Post({
		title,
		content,
		imageUrl,
		creator: req.userId,
	});
	try {
<<<<<<< HEAD:GraphQL API - Social Media Backend/controllers/feed.js
		await post.save();
		const user = await User.findById(req.userId);
		user.posts.push(post);
		await user.save();
		io.getIO().emit('posts', {
			action: 'create',
			post: {
				...post._doc,
				creator: { _id: req.userId, name: user.name },
			},
		});
		res.status(201).json({
			message: 'Post created successfully',
			post,
			creator: { _id: user._id, name: user.name },
		});
	} catch (error) {
		if (!error.statusCode) {
			error.statusCode = 500;
		}
		next(error);
=======
		let result = await post.save();
		console.log(result);
		const user = await User.findById(req.userId);
		creator = user;
		user.posts.push(post);
		const savedUser = await user.save();
		res.status(201).json({
			message: 'Post created successfully',
			post,
			creator: { _id: creator._id, name: creator.name },
		});
		return savedUser;
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
>>>>>>> testing:Rest API - Social Media Backend/controllers/feed.js
	}
};

/** @type {import('express').RequestHandler} */
exports.updatePost = async (req, res, next) => {
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
	try {
		const post = await Post.findById(postId).populate('creator');
		if (!post) {
			const error = new Error('Could not find post.');
			error.statusCode = 404;
			throw error;
		}
		if (post.creator._id.toString() !== req.userId) {
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
		const result = await post.save();
		io.getIO().emit('posts', { action: 'update', post: result });
		res.status(200).json({
			message: 'Post updated successfully.',
			post: result,
		});
	} catch (error) {
		if (!error.statusCode) {
			error.statusCode = 500;
		}
		next(error);
	}
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
			io.getIO().emit('posts', { action: 'delete', post: postId });
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
