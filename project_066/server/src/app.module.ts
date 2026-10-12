import { Controller, Get, Module } from '@nestjs/common';
import { TodosController } from './todos/todos.controller';
import { TodosService } from './todos/todos.service';

@Controller('api')
class HealthController {
  @Get('health') health() { return { ok: true, service: 'todo-api' }; }
}

@Module({ controllers: [HealthController, TodosController], providers: [TodosService] })
export class AppModule {}
