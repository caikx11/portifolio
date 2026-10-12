import { forecast, toF, normalize, hash, isoDay } from "../src/weather";
const now = new Date(2026, 5, 15, 10, 0);
test("deterministic", () => {
  expect(forecast("Recife", now)).toEqual({ ...forecast("  Recife ", now) });
  expect(forecast("Recife", now).days).toEqual(forecast("  recife ", now).days);
  expect(forecast("Recife", now)).not.toEqual(forecast("Oslo", now));
});
test("shape and ranges", () => {
  const f = forecast("Oslo", now);
  expect(f.days).toHaveLength(7);
  expect(f.hours).toHaveLength(24);
  expect(f.days[0].date).toBe("2026-06-15");
  for (const d of f.days) { expect(d.max).toBeGreaterThan(d.min); expect(d.rain).toBeGreaterThanOrEqual(0); expect(d.rain).toBeLessThanOrEqual(100); }
  expect(f.humidity).toBeLessThanOrEqual(98);
});
test("helpers", () => {
  expect(toF(0)).toBe(32); expect(toF(100)).toBe(212);
  expect(normalize("  São   Paulo ")).toBe("São Paulo");
  expect(hash("a")).toBe(hash("a"));
  expect(isoDay(new Date(2026, 0, 31), 1)).toBe("2026-02-01");
});
