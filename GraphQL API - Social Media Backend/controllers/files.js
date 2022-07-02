const path = require('path');
const fs = require('fs');

exports.uploadFile = async (req, res, next) => {
	if (!req.isAuthenticated) {
		const error = new Error('Not authenticated.');
		error.statusCode = 401;
		throw error;
	}
	if (!req.file) {
		return res.status(200).json({ message: 'No file provided!' });
	}
	if (req.body.oldPath) {
		clearImage(req.body.oldPath);
	}
	return res.status(201).json({
		message: 'File Stored',
		filePath: req.file.path.replace(/\\/g, '/'),
	});
};

const clearImage = filePath => {
	filePath = path.join(__dirname, '..', filePath);
	fs.unlink(filePath, err => console.log(err));
};
