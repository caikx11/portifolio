/** Motor SIMULADO: nenhuma API de IA é chamada. Respostas vêm de modelos de texto + heurísticas simples. */
export interface Tool { id: string; label: string; desc: string }
export interface Agent { id: string; name: string; emoji: string; blurb: string; tools: Tool[]; prompts: string[] }
export interface Step { tool: Tool; arg: string; result: string; fail?: boolean }

const T = {
  read: { id: "read_file", label: "read_file", desc: "Lê um arquivo do projeto" },
  lint: { id: "lint", label: "lint", desc: "Roda o linter" },
  tests: { id: "run_tests", label: "run_tests", desc: "Executa a suíte de testes" },
  docs: { id: "search_docs", label: "search_docs", desc: "Busca na documentação" },
  git: { id: "git_diff", label: "git_diff", desc: "Lê o diff atual" },
  repl: { id: "run_snippet", label: "run_snippet", desc: "Executa um trecho isolado" },
} satisfies Record<string, Tool>;

export const AGENTS: Agent[] = [
  { id: "review", name: "Revisor", emoji: "🔎", blurb: "Revisa diffs e aponta riscos.", tools: [T.git, T.read, T.lint], prompts: ["Revise este código: const x = JSON.parse(input)", "O que checar antes do merge?"] },
  { id: "debug", name: "Detetive de bugs", emoji: "🪲", blurb: "Investiga erros e causas-raiz.", tools: [T.read, T.repl, T.docs], prompts: ["Por que recebo TypeError: undefined is not a function?", "Meu useEffect roda em loop"] },
  { id: "tests", name: "Testes", emoji: "🧪", blurb: "Sugere e roda casos de teste.", tools: [T.read, T.tests, T.repl], prompts: ["Crie testes para uma função slugify", "Como testar um debounce?"] },
  { id: "docs", name: "Documentação", emoji: "📚", blurb: "Explica APIs e gera README.", tools: [T.docs, T.read], prompts: ["Explique Promise.allSettled", "Gere um README curto para minha lib"] },
];

const pickLang = (m: string) => (/```(\w+)/.exec(m)?.[1] ?? (/\b(def |import numpy|print\()/.test(m) ? "python" : /\b(const|let|=>|function)\b/.test(m) ? "typescript" : "texto"));
const topic = (m: string) => {
  const s = m.toLowerCase();
  if (/useeffect|react|hook/.test(s)) return "react";
  if (/typeerror|undefined|null/.test(s)) return "undef";
  if (/teste|test|jest/.test(s)) return "test";
  if (/readme|doc|explique|promise/.test(s)) return "docs";
  if (/json\.parse|parse/.test(s)) return "parse";
  return "generic";
};

export function plan(agent: Agent, enabled: Set<string>, msg: string): Step[] {
  const tools = agent.tools.filter((t) => enabled.has(t.id));
  const arg = (t: Tool) => (t.id === "read_file" ? "src/index.ts" : t.id === "search_docs" ? msg.slice(0, 32) : t.id === "run_tests" ? "--silent" : t.id === "git_diff" ? "HEAD" : "");
  const res = (t: Tool, i: number) => ({ read_file: "42 linhas lidas", lint: "2 avisos, 0 erros", run_tests: "7 passaram, 1 falhou", search_docs: `${3 + i} resultados relevantes`, git_diff: "+18 −4 em 2 arquivos", run_snippet: "executado em 3 ms" }[t.id] as string);
  const fail = /\/erro/.test(msg);
  return tools.map((t, i) => ({ tool: t, arg: arg(t), result: fail && i === 0 ? "Tempo esgotado (simulado)" : res(t, i), fail: fail && i === 0 }));
}

export function answer(agent: Agent, steps: Step[], msg: string): string {
  const lang = pickLang(msg); const t = topic(msg);
  const used = steps.length ? `Usei ${steps.map((s) => "`" + s.tool.label + "`").join(", ")}. ` : "Sem ferramentas habilitadas, respondi só com o que você enviou. ";
  const body: Record<string, string> = {
    react: "O `useEffect` roda em loop quando uma dependência muda a cada render (objeto ou função criados no corpo do componente).\n\n```typescript\nconst opts = useMemo(() => ({ id }), [id]);\nuseEffect(() => { load(opts); }, [opts]);\n```\nEstabilize dependências com `useMemo`/`useCallback` ou mova-as para dentro do efeito.",
    undef: "Esse erro costuma indicar acesso a algo que ainda é `undefined`. Verifique a origem do valor e proteja o acesso:\n\n```typescript\nconst fn = obj?.handler;\nif (typeof fn === \"function\") fn();\n```",
    test: "Sugiro cobrir o caminho feliz, bordas e erro:\n\n```typescript\ntest(\"slugify remove acentos\", () => {\n  expect(slugify(\"Olá Mundo\")).toBe(\"ola-mundo\");\n});\ntest(\"string vazia\", () => expect(slugify(\"\")).toBe(\"\"));\n```\nPara `debounce`, use `jest.useFakeTimers()` e avance o tempo com `advanceTimersByTime`.",
    docs: "`Promise.allSettled` espera todas as promessas terminarem e devolve `{status, value|reason}` para cada uma, sem rejeitar no primeiro erro.\n\n```typescript\nconst r = await Promise.allSettled([a(), b()]);\nr.filter((x) => x.status === \"rejected\");\n```",
    parse: "`JSON.parse` lança `SyntaxError` para entrada inválida. Trate o erro e valide o formato:\n\n```typescript\nfunction safeParse(s: string) {\n  try { return JSON.parse(s); } catch { return null; }\n}\n```",
    generic: `Entendi seu pedido em ${lang}. Pontos a considerar: nomes claros, tratamento de erro e um teste para o caso principal. Envie um trecho de código (entre três crases) para uma resposta mais específica.`,
  };
  return `${used}\n\n${body[t]}\n\n_Resposta simulada de demonstração (${agent.name})._`;
}
