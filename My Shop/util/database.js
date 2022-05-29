// net start mysql80 - for starting mysql server in windows
require('dotenv').config();
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

/** @type {mongodb.Db} */
let _db;

const mongoConnect = callback => {
	MongoClient.connect(
		`mongodb+srv://coder:${process.env.DB_PWD}@cluster0.iovzfcd.mongodb.net/shop?retryWrites=true&w=majority`
	)
		.then(client => {
			console.log('Connected!');
			_db = client.db();
			callback();
		})
		.catch(err => {
			console.log(err);
			throw err;
		});
};

const getDb = () => {
	if (_db) return _db;
	throw 'No database found!';
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
