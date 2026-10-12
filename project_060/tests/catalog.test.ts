import movies from "../src/movies.json";
import { filterMovies, DEFAULT_FILTERS, toggleFav, genresOf, decadesOf, fold, Movie } from "../src/catalog";
const m = movies as Movie[];
test("data integrity", () => {
  expect(new Set(m.map((x) => x.id)).size).toBe(m.length);
  expect(m.every((x) => x.rating > 0 && x.rating <= 10 && x.genres.length > 0)).toBe(true);
});
test("search ignores accents/case", () => {
  expect(fold("Ação")).toBe("acao");
  expect(filterMovies(m, { ...DEFAULT_FILTERS, q: "ORIGEM" }, []).map((x) => x.title)).toEqual(["A Origem"]);
  expect(filterMovies(m, { ...DEFAULT_FILTERS, q: "nolan" }, [])).toHaveLength(2);
  expect(filterMovies(m, { ...DEFAULT_FILTERS, q: "zzzz" }, [])).toEqual([]);
});
test("filters and sort", () => {
  const r = filterMovies(m, { ...DEFAULT_FILTERS, genre: "Animação", minRating: 8.3 }, []);
  expect(r.every((x) => x.genres.includes("Animação") && x.rating >= 8.3)).toBe(true);
  const y = filterMovies(m, { ...DEFAULT_FILTERS, sort: "year" }, []);
  expect(y[0].year).toBeGreaterThanOrEqual(y[y.length - 1].year);
  expect(filterMovies(m, { ...DEFAULT_FILTERS, decade: 1990 }, []).every((x) => x.year >= 1990 && x.year < 2000)).toBe(true);
});
test("favorites", () => {
  expect(toggleFav([1], 2)).toEqual([1, 2]);
  expect(toggleFav([1, 2], 1)).toEqual([2]);
  expect(filterMovies(m, { ...DEFAULT_FILTERS, onlyFav: true }, [3, 4]).map((x) => x.id).sort()).toEqual([3, 4]);
  expect(genresOf(m).length).toBeGreaterThan(5);
  expect(decadesOf(m)[0]).toBe(1940);
});
