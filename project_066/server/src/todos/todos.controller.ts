import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { CreateTodoDto, UpdateTodoDto } from './todo.dto';
import { TodosService } from './todos.service';

@Controller('api/todos')
export class TodosController {
  constructor(private readonly todos: TodosService) {}

  @Get() list(@Query('done') done?: string) {
    return this.todos.findAll({ done: done === undefined ? undefined : done === 'true' });
  }
  @Get(':id') one(@Param('id', ParseIntPipe) id: number) { return this.todos.findOne(id); }
  @Post() create(@Body() dto: CreateTodoDto) { return this.todos.create(dto); }
  @Patch(':id') update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTodoDto) {
    return this.todos.update(id, dto);
  }
  @Delete(':id') @HttpCode(204) remove(@Param('id', ParseIntPipe) id: number) { this.todos.remove(id); }
}
