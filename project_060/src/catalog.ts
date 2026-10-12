export interface Movie { id: number; title: string; year: number; genres: string[]; rating: number; runtime: number; director: string; synopsis: string }
export type Sort = "rating" | "year" | "title";
export interface Filters { q: string; genre: string; minRating: number; decade: number | null; onlyFav: boolean; sort: Sort }

export const fold = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
export const genresOf = (m: Movie[]) => [...new Set(m.flatMap((x) => x.genres))].sort((a, b) => a.localeCompare(b, "pt"));
export const decadesOf = (m: Movie[]) => [...new Set(m.map((x) => Math.floor(x.year / 10) * 10))].sort((a, b) => a - b);

export function filterMovies(list: Movie[], f: Filters, favs: number[]): Movie[] {
  const q = fold(f.q.trim());
  const out = list.filter((m) =>
    (!q || fold(m.title).includes(q) || fold(m.director).includes(q)) &&
    (!f.genre || m.genres.includes(f.genre)) &&
    m.rating >= f.minRating &&
    (f.decade === null || Math.floor(m.year / 10) * 10 === f.decade) &&
    (!f.onlyFav || favs.includes(m.id)));
  const cmp: Record<Sort, (a: Movie, b: Movie) => number> = {
    rating: (a, b) => b.rating - a.rating || a.title.localeCompare(b.title, "pt"),
    year: (a, b) => b.year - a.year || a.title.localeCompare(b.title, "pt"),
    title: (a, b) => a.title.localeCompare(b.title, "pt"),
  };
  return out.sort(cmp[f.sort]);
}
export const toggleFav = (favs: number[], id: number) => (favs.includes(id) ? favs.filter((x) => x !== id) : [...favs, id]);
export const DEFAULT_FILTERS: Filters = { q: "", genre: "", minRating: 0, decade: null, onlyFav: false, sort: "rating" };
export function hue(title: string): number {
  let h = 0;
  for (const c of title) h = (h * 31 + c.charCodeAt(0)) % 360;
  return h;
}
