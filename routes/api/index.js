const { main, rooms } = require('./data');

const generateId = () => {
	return Math.random().toString(36).slice(2);
};

module.exports = {
	getAllRooms: (_, res) => {
		res.json(rooms);
	},

	getRoomById: (req, res) => {
		const room = rooms.find((r) => r.id == req.params.id);
		if (!room) {
			res.status(404).send({
				message: 'Room not found',
			});
			return;
		}
		res.json(room);
	},

	createRoom: (req, res) => {
		const room = req.body;
		if (!room) {
			res.status(400).send({
				message: 'Bad request',
			});
			return;
		}

		room.id = generateId();
		room.ready = false;
		rooms.push(room);

		res.status(201).send({
			id: room.id,
		});
	},

	removeRoomById: (req, res) => {
		const roomIndex = rooms.findIndex((r) => r.id === req.params.id);
		if (roomIndex === -1) {
			res.status(404).send({
				message: 'Room not found',
			});
			return;
		}

		rooms.splice(roomIndex, 1);

		res.json({
			message: 'Removed',
		});
	},

	regenerateRoomIdById: (req, res) => {
		const room = rooms.find((r) => r.id === req.params.id);
		if (!room) {
			res.status(404).send({
				message: 'Room not found',
			});
			return;
		}

		room.id = generateId();

		res.json({
			id: room.id,
		});
	},

	regenerateRoomId: (_, res) => {
		rooms.forEach((room) => {
			room.id = generateId();
		});

		res.json(rooms.map((room) => room.id));
	},

	markRoomAsReady: (req, res) => {
		const room = rooms.find((r) => r.id === req.params.id);
		if (!room) {
			res.status(404).send({
				message: 'Room not found',
			});
			return;
		}

		room.ready = true;

		res.json({
			message: 'OK',
		});
	},

	createMainPage: (_, res) => {
		main.id = generateId();
		main.locked = true;

		res.json({
			id: main.id,
		});

		return main.id;
	},

	getMainPage: (_, res) => {
		res.json({
			id: main.id,
		});
	},
};