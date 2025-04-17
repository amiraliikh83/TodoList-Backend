import { Module } from '@nestjs/common';
import { HandlerController } from './handler.controller';
import { HandlerService } from './handler.service';
import { Task, TaskSchema } from '../schemas/task.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]),
  ],
  controllers: [HandlerController],
  providers: [HandlerService],
  exports: [HandlerService, MongooseModule],
})
export class HandlerModule {}
