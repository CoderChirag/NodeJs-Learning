require('dotenv').config();
const expect = require('chai').expect;
const mongoose = require('mongoose');

const User = require('../models/user');
const Post = require('../models/post');
const FeedController = require('../controllers/feed');

describe('Feed Controller - Create Post', () => {
	before(done => {
		mongoose
			.connect(
				`mongodb+srv://coder:${process.env.MONGO_PWD}@cluster0.iovzfcd.mongodb.net/test-messages?retryWrites=true&w=majority`
			)
			.then(result => {
				const user = new User({
					email: 'test@test.com',
					password: 'tester',
					name: 'Test',
					posts: [],
					_id: '5e9f8f8f8f8f8f8f8f8f8f8f',
				});
				return user.save();
			})
			.then(() => {
				done();
			});
	});

	it('should add a created post to the posts of the creator', done => {
		const req = {
			body: {
				title: 'Test Post',
				content: 'This is a test post',
			},
			file: {
				path: 'test/test.jpg',
			},
			userId: '5e9f8f8f8f8f8f8f8f8f8f8f',
		};
		const res = {
			status: function () {
				return this;
			},
			json: () => {},
		};

		FeedController.createPost(req, res, () => {}).then(savedUser => {
			expect(savedUser).to.have.property('posts');
			expect(savedUser.posts).to.have.length(1);
			done();
		});
	});

	after(done => {
		User.deleteMany({})
			.then(() => {
				return Post.deleteMany({});
			})
			.then(() => {
				return mongoose.disconnect();
			})
			.then(() => {
				done();
			});
	});
});
