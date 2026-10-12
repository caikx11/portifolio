import { formatTime, nextMode, clampMinutes, sanitize, remainingSec, progress, addFocus, lastDays, dayKey, DEFAULTS } from "../src/timer";
test("formatTime", () => {
  expect(formatTime(1500)).toBe("25:00");
  expect(formatTime(59.2)).toBe("01:00");
  expect(formatTime(-3)).toBe("00:00");
});
test("nextMode cycles", () => {
  expect(nextMode("focus", 1, 4)).toBe("short");
  expect(nextMode("focus", 4, 4)).toBe("long");
  expect(nextMode("short", 1, 4)).toBe("focus");
  expect(nextMode("long", 4, 4)).toBe("focus");
});
test("clamp and sanitize", () => {
  expect(clampMinutes(0)).toBe(1);
  expect(clampMinutes(500)).toBe(120);
  expect(clampMinutes(NaN)).toBe(1);
  expect(sanitize(null)).toEqual(DEFAULTS);
  expect(sanitize({ longEvery: 1 }).longEvery).toBe(2);
});
test("remaining and progress", () => {
  expect(remainingSec(10000, 4000)).toBe(6);
  expect(remainingSec(1000, 4000)).toBe(0);
  expect(progress(30, 60)).toBe(0.5);
  expect(progress(0, 0)).toBe(0);
});
test("history", () => {
  const today = new Date(2026, 2, 2);
  const h = addFocus(addFocus({}, dayKey(today), 25), dayKey(today), 25);
  expect(h[dayKey(today)]).toBe(50);
  const l = lastDays(h, 3, today);
  expect(l.map((x) => x.key)).toEqual(["2026-02-28", "2026-03-01", "2026-03-02"]);
  expect(l[2].minutes).toBe(50);
});
