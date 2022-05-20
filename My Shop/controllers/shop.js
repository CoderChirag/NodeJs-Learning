const Product = require('../models/product');
const Cart = require('../models/cart');

exports.getProducts = (req, res, next) => {
	Product.fetchAll()
		.then(([rows, fielData]) => {
			res.render('shop/product-list', {
				prods: rows,
				pageTitle: 'All Products',
				path: '/products',
			});
		})
		.catch(errr => console.log(err));
};

exports.getProduct = (req, res, next) => {
	const prodId = parseFloat(req.params.productId);
	Product.findById(prodId)
		.then(([product]) => {
			res.render('shop/product-detail', {
				product: product[0],
				pageTitle: product.title,
				path: '/products',
			});
		})
		.catch(err => console.log(err));
};

exports.getIndex = (req, res, next) => {
	Product.fetchAll()
		.then(([rows, fieldData]) => {
			res.render('shop/index', {
				prods: rows,
				pageTitle: 'Shop',
				path: '/',
			});
		})
		.catch(err => console.log(err));
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
