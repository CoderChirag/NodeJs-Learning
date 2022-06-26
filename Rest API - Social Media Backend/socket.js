let io;

module.exports = {
	init: httpServer => {
		io = require('socket.io')(httpServer, {
			cors: {
				origin: '*',
				methods: 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
				allowedHeaders: 'Content-Type, Authorization',
			},
		});
		io.on('connection', socket => {
			console.log('Client connected', socket.id);
			console.log(`Active Clients: ${io.engine.clientsCount}`);
			socket.on('disconnect', () => {
				console.log('Client disconnected', socket.id);
				console.log(`Active Clients: ${io.engine.clientsCount}`);
			});
		});
	},
	getIO: () => {
		if (!io) {
			throw new Error('Socket.io not initialized');
		}
		return io;
	},
};
