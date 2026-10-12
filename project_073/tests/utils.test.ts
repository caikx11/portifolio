import * as u from "../src/utils";
import { REGISTRY } from "../src/registry";

describe("exemplos do registro (a mesma lista exibida na UI)", () => {
  test.each(REGISTRY.map((e) => [e.name, e] as const))("%s", (_n, e) => {
    e.examples.forEach((ex) => expect(e.fn(...ex.args)).toEqual(ex.expected));
  });
});
describe("casos de borda", () => {
  test("chunk valida size", () => { expect(() => u.chunk([1], 0)).toThrow(RangeError); expect(u.chunk([], 3)).toEqual([]); });
  test("range inválido e vazio", () => { expect(() => u.range(0, 5, 0)).toThrow(); expect(u.range(5, 0)).toEqual([]); });
  test("clamp min>max", () => expect(() => u.clamp(1, 5, 2)).toThrow());
  test("average vazio", () => expect(u.average([])).toBeNaN());
  test("formatBytes", () => { expect(u.formatBytes(1024)).toBe("1.0 KB"); expect(u.formatBytes(1024 ** 4 * 2000)).toBe("2000.0 TB"); expect(() => u.formatBytes(-1)).toThrow(); });
  test("sortBy não muta", () => { const a = [3, 1, 2]; expect(u.sortBy(a, (x) => x, "desc")).toEqual([3, 2, 1]); expect(a).toEqual([3, 1, 2]); });
  test("deepEqual null/NaN/array", () => { expect(u.deepEqual(null, {})).toBe(false); expect(u.deepEqual(NaN, NaN)).toBe(true); expect(u.deepEqual([1, 2], [1, 3])).toBe(false); });
  test("truncate curto e cases", () => { expect(u.truncate("oi", 5)).toBe("oi"); expect(u.camelCase("")).toBe(""); expect(u.capitalize("")).toBe(""); });
  test("parseQuery vazio", () => expect(u.parseQuery("")).toEqual({}));
  test("debounce", () => {
    jest.useFakeTimers(); const f = jest.fn(); const d = u.debounce(f, 100);
    d(1); d(2); jest.advanceTimersByTime(99); expect(f).not.toHaveBeenCalled(); jest.advanceTimersByTime(1);
    expect(f).toHaveBeenCalledTimes(1); expect(f).toHaveBeenCalledWith(2);
    d(3); d.cancel(); jest.runAllTimers(); expect(f).toHaveBeenCalledTimes(1); jest.useRealTimers();
  });
  test("memoize", () => { const f = jest.fn((x: number) => x * 2); const m = u.memoize(f); m(2); m(2); m(3); expect(f).toHaveBeenCalledTimes(2); });
});
