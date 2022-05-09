const path = require('path');

const express = require('express');

const rootDir = require('../util/path');
const adminData = require('./admin');

const router = express.Router();

router.get('/', (req, res, next) => {
	const products = adminData.products;
	res.render('shop', {
		prods: products,
		pageTitle: 'My Shop',
		path: '/',
		hasProducts: products.length > 0,
		productCSS: true,
		activeShop: true,
	});
});

module.exports = router;
