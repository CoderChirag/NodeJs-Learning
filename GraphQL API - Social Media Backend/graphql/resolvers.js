require('dotenv').config();
const bcrypt = require('bcryptjs');
const validator = require('validator');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const Post = require('../models/post');

module.exports = {
	createUser: async function ({ userInput }, req) {
		const errors = [];
		if (!validator.isEmail(userInput.email)) {
			errors.push({ message: 'Email is invalid' });
		}
		if (
			validator.isEmpty(userInput.password) ||
			!validator.isLength(userInput.password, { min: 5 })
		) {
			errors.push({ message: 'Password is invalid' });
		}
		if (errors.length > 0) {
			const error = new Error('Invalid input, please check your data.');
			error.data = errors;
			error.statusCode = 422;
			throw error;
		}
		const existingUser = await User.findOne({ email: userInput.email });
		if (existingUser) {
			throw new Error('User already exists!');
		}
		const hashedPassword = await bcrypt.hash(userInput.password, 12);
		const user = new User({
			email: userInput.email,
			name: userInput.name,
			password: hashedPassword,
		});
		const createdUser = await user.save();
		return { ...createdUser._doc, __id: createdUser._id.toString() };
	},
	login: async function ({ email, password }, req) {
		const user = await User.findOne({ email: email });
		if (!user) {
			const error = new Error('User does not exist!');
			error.statusCode = 401;
			throw error;
		}
		const isEqual = await bcrypt.compare(password, user.password);
		if (!isEqual) {
			const error = new Error('Password is incorrect!');
			error.statusCode = 401;
			throw error;
		}
		const token = jwt.sign(
			{
				userId: user._id.toString(),
				email: user.email,
			},
			process.env.JWT_SECRET,
			{ expiresIn: '1h' }
		);
		return { token: token, userId: user._id.toString() };
	},
	createPost: async function ({ postInput }, req) {
		if (!req.isAuthenticated) {
			const error = new Error('Not authenticated!');
			error.code = 401;
			throw error;
		}
		const errors = [];
		if (
			validator.isEmpty(postInput.title) ||
			!validator.isLength(postInput.title, { min: 5 })
		) {
			errors.push({
				message: 'Title should be at least 5 characters long',
			});
		}
		if (
			validator.isEmpty(postInput.content) ||
			!validator.isLength(postInput.content, { min: 5 })
		) {
			errors.push({
				message: 'Content should be at least 5 characters long',
			});
		}
		if (validator.isEmpty(postInput.imageUrl)) {
			errors.push({
				message: 'Image URL should be at least 5 characters long',
			});
		}
		if (errors.length > 0) {
			const error = new Error('Invalid input, please check your data.');
			error.data = errors;
			error.statusCode = 422;
			throw error;
		}
		const user = await User.findById(req.userId);
		if (!user) {
			const error = new Error('User does not exist!');
			error.statusCode = 401;
			throw error;
		}
		const post = new Post({
			title: postInput.title,
			content: postInput.content,
			imageUrl: postInput.imageUrl,
			creator: user,
		});
		const createdPost = await post.save();
		user.posts.push(createdPost);
		await user.save();
		return {
			...createdPost._doc,
			__id: createdPost._id.toString(),
			createdAt: createdPost.createdAt.toISOString(),
			updatedAt: createdPost.updatedAt.toISOString(),
		};
	},
	posts: async function ({ page }, req) {
		if (!req.isAuthenticated) {
			const error = new Error('Not authenticated!');
			error.code = 401;
			throw error;
		}
		if (!page) {
			page = 1;
		}
		const perPage = 2;
		const totalPosts = await Post.find().countDocuments();
		const posts = await Post.find()
			.sort({ createdAt: -1 })
			.skip((page - 1) * perPage)
			.limit(perPage)
			.populate('creator');
		return {
			posts: posts.map(p => {
				return {
					...p._doc,
					__id: p._id.toString(),
					createdAt: p.createdAt.toISOString(),
					updatedAt: p.updatedAt.toISOString(),
				};
			}),
			totalPosts,
		};
	},
	post: async function ({ postId }, req) {
		if (!req.isAuthenticated) {
			const error = new Error('Not authenticated!');
			error.code = 401;
			throw error;
		}
		const post = await Post.findById(postId).populate('creator');
		if (!post) {
			const error = new Error('Post not found!');
			error.statusCode = 404;
			throw error;
		}
		return {
			...post._doc,
			__id: post._id.toString(),
			createdAt: post.createdAt.toISOString(),
			updatedAt: post.updatedAt.toISOString(),
		};
	},
	updatePost: async function ({ postId, postInput }, req) {
		if (!req.isAuthenticated) {
			const error = new Error('Not authenticated!');
			error.code = 401;
			throw error;
		}
		const post = await Post.findById(postId).populate('creator');
		if (!post) {
			const error = new Error('Post not found!');
			error.statusCode = 404;
			throw error;
		}
		if (post.creator._id.toString() !== req.userId.toString()) {
			const error = new Error('Not authorized!');
			error.statusCode = 403;
			throw error;
		}
		const errors = [];
		if (
			validator.isEmpty(postInput.title) ||
			!validator.isLength(postInput.title, { min: 5 })
		) {
			errors.push({
				message: 'Title should be at least 5 characters long',
			});
		}
		if (
			validator.isEmpty(postInput.content) ||
			!validator.isLength(postInput.content, { min: 5 })
		) {
			errors.push({
				message: 'Content should be at least 5 characters long',
			});
		}
		if (validator.isEmpty(postInput.imageUrl)) {
			errors.push({
				message: 'Image URL should be at least 5 characters long',
			});
		}
		if (errors.length > 0) {
			const error = new Error('Invalid input, please check your data.');
			error.data = errors;
			error.statusCode = 422;
			throw error;
		}
		post.title = postInput.title;
		post.content = postInput.content;
		if (postInput.imageUrl !== 'undefined') {
			post.imageUrl = postInput.imageUrl;
		}
		const updatedPost = await post.save();
		return {
			...updatedPost._doc,
			__id: updatedPost._id.toString(),
			createdAt: updatedPost.createdAt.toISOString(),
			updatedAt: updatedPost.updatedAt.toISOString(),
		};
	},
};
