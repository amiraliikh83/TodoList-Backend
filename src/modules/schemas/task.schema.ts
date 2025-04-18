import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type TaskDocument = Task & Document;

@Schema()
export class Task {
  @Prop() title: string;
  @Prop() projectName: string;
  @Prop() date: string;
  @Prop() priority: string;
  @Prop() level: string;
  @Prop() status: boolean;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user: mongoose.Types.ObjectId;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
