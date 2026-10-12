import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTodoDto, Priority, UpdateTodoDto } from './todo.dto';

export interface Todo {
  id: number;
  title: string;
  priority: Priority;
  done: boolean;
  createdAt: string;
}

/** Repositório em memória. Para PostgreSQL, troque este serviço por TypeORM/Prisma (ver README). */
@Injectable()
export class TodosService {
  private items: Todo[] = [];
  private seq = 1;

  findAll(filter?: { done?: boolean }): Todo[] {
    return this.items.filter((t) => filter?.done === undefined || t.done === filter.done);
  }

  findOne(id: number): Todo {
    const t = this.items.find((i) => i.id === id);
    if (!t) throw new NotFoundException(`Tarefa ${id} não encontrada`);
    return t;
  }

  create(dto: CreateTodoDto): Todo {
    const todo: Todo = {
      id: this.seq++, title: dto.title.trim(), priority: dto.priority ?? 'media',
      done: false, createdAt: new Date().toISOString(),
    };
    this.items.push(todo);
    return todo;
  }

  update(id: number, dto: UpdateTodoDto): Todo {
    const t = this.findOne(id);
    if (dto.title !== undefined) t.title = dto.title.trim();
    if (dto.priority !== undefined) t.priority = dto.priority;
    if (dto.done !== undefined) t.done = dto.done;
    return t;
  }

  remove(id: number): void {
    const t = this.findOne(id);
    this.items = this.items.filter((i) => i !== t);
  }
}
