const Product = require('../models/product');
const Cart = require('../models/cart');

exports.getProducts = (req, res, next) => {
	Product.fetchAll(products => {
		res.render('shop/product-list', {
			prods: products,
			pageTitle: 'All Products',
			path: '/products',
		});
	});
};

exports.getProduct = (req, res, next) => {
	const prodId = parseFloat(req.params.productId);
	Product.findById(prodId, product => {
		res.render('shop/product-detail', {
			product,
			pageTitle: product.title,
			path: '/products',
		});
	});
};

exports.getIndex = (req, res, next) => {
	Product.fetchAll(products => {
		res.render('shop/index', {
			prods: products,
			pageTitle: 'Shop',
			path: '/',
		});
	});
};

exports.getCart = (req, res, next) => {
	Cart.getProducts(cart => {
		Product.fetchAll(products => {
			const cartproducts = [];
			for (product of products) {
				const cartProductData = cart.products.find(
					prod => prod.id === product.id
				);
				if (cartProductData) {
					cartproducts.push({
						productData: product,
						qty: cartProductData.qty,
					});
				}
			}
			res.render('shop/cart', {
				path: '/cart',
				pageTitle: 'Your Cart',
				products: cartproducts,
			});
		});
	});
};

exports.postCart = (req, res, next) => {
	const prodId = req.body.productId.trim();
	Product.findById(prodId, product => {
		Cart.addProduct(product.id, parseFloat(product.price));
	});
	res.redirect('/cart');
};

exports.postDeleteCartProducts = (req, res, next) => {
	const prodId = req.body.productId.trim();
	Product.findById(prodId, product => {
		Cart.deleteProduct(prodId, product.price);
		res.redirect('/cart');
	});
};

exports.getOrders = (req, res, next) => {
	res.render('shop/orders', {
		path: '/orders',
		pageTitle: 'Your Orders',
	});
};

exports.getCheckout = (req, res, next) => {
	res.render('shop/checkout', {
		path: '/checkout',
		pageTitle: 'Checkout',
	});
};
