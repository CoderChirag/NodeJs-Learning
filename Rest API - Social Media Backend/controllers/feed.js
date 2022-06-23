/** @type {import('express').RequestHandler} */
exports.getPosts = (req, res, next) => {
	res.status(200).json({
		posts: [
			{
				_id: 1,
				title: 'First Post',
				content: 'This is the first post',
				imageUrl: 'images/duck.jpg',
				creator: {
					name: 'Coder',
				},
				createdAt: new Date(),
			},
		],
	});
};
