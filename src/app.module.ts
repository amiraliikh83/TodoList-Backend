import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './modules/auth/auth.module';
import { ModuleRef } from '@nestjs/core';
import { HandlerService } from './modules/handler/handler.service';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/nest-auth'),
    AuthModule,
  ],
  providers: [HandlerService],
})
export class AppModule {}
// test
