const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
	email: {
		type: String,
		required: true,
	},
	password: {
		type: String,
		required: true,
	},
	resetToken: String,
	resetTokenExpiration: Date,
	cart: {
		items: [
			{
				product: {
					type: Schema.Types.ObjectId,
					ref: 'Product',
					required: true,
				},
				quantity: { type: Number, required: true },
			},
		],
	},
});

userSchema.methods.addToCart = function (product) {
	const cartProductIndex = this.cart.items.findIndex(cp => {
		return cp.product.toString() === product._id.toString();
	});
	let newQuantity = 1;
	const updatedCartItems = [...this.cart.items];

	if (cartProductIndex >= 0) {
		newQuantity = this.cart.items[cartProductIndex].quantity + 1;
		updatedCartItems[cartProductIndex].quantity = newQuantity;
	} else {
		updatedCartItems.push({
			product: product._id,
			quantity: newQuantity,
		});
	}

	const updatedCart = {
		items: updatedCartItems,
	};

	this.cart = updatedCart;
	return this.save();
};

userSchema.methods.removeFromCart = function (productId) {
	const updatedCartItems = this.cart.items.filter(i => {
		return i.product.toString() !== productId.toString();
	});
	const updatedCart = { items: updatedCartItems };
	this.cart.items = updatedCartItems;
	return this.save();
};

module.exports = mongoose.model('User', userSchema);
