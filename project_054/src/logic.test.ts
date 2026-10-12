import { SAMPLE, addToShopping, filterRecipes, formatQty, loadJson, parseIngredient, scaleIngredient, validateRecipe, lines } from './logic';
test('parse', () => {
  expect(parseIngredient('200 g farinha')).toEqual({ qty: 200, rest: 'g farinha' });
  expect(parseIngredient('1 1/2 tomate')).toEqual({ qty: 1.5, rest: 'tomate' });
  expect(parseIngredient('½ cebola')).toEqual({ qty: 0.5, rest: 'cebola' });
  expect(parseIngredient('1/4 xícara leite').qty).toBe(0.25);
  expect(parseIngredient('0,5 kg arroz').qty).toBe(0.5);
  expect(parseIngredient('Sal a gosto')).toEqual({ qty: null, rest: 'Sal a gosto' });
});
test('format e escala', () => {
  expect(formatQty(1.5)).toBe('1 1/2'); expect(formatQty(0.5)).toBe('1/2'); expect(formatQty(12.4)).toBe('12');
  expect(scaleIngredient('200 g espaguete', 2)).toBe('400 g espaguete');
  expect(scaleIngredient('1 lata de leite', 0.5)).toBe('1/2 lata de leite');
  expect(scaleIngredient('Sal a gosto', 3)).toBe('Sal a gosto');
});
test('validação', () => {
  expect(validateRecipe({ title: '', ingredients: 'a', steps: 'b', minutes: 1, servings: 1 })).toMatch(/título/);
  expect(validateRecipe({ title: 'x', ingredients: 'a', steps: 'b', minutes: 0, servings: 1 })).toMatch(/Tempo/);
  expect(validateRecipe({ title: 'x', ingredients: 'a', steps: 'b', minutes: 5, servings: 1 })).toBeNull();
  expect(lines('a\n\n b ')).toEqual(['a', 'b']);
});
test('filtro ignora acentos', () => {
  expect(filterRecipes(SAMPLE, 'grao', 'Todas', false)[0].id).toBe('r3');
  expect(filterRecipes(SAMPLE, '', 'Todas', true).map(r => r.id)).toEqual(['r1']);
  expect(filterRecipes(SAMPLE, '', 'Massas', false)).toHaveLength(1);
});
test('lista de compras sem duplicar', () => {
  const l = addToShopping([], ['2 ovos', 'Sal'], 1); expect(addToShopping(l, ['2 ovos'], 1)).toHaveLength(2); expect(addToShopping(l, ['2 ovos'], 2)).toHaveLength(3);
});
test('loadJson', () => { expect(loadJson('x', [1], Array.isArray)).toEqual([1]); });
