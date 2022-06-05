require('dotenv').config();
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');

const errorController = require('./controllers/error');
const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
	session({
		secret: process.env.SESSION_SECRET_CODE,
		resave: false,
		saveUninitialized: false,
		cookie: {
			secure: false,
			maxAge: 1000 * 60 * 60 * 24, //One day
		},
	})
);

app.use((req, res, next) => {
	User.findById('6295cfb0ba55eb1597517dec')
		.then(user => {
			req.user = user;
			next();
		})
		.catch(err => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

mongoose
	.connect(
		`mongodb+srv://coder:${process.env.DB_PWD}@cluster0.iovzfcd.mongodb.net/shop?retryWrites=true&w=majority`
	)
	.then(result => {
		console.log('Database Connected');
		User.findOne().then(user => {
			if (!user) {
				const user = new User({
					name: 'coder',
					email: 'coder@test.com',
					cart: {
						items: [],
					},
				});
				user.save();
			}
		});
		app.listen(3000);
	})
	.catch(err => {
		console.log(err);
	});
