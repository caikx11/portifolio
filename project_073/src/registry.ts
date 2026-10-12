import * as u from "./utils";
export interface Example { args: unknown[]; expected: unknown }
export interface Entry { name: string; category: string; sig: string; doc: string; fn: (...a: any[]) => unknown; examples: Example[]; argHint: string }

/** Funções que recebem callbacks são expostas com callbacks por nome (veja KEYFNS) para poderem ser chamadas via JSON. */
export const KEYFNS: Record<string, (x: any) => any> = {
  "x => x": (x) => x, "x => x.length": (x) => x.length, "x => x.age": (x) => x.age, "x => x % 2 ? 'ímpar' : 'par'": (x) => (x % 2 ? "ímpar" : "par"), "x => x.name": (x) => x.name,
};
const kf = (k: string) => KEYFNS[k];

export const REGISTRY: Entry[] = [
  { name: "chunk", category: "Arrays", sig: "chunk<T>(arr: readonly T[], size: number): T[][]", doc: "Divide um array em blocos de tamanho fixo.", fn: u.chunk, argHint: "[[1,2,3,4,5], 2]", examples: [{ args: [[1, 2, 3, 4, 5], 2], expected: [[1, 2], [3, 4], [5]] }] },
  { name: "unique", category: "Arrays", sig: "unique<T>(arr: readonly T[]): T[]", doc: "Remove duplicados preservando a ordem.", fn: u.unique, argHint: "[[1,1,2,3,3]]", examples: [{ args: [[1, 1, 2, 3, 3]], expected: [1, 2, 3] }] },
  { name: "groupBy", category: "Arrays", sig: "groupBy<T,K>(arr: readonly T[], key: (x: T) => K): Record<K, T[]>", doc: "Agrupa por chave. Callback por nome: x => x.length, x => x % 2 ? 'ímpar' : 'par'.", fn: (a: any[], k: string) => u.groupBy(a, kf(k)), argHint: `[[1,2,3,4,5], "x => x % 2 ? 'ímpar' : 'par'"]`, examples: [{ args: [[1, 2, 3], "x => x % 2 ? 'ímpar' : 'par'"], expected: { ímpar: [1, 3], par: [2] } }] },
  { name: "sortBy", category: "Arrays", sig: "sortBy<T>(arr: readonly T[], key: (x: T) => string | number, dir?: 'asc' | 'desc'): T[]", doc: "Ordena sem mutar o original. Callbacks: x => x.age, x => x.name, x => x.length, x => x.", fn: (a: any[], k: string, d?: "asc" | "desc") => u.sortBy(a, kf(k), d), argHint: `[[{"name":"Ana","age":31},{"name":"Bia","age":25}], "x => x.age", "asc"]`, examples: [{ args: [[{ age: 3 }, { age: 1 }], "x => x.age", "asc"], expected: [{ age: 1 }, { age: 3 }] }] },
  { name: "range", category: "Arrays", sig: "range(start: number, end: number, step?: number): number[]", doc: "Sequência numérica de start (inclusive) até end (exclusive).", fn: u.range, argHint: "[0, 10, 3]", examples: [{ args: [0, 10, 3], expected: [0, 3, 6, 9] }, { args: [3, 0, -1], expected: [3, 2, 1] }] },
  { name: "sum", category: "Números", sig: "sum(arr: readonly number[]): number", doc: "Soma os elementos.", fn: u.sum, argHint: "[[1,2,3,4]]", examples: [{ args: [[1, 2, 3, 4]], expected: 10 }] },
  { name: "average", category: "Números", sig: "average(arr: readonly number[]): number", doc: "Média aritmética (NaN para lista vazia).", fn: u.average, argHint: "[[2,4,9]]", examples: [{ args: [[2, 4, 9]], expected: 5 }] },
  { name: "clamp", category: "Números", sig: "clamp(n: number, min: number, max: number): number", doc: "Restringe n ao intervalo [min, max].", fn: u.clamp, argHint: "[15, 0, 10]", examples: [{ args: [15, 0, 10], expected: 10 }, { args: [-2, 0, 10], expected: 0 }] },
  { name: "formatBytes", category: "Números", sig: "formatBytes(n: number, decimals?: number): string", doc: "Formata bytes em B/KB/MB/GB/TB.", fn: u.formatBytes, argHint: "[1536000, 2]", examples: [{ args: [1536000, 2], expected: "1.46 MB" }, { args: [512], expected: "512 B" }] },
  { name: "pick", category: "Objetos", sig: "pick<T, K extends keyof T>(o: T, keys: readonly K[]): Pick<T, K>", doc: "Cria um objeto só com as chaves indicadas.", fn: u.pick, argHint: `[{"a":1,"b":2,"c":3}, ["a","c"]]`, examples: [{ args: [{ a: 1, b: 2, c: 3 }, ["a", "c"]], expected: { a: 1, c: 3 } }] },
  { name: "omit", category: "Objetos", sig: "omit<T, K extends keyof T>(o: T, keys: readonly K[]): Omit<T, K>", doc: "Cria um objeto sem as chaves indicadas.", fn: u.omit, argHint: `[{"a":1,"b":2,"c":3}, ["b"]]`, examples: [{ args: [{ a: 1, b: 2 }, ["b"]], expected: { a: 1 } }] },
  { name: "deepEqual", category: "Objetos", sig: "deepEqual(a: unknown, b: unknown): boolean", doc: "Igualdade estrutural profunda.", fn: u.deepEqual, argHint: `[{"a":[1,{"b":2}]}, {"a":[1,{"b":2}]}]`, examples: [{ args: [{ a: [1, { b: 2 }] }, { a: [1, { b: 2 }] }], expected: true }, { args: [[1], { 0: 1 }], expected: false }] },
  { name: "parseQuery", category: "Objetos", sig: "parseQuery(qs: string): Record<string, string | string[]>", doc: "Lê query string; chaves repetidas viram array.", fn: u.parseQuery, argHint: `["?a=1&b=x&b=y"]`, examples: [{ args: ["?a=1&b=x&b=y"], expected: { a: "1", b: ["x", "y"] } }] },
  { name: "slugify", category: "Texto", sig: "slugify(s: string): string", doc: "Texto para slug de URL, sem acentos.", fn: u.slugify, argHint: `["Olá, Mundo Ágil!"]`, examples: [{ args: ["Olá, Mundo Ágil!"], expected: "ola-mundo-agil" }] },
  { name: "camelCase", category: "Texto", sig: "camelCase(s: string): string", doc: "Converte para camelCase.", fn: u.camelCase, argHint: `["hello_big-world"]`, examples: [{ args: ["hello_big-world"], expected: "helloBigWorld" }] },
  { name: "snakeCase", category: "Texto", sig: "snakeCase(s: string): string", doc: "Converte para snake_case.", fn: u.snakeCase, argHint: `["helloBigWorld"]`, examples: [{ args: ["helloBigWorld"], expected: "hello_big_world" }] },
  { name: "kebabCase", category: "Texto", sig: "kebabCase(s: string): string", doc: "Converte para kebab-case.", fn: u.kebabCase, argHint: `["Hello Big World"]`, examples: [{ args: ["Hello Big World"], expected: "hello-big-world" }] },
  { name: "capitalize", category: "Texto", sig: "capitalize(s: string): string", doc: "Primeira letra maiúscula, resto minúsculo.", fn: u.capitalize, argHint: `["tYPEscript"]`, examples: [{ args: ["tYPEscript"], expected: "Typescript" }] },
  { name: "truncate", category: "Texto", sig: "truncate(s: string, max: number, ellipsis?: string): string", doc: "Corta o texto com reticências.", fn: u.truncate, argHint: `["TypeScript é ótimo", 10]`, examples: [{ args: ["TypeScript é ótimo", 10], expected: "TypeScrip…" }] },
  { name: "isPalindrome", category: "Texto", sig: "isPalindrome(s: string): boolean", doc: "Ignora acentos, espaços e pontuação.", fn: u.isPalindrome, argHint: `["Anotaram a data da maratona"]`, examples: [{ args: ["Anotaram a data da maratona"], expected: true }, { args: ["TypeScript"], expected: false }] },
];
