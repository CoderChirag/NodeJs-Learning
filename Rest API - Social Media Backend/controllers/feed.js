const { validationResult } = require('express-validator');

const Post = require('../models/post');

/** @type {import('express').RequestHandler} */
exports.getPosts = (req, res, next) => {
	res.status(200).json({
		posts: [
			{
				_id: 1,
				title: 'First Post',
				content: 'This is the first post',
				imageUrl: 'images/duck.jpg',
				creator: {
					name: 'Coder',
				},
				createdAt: new Date(),
			},
		],
	});
};

/** @type {import('express').RequestHandler} */
exports.createPost = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({
			message: 'Validation failed, entered data is incorrect',
			errors: errors.array(),
		});
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
			console.log(err);
		});
};
