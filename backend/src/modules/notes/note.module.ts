import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Note } from './entities/note.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Note])],
	providers: [],
	controllers: [],
})
export class NoteModule {}
