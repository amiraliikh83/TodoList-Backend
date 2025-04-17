import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TaskDocument = Task & Document;

@Schema({ timestamps: true })
export class Task {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  projectName: string;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true, enum: ['low', 'medium', 'high'] })
  priority: string;

  @Prop({ required: true })
  level: number;

  @Prop({ required: true, enum: ['todo', 'doing', 'done'] })
  status: string;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
