require('dotenv').config();
const expect = require('chai').expect;
const mongoose = require('mongoose');

const User = require('../models/user');
const StatusController = require('../controllers/status');

console.log(process.env.MONGO_PWD);

describe('Status Controller - Get Status', () => {
	it('should send a response with a valid user status for an existing user', done => {
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
			})
			.catch(err => console.log(err));
	});
});
