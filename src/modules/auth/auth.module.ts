import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { User, UserSchema } from '../schemas/user.schema';
import { JwtModule } from '@nestjs/jwt';
import * as dotenv from 'dotenv';
import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy } from '../Guard/google.strategy';
import { PendingUser, PendingUserSchema } from '../schemas/verify.schema';
import { MailService } from './services/mail.service';

dotenv.config();

@Module({
  imports: [
    PassportModule.register({ session: false }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: PendingUser.name, schema: PendingUserSchema },
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, GoogleStrategy, MailService],
  exports: [JwtModule],
})
export class AuthModule {}
