const dotenv = require('dotenv');
dotenv.config();
const mysql = require('mysql2');

const pool = mysql.createPool({
	host: 'localhost',
	user: 'root',
	database: 'node_complete',
	password: process.env.DB_PWD,
});

module.exports = pool.promise();
