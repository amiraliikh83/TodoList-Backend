import { Module } from '@nestjs/common';
import { HandlerController } from './handler.controller';
import { HandlerService } from './handler.service';
import { TaskSchema } from '../schemas/task.schema';
import { Task } from '../DTO/task';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }])
  ],
  controllers: [HandlerController],
  providers: [HandlerService],
})
export class HandlerModule {}
