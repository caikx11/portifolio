import { NotFoundException } from '@nestjs/common';
import { TodosService } from './todos.service';

describe('TodosService', () => {
  let s: TodosService;
  beforeEach(() => { s = new TodosService(); });

  it('cria com defaults e faz trim', () => {
    const t = s.create({ title: '  Estudar Nest ' });
    expect(t).toMatchObject({ id: 1, title: 'Estudar Nest', priority: 'media', done: false });
  });
  it('filtra por done', () => {
    const a = s.create({ title: 'a' }); s.create({ title: 'b' });
    s.update(a.id, { done: true });
    expect(s.findAll({ done: true })).toHaveLength(1);
    expect(s.findAll()).toHaveLength(2);
  });
  it('atualiza parcialmente', () => {
    const a = s.create({ title: 'a' });
    expect(s.update(a.id, { priority: 'alta' })).toMatchObject({ title: 'a', priority: 'alta' });
  });
  it('remove e lança 404 depois', () => {
    const a = s.create({ title: 'a' });
    s.remove(a.id);
    expect(() => s.findOne(a.id)).toThrow(NotFoundException);
  });
});
