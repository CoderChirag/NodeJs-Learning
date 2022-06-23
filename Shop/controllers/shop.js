const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const stripe = require('stripe')(process.env.STRIPE_KEY);

const Product = require('../models/product');
const Order = require('../models/order');

const ITEMS_PER_PAGE = 1;

/** @type {import("express").RequestHandler} */
exports.getProducts = (req, res, next) => {
	const page = +req.query.page || 1;
	let totalItems;

	Product.find()
		.countDocuments()
		.then(numProducts => {
			totalItems = numProducts;
			return Product.find()
				.skip((page - 1) * ITEMS_PER_PAGE)
				.limit(ITEMS_PER_PAGE);
		})
		.then(products => {
			res.render('shop/product-list', {
				prods: products,
				pageTitle: 'Products',
				path: '/products',
				totalProducts: totalItems,
				hasNextPage: ITEMS_PER_PAGE * page < totalItems,
				hasPreviousPage: page > 1,
				nextPage: page + 1,
				previousPage: page - 1,
				lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
				currentPage: page,
			});
		})
		.catch(err => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
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
			});
		})
		.catch(err => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

/** @type {import("express").RequestHandler} */
exports.getIndex = (req, res, next) => {
	const page = +req.query.page || 1;
	let totalItems;

	Product.find()
		.countDocuments()
		.then(numProducts => {
			totalItems = numProducts;
			return Product.find()
				.skip((page - 1) * ITEMS_PER_PAGE)
				.limit(ITEMS_PER_PAGE);
		})
		.then(products => {
			res.render('shop/index', {
				prods: products,
				pageTitle: 'Shop',
				path: '/',
				totalProducts: totalItems,
				hasNextPage: ITEMS_PER_PAGE * page < totalItems,
				hasPreviousPage: page > 1,
				nextPage: page + 1,
				previousPage: page - 1,
				lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
				currentPage: page,
			});
		})
		.catch(err => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
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
			});
		})
		.catch(err => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

/** @type {import("express").RequestHandler} */
exports.getInvoice = (req, res, next) => {
	const orderId = req.params.orderId;
	Order.findById(orderId)
		.then(order => {
			if (
				!order ||
				order.user.userId.toString() !== req.user._id.toString()
			) {
				return res.status(404).render('404', {
					pageTitle: 'Page not found',
					path: req.url,
				});
			}
			const invoiceName = `${orderId}.pdf`;
			const invoicePath = path.join(
				__dirname,
				'..',
				'data',
				'invoices',
				invoiceName
			);
			res.setHeader('Content-Type', 'application/pdf');
			res.setHeader(
				'Content-Disposition',
				`inline; filename="${invoiceName}"`
			);
			const pdfDoc = new PDFDocument();
			pdfDoc.pipe(fs.createWriteStream(invoicePath));
			pdfDoc.pipe(res);

			pdfDoc.fontSize(26).text('Invoice', {
				underline: true,
			});
			pdfDoc.text('-----------------------');
			let totalPrice = 0;
			order.products.forEach(prod => {
				totalPrice += prod.quantity * prod.product.price;
				pdfDoc
					.fontSize(16)
					.text(
						`${prod.product.title} - ${prod.quantity} x $${prod.product.price}`
					);
			});
			pdfDoc.text('-----------------------');
			pdfDoc.fontSize(20).text(`Total Price: $${totalPrice}`);
			pdfDoc.end();
		})
		.catch(err => {
			if (err.kind === 'ObjectId') {
				return res.status(404).render('404', {
					pageTitle: 'Page not found',
					path: req.url,
				});
			}
			err.httpStatusCode = 500;
			return next(err);
		});
};

/** @type {import("express").RequestHandler} */
exports.getCheckout = (req, res, next) => {
	let products;
	let total = 0;
	req.user
		.populate('cart.items.product')
		.then(user => {
			products = user.cart.items;
			total = 0;
			products.forEach(p => {
				total += p.quantity * p.product.price;
			});

			return stripe.checkout.sessions.create({
				payment_method_types: ['card'],
				line_items: products.map(p => {
					return {
						name: p.product.title,
						description: p.product.description,
						amount: p.product.price * 100,
						currency: 'usd',
						quantity: p.quantity,
					};
				}),
				success_url: `${req.protocol}://${req.get(
					'host'
				)}/checkout/success`,
				cancel_url: `${req.protocol}://${req.get(
					'host'
				)}/checkout/cancel`,
			});
		})
		.then(session => {
			res.render('shop/checkout', {
				path: '/checkout',
				pageTitle: 'Checkout',
				products,
				totalSum: total,
				sessionId: session.id,
			});
		})
		.catch(err => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

/** @type {import("express").RequestHandler} */
exports.getCheckoutSuccess = (req, res, next) => {
	req.user
		.populate('cart.items.product')
		.then(user => {
			const products = user.cart.items.map(i => {
				return { quantity: i.quantity, product: { ...i.product._doc } };
			});
			const order = new Order({
				user: {
					email: req.user.email,
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
		.catch(err => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
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
		.catch(err => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

/** @type {import("express").RequestHandler} */
exports.postDeleteCartProducts = (req, res, next) => {
	const prodId = req.body.productId;
	req.user
		.removeFromCart(prodId)
		.then(result => {
			res.redirect('/cart');
		})
		.catch(err => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

/** @type {import("express").RequestHandler} */
exports.getOrders = (req, res, next) => {
	Order.find({ 'user.userId': req.user })
		.then(orders => {
			res.render('shop/orders', {
				path: '/orders',
				pageTitle: 'Your Orders',
				orders: orders,
			});
		})
		.catch(err => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};
