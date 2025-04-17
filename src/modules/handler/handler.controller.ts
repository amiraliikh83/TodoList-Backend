import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CreateTaskDto } from '../DTO/create-task.dto';
import { HandlerService } from './handler.service';
import { UpdateTaskDto } from '../DTO/update-task.dto';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from '../Guard/JwtAuthGuard';
import path from 'path';

@Controller('task')
export class HandlerController {
  constructor(private readonly handlerService: HandlerService) {}

  @Post('c')
  @UseGuards(JwtAuthGuard)
  create(@Request() req, @Body() createTaskDto: CreateTaskDto) {
    return this.handlerService.create({
      ...createTaskDto,
      user: req.user.sub,
    });
  }

  @Get('d')
  @UseGuards(JwtAuthGuard)
  findAll(@Request() req) {
    return this.handlerService.findAll(req.user.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.handlerService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.handlerService.update(id, updateTaskDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.handlerService.remove(id);
  }
}
