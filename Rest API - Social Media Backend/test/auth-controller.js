const expect = require('chai').expect;
const sinon = require('sinon');

const User = require('../models/user');
const AuthController = require('../controllers/auth');

describe('Auth Controller - Login', () => {
	it('should throw an error with code 500 if accessing the databse fails', done => {
		sinon.stub(User, 'findOne');
		User.findOne.throws();

		const req = {
			body: {
				email: 'test@test.com',
				password: 'tester',
			},
		};

		AuthController.login(req, {}, () => {}).then(result => {
			expect(result).to.be.an('error');
			expect(result).to.have.property('statusCode', 500);
			done();
		});

		User.findOne.restore();
	});
});
