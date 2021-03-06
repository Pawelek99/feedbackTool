import {
	OnGatewayConnection,
	OnGatewayDisconnect,
	WebSocketGateway,
	WebSocketServer,
	ConnectedSocket,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { Room } from '../rooms/entities/room.entity';

@WebSocketGateway()
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer()
	private server: Server;

	handleConnection(@ConnectedSocket() client: Socket) {
		if (client.handshake.query.sessionId) {
			client.join(client.handshake.query.sessionId);
		}
	}

	handleDisconnect(@ConnectedSocket() client: Socket) {
		if (client.handshake.query.sessionId) {
			client.leave(client.handshake.query.sessionId);
		}
	}

	sessionEnded(sessionId: string) {
		this.server.to(sessionId).emit('endSession');
	}

	aggregateNotes(sessionId: string) {
		this.server.to(sessionId).emit('aggregateNotes');
	}

	roomChanged(sessionId: string, room: Room) {
		this.server.to(sessionId).emit('roomChanged', {
			room: {
				id: room.id,
				name: room.name,
				sessionId: room.sessionId,
				lists: room.lists.map((list) => ({
					id: list.id,
					name: list.name,
					count: list.notes.length,
					associatedRoomId: list.associatedRoomId,
				})),
				ready: room.ready,
				own: room.id === sessionId,
			},
		});
	}

	roomRemoved(sessionId: string, roomId: string) {
		this.server.to(sessionId).emit('roomRemoved', {
			id: roomId,
		});
	}

	roomCreated(sessionId: string, room: Room) {
		this.server.to(sessionId).emit('roomCreated', {
			room: {
				id: room.id,
				name: room.name,
				sessionId: room.sessionId,
				lists: room.lists.map((list) => ({
					id: list.id,
					name: list.name,
					count: list.notes.length,
					associatedRoomId: list.associatedRoomId,
				})),
				ready: room.ready,
			},
		});
	}

	roomLimit(sessionId: string, name: string) {
		this.server.to(sessionId).emit('roomLimit', {
			room: { name },
		});
	}
}
