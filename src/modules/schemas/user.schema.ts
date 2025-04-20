import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// Define the User Schema
@Schema()
export class User {
  @Prop({ required: true })
  userName: string;

  @Prop({ required: true, unique: true })
  userEmail: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  resetToken?: string;

  @Prop()
  resetTokenExpiry?: Date;

  @Prop({ required: false })
  jwtToken?: string; // می‌توانید این ویژگی را اختیاری کنید
}

export type UserDocument = User & Document;

export const UserSchema = SchemaFactory.createForClass(User);
