require('dotenv').config();
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const csrf = require('csurf');
const flash = require('connect-flash');

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
app.use(csrf());
app.use(flash());

app.use((req, res, next) => {
	res.locals.isAuthenticated = req.session.isAuthenticated;
	res.locals.csrfToken = req.csrfToken();
	next();
});

app.use((req, res, next) => {
	if (!req.session.isAuthenticated || !req.session.user) {
		return next();
	}
	User.findById(req.session.user._id)
		.then(user => {
			if (!user) {
				return next();
			}
			req.user = user;
			next();
		})
		.catch(err => {
			err.httpSatusCode = 500;
			next(new Error(err));
		});
});

app.use('/admin', adminRoutes);
app.use('/auth', authRoutes);
app.use(shopRoutes);

app.get('/500', errorController.get500);

app.use(errorController.get404);

app.use((error, req, res, next) => {
	console.log(error);
	res.redirect('/500');
});

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
