require('dotenv').config();
const expect = require('chai').expect;
const mongoose = require('mongoose');

const User = require('../models/user');
const StatusController = require('../controllers/status');

describe('Status Controller - Get Status', () => {
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

	it('should send a response with a valid user status for an existing user', done => {
		const req = { userId: '5e9f8f8f8f8f8f8f8f8f8f8f' };
		const res = {
			statusCode: 500,
			userStatus: null,
			status: function (code) {
				this.statusCode = code;
				return this;
			},
			json: function (data) {
				this.userStatus = data.status;
			},
		};
		StatusController.getStatus(req, res, () => {}).then(() => {
			expect(res.statusCode).to.equal(200);
			expect(res.userStatus).to.equal('I am new!');
			done();
		});
	});

	after(done => {
		User.deleteMany({})
			.then(() => {
				return mongoose.disconnect();
			})
			.then(() => {
				done();
			});
	});
});
