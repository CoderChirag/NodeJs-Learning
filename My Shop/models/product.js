const { Model, Sequelize } = require('sequelize');

const sequelize = require('../util/database');

// const Product = sequelize.define('product', {
// 	id: {
// 		type: Sequelize.INTEGER,
// 		autoIncrement: true,
// 		allowNull: false,
// 		primaryKey: true,
// 	},
// 	title: Sequelize.STRING,
// 	price: {
// 		type: Sequelize.DOUBLE,
// 		allowNull: false,
// 	},
// 	imageUrl: {
// 		type: Sequelize.STRING,
// 		allowNull: false,
// 	},
// 	description: {
// 		type: Sequelize.STRING,
// 		allowNull: false,
// 	},
// });

class Product extends Model {}

Product.init(
	{
		id: {
			type: Sequelize.INTEGER,
			autoIncrement: true,
			allowNull: false,
			primaryKey: true,
		},
		title: Sequelize.STRING,
		price: {
			type: Sequelize.DOUBLE,
			allowNull: false,
		},
		imageUrl: {
			type: Sequelize.STRING,
			allowNull: false,
		},
		description: {
			type: Sequelize.STRING,
			allowNull: false,
		},
	},
	{
		sequelize,
	}
);

module.exports = Product;
