import { createTask, filterTasks, isOverdue, loadTasks, moveTask, progress, sortTasks, validateTitle } from './logic';
const mk = (title: string, priority: any = 'media', due = '') => createTask({ title, priority, due }, 1);
test('valida título', () => { expect(validateTitle('  ')).toBeTruthy(); expect(validateTitle('ok')).toBeNull(); expect(validateTitle('x'.repeat(81))).toBeTruthy(); });
test('move e progresso', () => { const a = mk('a'); const b = mk('b'); let l = [a, b]; l = moveTask(l, a.id, 'done'); expect(progress(l)).toBe(50); expect(progress([])).toBe(0); });
test('filtra', () => { const l = [mk('Comprar pão', 'alta'), mk('Estudar', 'baixa')]; expect(filterTasks(l, { query: 'pão', priority: 'todas' })).toHaveLength(1); expect(filterTasks(l, { query: '', priority: 'baixa' })[0].title).toBe('Estudar'); });
test('ordena por prioridade', () => { expect(sortTasks([mk('b', 'baixa'), mk('a', 'alta')])[0].title).toBe('a'); });
test('atrasada', () => { expect(isOverdue(mk('x', 'media', '2020-01-01'), '2024-01-01')).toBe(true); });
test('load tolera lixo', () => { expect(loadTasks({ getItem: () => '{bad' })).toEqual([]); expect(loadTasks({ getItem: () => '{"a":1}' })).toEqual([]); });
