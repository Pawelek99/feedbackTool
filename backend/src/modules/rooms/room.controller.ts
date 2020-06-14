import {
	Controller,
	Res,
	HttpStatus,
	Post,
	Body,
	Get,
	Patch,
	Delete,
	Param,
} from '@nestjs/common';
import {
	ApiTags,
	ApiOperation,
	ApiOkResponse,
	ApiConflictResponse,
	ApiNotFoundResponse,
	ApiBadRequestResponse,
	ApiForbiddenResponse,
} from '@nestjs/swagger';
import { RoomService } from './room.service';
import { Room } from './entities/room.entity';
import { BasicResponseSchema } from '../../common/basic-response.schema';
import { sendError, sendResponse } from '../../common';
import { Response, response } from 'express';
import { Cookies } from '@nestjsplus/cookies';
import { CreateRoomDto } from './dto/create-room.dto';
import { OneOfResponseSchema } from '../../common/one-of-response.schema';
import { SetRoomReadyDto } from './dto/set-room-ready.dto';
import { SubmitNoteDto } from './dto/submit-note.dto';
import { RemoveNoteDto } from './dto/remove-note.dto';
import { CustomResponseSchema } from '../../common/custom-response.schema';

@ApiTags('Rooms')
@Controller('api/v1/rooms')
export class RoomController {
	constructor(private readonly roomService: RoomService) {}

	@Post()
	@ApiOperation({ summary: 'Creates a room' })
	@ApiOkResponse({
		description: 'Created a room',
		type: Room,
	})
	@ApiConflictResponse({
		description: 'Room for this user already exist',
		schema: new BasicResponseSchema('Room for this user already exist'),
	})
	@ApiNotFoundResponse({
		description: 'Session not found',
		schema: new BasicResponseSchema('Session not found'),
	})
	@ApiBadRequestResponse({
		description: 'This action is now locked',
		schema: new BasicResponseSchema('This action is now locked'),
	})
	async create(
		@Body() createRoomDto: CreateRoomDto,
		@Res() response: Response
	) {
		try {
			const room = await this.roomService.create(createRoomDto);
			sendResponse(response, room, HttpStatus.CREATED);
		} catch (error) {
			sendError(response, error);
		}
	}

	@Get()
	@ApiOperation({ summary: 'Returns matching rooms' })
	@ApiOkResponse({
		description: 'Returned matching rooms',
		schema: new CustomResponseSchema([
			{
				id: 'l1fcqka1nm3fvw7j',
				sessionId: 'l1fcqka1nm3fvw7j',
				name: 'Anonymous',
				lists: [
					{
						id: 'l1fcqka1nm3fvw7j',
						name: 'Anonymous',
						count: 1,
					},
				],
			},
		]),
	})
	@ApiNotFoundResponse({
		description: 'Item not found',
		schema: new OneOfResponseSchema([
			new BasicResponseSchema('User not found'),
			new BasicResponseSchema('Session not found'),
		]),
	})
	@ApiForbiddenResponse({
		description: 'Authorization error',
		schema: new BasicResponseSchema(
			'Only the creator of the session can access it'
		),
	})
	async findAllMatching(
		@Cookies('seed') seed: string,
		@Res() response: Response
	) {
		try {
			const rooms = await this.roomService.findAllMatching(seed);
			sendResponse(
				response,
				rooms.map((room) => ({
					id: room.id,
					name: room.name,
					lists: room.lists.map((list) => ({
						id: list.id,
						name: list.name,
						count: list.notes.length,
					})),
					ready: room.ready,
				}))
			);
		} catch (error) {
			sendError(response, error);
		}
	}

	@Get('/find')
	@ApiOperation({ summary: 'Returns a matching room' })
	@ApiOkResponse({
		description: 'Returned a matching room',
		type: Room,
	})
	@ApiNotFoundResponse({
		description: 'Item not found',
		schema: new OneOfResponseSchema([
			new BasicResponseSchema('User not found'),
			new BasicResponseSchema('Session not found'),
			new BasicResponseSchema('Room not found'),
		]),
	})
	async findOneMatching(
		@Cookies('seed') seed: string,
		@Res() response: Response
	) {
		try {
			const room = await this.roomService.findOneMatching(seed);
			sendResponse(response, room);
		} catch (error) {
			sendError(response, error);
		}
	}

	@Get('/:id')
	@ApiOperation({ summary: 'Returns a room by the given id' })
	@ApiOkResponse({
		description: 'Returned a room by the given id',
		type: Room,
	})
	@ApiNotFoundResponse({
		description: 'Item not found',
		schema: new OneOfResponseSchema([
			new BasicResponseSchema('User not found'),
			new BasicResponseSchema('Room not found'),
		]),
	})
	@ApiForbiddenResponse({
		description: 'Authorization error',
		schema: new BasicResponseSchema(
			'Only the creator of the session can access it'
		),
	})
	async findOne(
		@Cookies('seed') seed: string,
		@Param('id') id: string,
		@Res() response: Response
	) {
		try {
			const room = await this.roomService.findOne(seed, id);
			sendResponse(response, room);
		} catch (error) {
			sendError(response, error);
		}
	}

