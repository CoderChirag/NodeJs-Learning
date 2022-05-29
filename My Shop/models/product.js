const mongodb = require('mongodb');
const getDb = require('../util/database').getDb;

class Product {
	constructor(title, price, description, imageUrl, id, userId) {
		this.title = title;
		this.price = price;
		this.description = description;
		this.imageUrl = imageUrl;
		this._id = id ? new mongodb.ObjectId(id) : null;
		this.userId = new mongodb.ObjectId(userId);
	}

	save() {
		const db = getDb();
		let dbOp;
		if (this._id) {
			// Update the product
			dbOp = db
				.collection('products')
				.updateOne({ _id: this._id }, { $set: this });
		} else {
			dbOp = db.collection('products').insertOne(this);
		}
		return dbOp;
	}

	static fetchAll() {
		const db = getDb();
		return db.collection('products').find({}).toArray();
	}

	static findById(prodId) {
		const db = getDb();
		return db
			.collection('products')
			.find({ _id: new mongodb.ObjectId(prodId) })
			.next();
	}

	static deleteById(prodId) {
		const db = getDb();
		return db
			.collection('products')
			.deleteOne({ _id: new mongodb.ObjectId(prodId) });
	}
}

module.exports = Product;
