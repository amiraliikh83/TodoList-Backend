import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './modules/auth/auth.module';
import { ModuleRef } from '@nestjs/core';
import { HandlerService } from './modules/handler/handler.service';
import { HandlerModule } from './modules/handler/handler.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/nest-auth'),
    AuthModule,
    HandlerModule,
  ],
  providers: [HandlerService],
})
export class AppModule {}
// test