	@Delete('/:id')
	@ApiOperation({ summary: 'Removes the given room' })
	@ApiOkResponse({
		description: 'Removed the given room',
		schema: new BasicResponseSchema('OK'),
	})
	@ApiNotFoundResponse({
		description: 'Item not found',
		schema: new OneOfResponseSchema([
			new BasicResponseSchema('User not found'),
			new BasicResponseSchema('Room not found'),
		]),
	})
	@ApiForbiddenResponse({
		description: 'Authorization error',
		schema: new BasicResponseSchema(
			'Only the creator of the session can modify it'
		),
	})
	async remove(
		@Cookies('seed') seed: string,
		@Param('id') id: string,
		@Res() response: Response
	) {
		try {
			await this.roomService.remove(seed, id);
			sendResponse(response, { status: 'OK' });
		} catch (error) {
			sendError(response, error);
		}
	}

	@Patch('/:id/ready')
	@ApiOperation({
		summary: 'Marks the given room as ready or not (depending on the input)',
	})
	@ApiOkResponse({
		description:
			'Marked the given room as ready or not (depending on the input)',
		schema: new BasicResponseSchema('OK'),
	})
	@ApiNotFoundResponse({
		description: 'Item not found',
		schema: new OneOfResponseSchema([
			new BasicResponseSchema('User not found'),
			new BasicResponseSchema('Room not found'),
		]),
	})
	@ApiForbiddenResponse({
		description: 'Authorization error',
		schema: new BasicResponseSchema(
			'Only the creator of the session or room can modify it'
		),
	})
	@ApiBadRequestResponse({
		description: 'This action is now locked',
		schema: new BasicResponseSchema('This action is now locked'),
	})
	async setReady(
		@Cookies('seed') seed: string,
		@Param('id') id: string,
		@Body() setRoomReadyDto: SetRoomReadyDto,
		@Res() response: Response
	) {
		try {
			await this.roomService.setReady(seed, id, setRoomReadyDto);
			sendResponse(response, { status: 'OK' });
		} catch (error) {
			sendError(response, error);
		}
	}

	@Patch('/:id/note')
	@ApiOperation({
		summary: 'Adds a new note to the room or edits existing note',
	})
	@ApiOkResponse({
		description: 'Added a new note to the room or edited existing note',
		schema: new BasicResponseSchema('OK'),
	})
	@ApiNotFoundResponse({
		description: 'Item not found',
		schema: new OneOfResponseSchema([
			new BasicResponseSchema('User not found'),
			new BasicResponseSchema('Room not found'),
			new BasicResponseSchema('List not found'),
		]),
	})
	@ApiForbiddenResponse({
		description: 'Authorization error',
		schema: new BasicResponseSchema('Only the creator of room can modify it'),
	})
	@ApiBadRequestResponse({
		description: 'This action is now locked',
		schema: new BasicResponseSchema('This action is now locked'),
	})
	async submitNote(
		@Cookies('seed') seed: string,
		@Param('id') id: string,
		@Body() submitNoteDto: SubmitNoteDto,
		@Res() response: Response
	) {
		try {
			await this.roomService.sumbitNote(seed, id, submitNoteDto);
			sendResponse(response, { status: 'OK' });
		} catch (error) {
			sendError(response, error);
		}
	}

	@Delete('/:id/note')
	@ApiOperation({ summary: 'Removes note from the room' })
	@ApiOkResponse({
		description: 'Removed note from the room',
		schema: new BasicResponseSchema('OK'),
	})
	@ApiNotFoundResponse({
		description: 'Item not found',
		schema: new OneOfResponseSchema([
			new BasicResponseSchema('User not found'),
			new BasicResponseSchema('Room not found'),
			new BasicResponseSchema('List not found'),
			new BasicResponseSchema('Note not found'),
		]),
	})
	@ApiForbiddenResponse({
		description: 'Authorization error',
		schema: new BasicResponseSchema('Only the creator of room can modify it'),
	})
	@ApiBadRequestResponse({
		description: 'This action is now locked',
		schema: new BasicResponseSchema('This action is now locked'),
	})
	async removeNote(
		@Cookies('seed') seed: string,
		@Param('id') id: string,
		@Body() removeNoteDto: RemoveNoteDto,
		@Res() response: Response
	) {
		try {
			await this.roomService.removeNote(seed, id, removeNoteDto);
			sendResponse(response, { status: 'OK' });
		} catch (error) {
			sendError(response, error);
		}
	}
}