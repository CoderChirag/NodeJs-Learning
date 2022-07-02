const clearImage = require('../utils/file').clearImage;

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
