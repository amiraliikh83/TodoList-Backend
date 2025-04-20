import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class PendingUser {
  @Prop({ required: true     })
  userEmail: string;

  @Prop({ required: true })
  userName: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  code: string;

  @Prop({ required: true })
  expiresAt: number;
}

export const PendingUserSchema = SchemaFactory.createForClass(PendingUser);
