const fs = require('fs');
const path = require('path');
const Cart = require('./cart');

const p = path.join(
	path.dirname(require.main.filename),
	'data',
	'products.json'
);

const getProductsFromFile = cb => {
	fs.readFile(p, (err, fileContent) => {
		if (err) {
			return cb([]);
		}
		return cb(JSON.parse(fileContent));
	});
};

module.exports = class Product {
	constructor(id, title, imageUrl, price, description) {
		this.id = id;
		this.title = title;
		this.imageUrl = imageUrl;
		this.price = price;
		this.description = description;
	}

	save() {
		getProductsFromFile(products => {
			if (this.id) {
				const existingProductIndex = products.findIndex(
					prod => prod.id === this.id
				);
				const updatedProducts = [...products];
				updatedProducts[existingProductIndex] = this;
				fs.writeFile(p, JSON.stringify(updatedProducts), err => {
					console.log(err);
				});
			} else {
				this.id = `${Math.random()}`;
				products.push(this);
				fs.writeFile(p, JSON.stringify(products), err => {
					console.log(err);
				});
			}
		});
	}

	static deleteById(id) {
		getProductsFromFile(products => {
			const updatedProducts = products.filter(prod => prod.id !== id);
			fs.writeFile(p, JSON.stringify(updatedProducts), err => {
				if (!err) {
					const product = products.find(prod => prod.id === id);
					Cart.deleteProduct(id, product.price);
				} else {
					console.log(error);
				}
			});
		});
	}

	static fetchAll(cb) {
		getProductsFromFile(cb);
	}

	static findById(id, cb) {
		getProductsFromFile(products => {
			const prod = products.find(p => p.id === id);
			cb(prod);
		});
	}
};
