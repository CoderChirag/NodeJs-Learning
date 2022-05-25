const { Model, Sequelize } = require('sequelize');

const sequelize = require('../util/database');

class User extends Model {}

User.init(
	{
		id: {
			type: Sequelize.INTEGER,
			autoIncrement: true,
			allowNull: false,
			primaryKey: true,
		},
		name: Sequelize.STRING,
		email: Sequelize.STRING,
	},
	{
		sequelize,
	}
);

module.exports = User;
