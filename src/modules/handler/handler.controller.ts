import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateTaskDto } from '../DTO/create-task.dto';
import { HandlerService } from './handler.service';
import { UpdateTaskDto } from '../DTO/update-task.dto';

@Controller('handler')
export class HandlerController {
  constructor(private readonly handlerService: HandlerService) {}

  @Post()
  create(@Body() createTaskDto: CreateTaskDto) {
    return this.handlerService.create(createTaskDto);
  }

  @Get()
  findAll() {
    return this.handlerService.findAll();
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
