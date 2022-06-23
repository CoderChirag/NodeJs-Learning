const path = require('path');
const express = require('express');
const { body } = require('express-validator');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const feedController = require('../controllers/feed');

const fileStorage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, 'images');
	},
	filename: (req, file, cb) => {
		cb(null, `${uuidv4()}${path.extname(file.originalname)}`);
	},
});

const fileFilter = (req, file, cb) => {
	if (
		file.mimetype === 'image/png' ||
		file.mimetype === 'image/jpg' ||
		file.mimetype === 'image/jpeg'
	) {
		cb(null, true);
	} else {
		cb(null, false);
	}
};

const router = express.Router();

// GET /feed/posts
router.get('/posts', feedController.getPosts);

// GET /feed/posts/:postId
router.get('/posts/:postId', feedController.getPost);

// POST /feed/post
router.post(
	'/post',
	multer({ storage: fileStorage, fileFilter }).single('image'),
	[
		body('title').trim().isLength({ min: 5 }),
		body('content').trim().isLength({ min: 5 }),
	],
	feedController.createPost
);

module.exports = router;
