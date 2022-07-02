require('dotenv').config();
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const { graphqlHTTP } = require('express-graphql');

const graphqlSchema = require('./graphql/schema');
const graphqlResolvers = require('./graphql/resolvers');

const PORT = process.env.PORT || 8080;
const MONGO_URI = `mongodb+srv://coder:${process.env.MONGO_PWD}@cluster0.iovzfcd.mongodb.net/social-media?retryWrites=true&w=majority`;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader(
		'Access-Control-Allow-Methods',
		'GET, POST, PUT, PATCH, DELETE, OPTIONS'
	);
	res.setHeader(
		'Access-Control-Allow-Headers',
		'Content-Type, Authorization'
	);
	next();
});

app.use(
	'/graphql',
	graphqlHTTP({
		schema: graphqlSchema,
		rootValue: graphqlResolvers,
		graphiql: true,
		customFormatErrorFn(err) {
			if (!err.originalError) {
				return err;
			}
			const data = err.originalError.data;
			const message = err.message || 'An error occurred.';
			const statusCode = err.originalError.statusCode || 500;
			return { message, statusCode, data };
		},
	})
);

app.use((error, req, res, next) => {
	console.log(error);
	const status = error.statusCode || 500;
	const message = error.message;
	const data = error.data;
	res.status(status).json({ message: message, data });
});

mongoose
	.connect(MONGO_URI)
	.then(result => {
		console.log('Database connected');
		app.listen(PORT, () => {
			console.log(`Server is running on port ${PORT}`);
		});
	})
	.catch(err => console.log(err));
