const express = require('express');

const feedRoutes = require('./routes/feed');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/feed', feedRoutes);

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
