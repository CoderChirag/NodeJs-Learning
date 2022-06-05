const Product = require('../models/product');

/** @type {import("express").RequestHandler} */
exports.getAddProduct = (req, res, next) => {
	if (!req.session.isAuthenticated) return res.redirect('/login');
	res.render('admin/edit-product', {
		pageTitle: 'Add Product',
		path: '/admin/add-product',
		editing: false,
		isAuthenticated: req.session.isAuthenticated,
	});
};

/** @type {import("express").RequestHandler} */
exports.postAddProduct = (req, res, next) => {
	if (!req.session.isAuthenticated) return res.redirect('/login');
	const title = req.body.title;
	const imageUrl = req.body.imageUrl;
	const price = parseFloat(req.body.price);
	const description = req.body.description;
	const product = new Product({
		title,
		price,
		description,
		imageUrl,
		user: req.user,
	});
	product.save().then(product => {
		console.log('Created Product');
		res.redirect('/admin/products');
	});
};

/** @type {import("express").RequestHandler} */
exports.getEditProduct = (req, res, next) => {
	if (!req.session.isAuthenticated) return res.redirect('/login');
	const editMode = req.query.edit;
	if (!editMode) {
		return res.redirect('/');
	}
	const prodId = req.params.productId;
	Product.findById(prodId)
		.then(product => {
			res.render('admin/edit-product', {
				pageTitle: 'Edit Product',
				path: '/admin/edit-product',
				editing: editMode,
				product,
				isAuthenticated: req.session.isAuthenticated,
			});
		})
		.catch(err => console.log(err));
};

/** @type {import("express").RequestHandler} */
exports.postEditProduct = (req, res, next) => {
	if (!req.session.isAuthenticated) return res.redirect('/login');
	const prodId = req.body.productId;
	const updatedTitle = req.body.title;
	const updatedPrice = req.body.price;
	const updatedImageUrl = req.body.imageUrl;
	const updatedDesc = req.body.description;

	Product.findByIdAndUpdate(prodId, {
		title: updatedTitle,
		price: updatedPrice,
		description: updatedDesc,
		imageUrl: updatedImageUrl,
	})
		.then(result => {
			console.log('UPDATED PRODUCT!');
			res.redirect('/admin/products');
		})
		.catch(err => console.log(err));
};

/** @type {import("express").RequestHandler} */
exports.getProducts = (req, res, next) => {
	if (!req.session.isAuthenticated) return res.redirect('/login');
	Product.find()
		.then(products => {
			res.render('admin/products', {
				prods: products,
				pageTitle: 'Admin Products',
				path: '/admin/products',
				isAuthenticated: req.session.isAuthenticated,
			});
		})
		.catch(err => console.log(err));
};

/** @type {import("express").RequestHandler} */
exports.postDeleteProduct = (req, res, next) => {
	if (!req.session.isAuthenticated) return res.redirect('/login');
	const prodId = req.body.productId;
	Product.findByIdAndDelete(prodId)
		.then(result => {
			console.log('DELETED PRODUCT');
			res.redirect('/admin/products');
		})
		.catch(err => {
			console.log(err);
		});
};
