const path = require('path');
const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const filesController = require('../controllers/files');

const router = express.Router();

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

router.put(
	'/post-image',
	multer({ storage: fileStorage, fileFilter }).single('image'),
	filesController.uploadFile
);

module.exports = router;
