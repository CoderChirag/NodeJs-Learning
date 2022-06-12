const Product = require('../models/product');
const Order = require('../models/order');

/** @type {import("express").RequestHandler} */
exports.getProducts = (req, res, next) => {
	Product.find()
		.then(products => {
			res.render('shop/product-list', {
				prods: products,
				pageTitle: 'All Products',
				path: '/products',
				isAuthenticated: req.session.isAuthenticated,
			});
		})
		.catch(err => {
			console.log(err);
		});
};

/** @type {import("express").RequestHandler} */
exports.getProduct = (req, res, next) => {
	const prodId = req.params.productId;
	Product.findById(prodId)
		.then(product => {
			res.render('shop/product-detail', {
				product,
				pageTitle: product.title,
				path: '/products',
				isAuthenticated: req.session.isAuthenticated,
			});
		})
		.catch(err => console.log(err));
};

/** @type {import("express").RequestHandler} */
exports.getIndex = (req, res, next) => {
	Product.find()
		.then(products => {
			res.render('shop/index', {
				prods: products,
				pageTitle: 'Shop',
				path: '/',
				isAuthenticated: req.session.isAuthenticated,
			});
		})
		.catch(err => {
			console.log(err);
		});
};

/** @type {import("express").RequestHandler} */
exports.getCart = (req, res, next) => {
	req.user
		.populate('cart.items.product')
		.then(user => {
			res.render('shop/cart', {
				path: '/cart',
				pageTitle: 'Your Cart',
				products: user.cart.items,
				isAuthenticated: req.session.isAuthenticated,
			});
		})
		.catch(err => console.log(err));
};

/** @type {import("express").RequestHandler} */
exports.postCart = (req, res, next) => {
	const prodId = req.body.productId;
	Product.findById(prodId)
		.then(product => {
			return req.user.addToCart(product);
		})
		.then(result => {
			res.redirect('/cart');
		})
		.catch(err => console.log(err));
};

/** @type {import("express").RequestHandler} */
exports.postDeleteCartProducts = (req, res, next) => {
	const prodId = req.body.productId;
	req.user
		.removeFromCart(prodId)
		.then(result => {
			res.redirect('/cart');
		})
		.catch(err => console.log(err));
};

/** @type {import("express").RequestHandler} */
exports.getOrders = (req, res, next) => {
	Order.find({ 'user.userId': req.user })
		.then(orders => {
			res.render('shop/orders', {
				path: '/orders',
				pageTitle: 'Your Orders',
				orders: orders,
				isAuthenticated: req.session.isAuthenticated,
			});
		})
		.catch(err => console.log(err));
};

/** @type {import("express").RequestHandler} */
exports.postOrder = (req, res, next) => {
	req.user
		.populate('cart.items.product')
		.then(user => {
			const products = user.cart.items.map(i => {
				return { quantity: i.quantity, product: { ...i.product._doc } };
			});
			const order = new Order({
				user: {
					name: req.user.name,
					userId: req.user,
				},
				products,
			});
			return order.save();
		})
		.then(result => {
			req.user.cart = {
				items: [],
			};
			return req.user.save();
		})
		.then(result => {
			res.redirect('/orders');
		})
		.catch(err => console.log(err));
};
