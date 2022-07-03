const expect = require('chai').expect;
const sinon = require('sinon');
const jwt = require('jsonwebtoken');

const authMiddleware = require('../middleware/is-auth');
describe('Auth Middleware', () => {
	it('should throw an error if no authorization header is present', () => {
		const req = {
			get: function (headerName) {
				return null;
			},
		};
		expect(authMiddleware.bind(this, req, {}, () => {})).to.throw(
			'Not authenticated.'
		);
	});

	it('should throw an error if the authorization header is only one string', () => {
		const req = {
			get: function (headerName) {
				return 'xyz';
			},
		};
		expect(authMiddleware.bind(this, req, {}, () => {})).to.throw();
	});

	it('should throw an error if the token cannot be verified', () => {
		const req = {
			get: function (headerName) {
				return 'Bearer xyz';
			},
		};
		expect(authMiddleware.bind(this, req, {}, () => {})).to.throw();
	});

	it('should yield a userId after  decoding the token', () => {
		const req = {
			get: function (headerName) {
				return 'Bearer xyz';
			},
		};
		sinon.stub(jwt, 'verify');
		jwt.verify.returns({ userId: 'abc' });
		authMiddleware(req, {}, () => {});
		expect(req).to.have.property('userId', 'abc');
		expect(jwt.verify.called).to.be.true;
		jwt.verify.restore();
	});
});
