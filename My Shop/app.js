require('dotenv').config();
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const errorController = require('./controllers/error');
const User = require('./models/user');

const MONGODB_URI = `mongodb+srv://coder:${process.env.DB_PWD}@cluster0.iovzfcd.mongodb.net/shop?retryWrites=true&w=majority`;
let Mongo_Client;

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
		store: MongoStore.create({
			client: Mongo_Client,
			mongoUrl: MONGODB_URI,
			collectionName: 'sessions',
		}),
	})
);

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

mongoose
	.connect(MONGODB_URI)
	.then(result => {
		Mongo_Client = result;
		console.log('Database Connected');
		app.listen(3000);
	})
	.catch(err => {
		console.log(err);
	});
