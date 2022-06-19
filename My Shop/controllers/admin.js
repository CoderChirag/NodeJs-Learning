const Product = require('../models/product');
const { validationResult } = require('express-validator');

/** @type {import("express").RequestHandler} */
exports.getAddProduct = (req, res, next) => {
	res.render('admin/edit-product', {
		pageTitle: 'Add Product',
		path: '/admin/add-product',
		editing: false,
		hasError: false,
		errorMessage: null,
		validationErrors: [],
	});
};

/** @type {import("express").RequestHandler} */
exports.getEditProduct = (req, res, next) => {
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
				hasError: false,
				errorMessage: null,
				validationErrors: [],
			});
		})
		.catch(err => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

/** @type {import("express").RequestHandler} */
exports.getProducts = (req, res, next) => {
	Product.find({ user: req.user })
		.then(products => {
			res.render('admin/products', {
				prods: products,
				pageTitle: 'Admin Products',
				path: '/admin/products',
			});
		})
		.catch(err => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

/** @type {import("express").RequestHandler} */
exports.postAddProduct = (req, res, next) => {
	const title = req.body.title;
	const image = req.file;
	const price = parseFloat(req.body.price);
	const description = req.body.description;
	const errors = validationResult(req);

	console.log(errors.array());

	if (!errors.isEmpty()) {
		return res.status(422).render('admin/edit-product', {
			pageTitle: 'Add Product',
			path: '/admin/add-product',
			editing: false,
			hasError: true,
			product: {
				title,
				price,
				description,
			},
			errorMessage: errors.array()[0].msg,
			validationErrors: errors.array(),
		});
	}

	const product = new Product({
		title,
		price,
		description,
		imageUrl: `/${image.path.split('\\').slice(1).join('/')}`,
		user: req.user,
	});
	product
		.save()
		.then(product => {
			console.log('Created Product');
			res.redirect('/admin/products');
		})
		.catch(err => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

/** @type {import("express").RequestHandler} */
exports.postEditProduct = (req, res, next) => {
	const prodId = req.body.productId;
	const updatedTitle = req.body.title;
	const updatedPrice = req.body.price;
	const updatedImageUrl = req.body.imageUrl;
	const updatedDesc = req.body.description;
	const errors = validationResult(req);

	console.log(errors.array());

	if (!errors.isEmpty()) {
		return res.status(422).render('admin/edit-product', {
			pageTitle: 'Edit Product',
			path: '/admin/edit-product',
			editing: true,
			hasError: true,
			product: {
				title: updatedTitle,
				price: updatedPrice,
				imageUrl: updatedImageUrl,
				description: updatedDesc,
			},
			errorMessage: errors.array()[0].msg,
			validationErrors: errors.array(),
		});
	}

	Product.findById(prodId)
		.then(product => {
			if (product.user.toString() !== req.user._id.toString()) {
				return res.redirect('/');
			}
			product.title = updatedTitle;
			product.price = updatedPrice;
			product.description = updatedDesc;
			product.imageUrl = updatedImageUrl;
			return product
				.save()
				.then(result => {
					console.log('UPDATED PRODUCT!');
					res.redirect('/admin/products');
				})
				.catch(err => {
					const error = new Error(err);
					error.httpStatusCode = 500;
					return next(error);
				});
		})
		.catch(err => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

/** @type {import("express").RequestHandler} */
exports.postDeleteProduct = (req, res, next) => {
	const prodId = req.body.productId;
	Product.deleteOne({ _id: prodId, user: req.user })
		.then(result => {
			console.log('DELETED PRODUCT');
			res.redirect('/admin/products');
		})
		.catch(err => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};
