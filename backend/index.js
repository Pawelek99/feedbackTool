const cookieParser = require('cookie-parser');
const socket = require('socket.io');
const express = require('express');
const API = require('./api');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = require('http').createServer(app);
const io = socket(server);
socket.io = io;

app.use(
	cors({
		credentials: true,
		origin: process.env.CLIENT_URL,
	})
);
app.use(express.json());
app.use(cookieParser());

// Return all rooms (only admin)
app.get('/api/rooms', API.adminAuth, API.getAllRooms);
// Create room (all)
app.post('/api/rooms', API.createRoom);
// Check if room based on the given seed exists (all)
app.get('/api/rooms/find', API.findMatchingRoom);
// Return one room (only creator)
app.get('/api/rooms/:id', API.userAuth, API.getRoomById);
// Remove one room (only admin)
app.delete('/api/rooms/:id', API.adminAuth, API.removeRoomById);
// Mark one room as ready (only creator)
app.patch('/api/rooms/:id/ready', API.userAuth, API.markRoomAsReady);
// Mark one room as not ready (only admin)
app.patch('/api/rooms/:id/notReady', API.adminAuth, API.markRoomAsNotReady);
// Add note to a room (only creator)
app.patch('/api/rooms/:id/submitNote', API.userAuth, API.submitNoteToRoom);
// Remove a note from a room (only creator)
app.patch('/api/rooms/:id/removeNote', API.userAuth, API.removeNoteFromRoom);

// Create session (all)
app.post('/api/main', API.createMainPage);
// Lock session (only admin)
app.patch('/api/main', API.adminAuth, API.lockMainPage);
// Return session (only admin)
app.get('/api/main', API.adminAuthSoft, API.getMainPage);
// End session (only admin)
app.post('/api/main/end', API.adminAuth, API.endSession);
// Aggregate all notes (only admin)
app.post('/api/main/aggregate', API.adminAuth, API.aggregateNotes);
// Check if the given id is from add link (all)
app.post('/api/checkAdd', API.checkAddPage);
// Check if the session based on the given seed exists (all)
app.get('/api/main/find', API.findMatchingSession);
// Sends email with a feedback (all)
app.post('/api/feedback', API.sendEmail);

server.listen(process.env.PORT);
