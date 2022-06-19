const express = require('express');
const { body } = require('express-validator');
const multer = require('multer');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

const storage = multer.diskStorage({
	destination: 'public/uploads/images',
	filename: (req, file, cb) => {
		cb(
			null,
			`${Date.now()}-${Math.round(Math.random() * 1e9)}-${
				file.originalname
			}`
		);
	},
});

// /admin/add-product => GET
router.get('/add-product', isAuth, adminController.getAddProduct);

// /admin/products => GET
router.get('/products', isAuth, adminController.getProducts);

// /admin/add-product => POST
router.post(
	'/add-product',
	multer({ storage }).single('image'),
	[
		body('title').isString().isLength({ min: 3 }).trim(),
		body('price').isFloat(),
		body('description').isLength({ min: 5, max: 400 }).trim(),
	],
	isAuth,
	adminController.postAddProduct
);

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

router.post(
	'/edit-product',
	[
		body('title').isString().isLength({ min: 3 }).trim(),
		body('imageUrl').isURL(),
		body('price').isFloat(),
		body('description').isLength({ min: 5, max: 400 }).trim(),
	],
	isAuth,
	adminController.postEditProduct
);

router.post('/delete-product', isAuth, adminController.postDeleteProduct);

module.exports = router;
