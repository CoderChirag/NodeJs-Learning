// net start mysql80 - for starting mysql server in windows
require('dotenv').config();
const Sequelize = require('sequelize').Sequelize; //Adding '.Sequelize' just to make VS Code's Intellisense work. You can also write const Sequelize = require('sequelize');

const sequelize = new Sequelize('node_complete', 'root', process.env.DB_PWD, {
	dialect: 'mysql',
	host: 'localhost',
});

module.exports = sequelize;
