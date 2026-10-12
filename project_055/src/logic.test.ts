import { BANK, TOPICS } from './bank';
import { buildQuiz, grade, loadBest, mulberry32, points, shuffle, updateBest } from './logic';
test('banco consistente', () => { for (const q of BANK) { expect(q.options.length).toBe(4); expect(q.answer).toBeGreaterThanOrEqual(0); expect(q.answer).toBeLessThan(4); expect(TOPICS.some(t => t.id === q.topic)).toBe(true); } });
test('shuffle preserva itens', () => { expect(shuffle([1, 2, 3, 4], mulberry32(3)).sort()).toEqual([1, 2, 3, 4]); });
test('buildQuiz mantém a resposta correta', () => {
  const quiz = buildQuiz('all', 30, mulberry32(9));
  for (const q of quiz) { const o = BANK.find(b => b.id === q.id)!; expect(q.options[q.answer]).toBe(o.options[o.answer]); }
});
test('buildQuiz filtra por tema e limita', () => { const q = buildQuiz('git', 3, mulberry32(1)); expect(q).toHaveLength(3); expect(q.every(x => x.topic === 'git')).toBe(true); expect(buildQuiz('git', 50)).toHaveLength(5); });
test('pontos', () => { expect(points(false, 20, 3)).toBe(0); expect(points(true, 10, 0)).toBe(120); expect(points(true, 99, 99)).toBe(100 + 40 + 50); });
test('nota', () => { expect(grade(0, 0).pct).toBe(0); expect(grade(7, 10).label).toBe('Pleno'); expect(grade(10, 10).label).toBe('Sênior'); });
test('recorde', () => { const a = updateBest({}, 'js', 300, 60); expect(a.isNew).toBe(true); expect(updateBest(a.best, 'js', 200, 50).isNew).toBe(false); expect(loadBest('???')).toEqual({}); });
