export interface Question { id: number; topic: string; q: string; options: string[]; answer: number; why: string }
export const TOPICS = [{"id": "js", "label": "JavaScript"}, {"id": "ts", "label": "TypeScript"}, {"id": "react", "label": "React"}, {"id": "css", "label": "CSS"}, {"id": "git", "label": "Git"}];
export const BANK: Question[] = [
 {
  "id": 0,
  "topic": "js",
  "q": "Qual valor retorna typeof null?",
  "options": [
   "'null'",
   "'object'",
   "'undefined'",
   "'number'"
  ],
  "answer": 1,
  "why": "É um bug histórico da linguagem: typeof null é 'object'."
 },
 {
  "id": 1,
  "topic": "js",
  "q": "O que [1, 2, 3].map(n => n * 2) retorna?",
  "options": [
   "[2, 4, 6]",
   "6",
   "[1, 2, 3]",
   "undefined"
  ],
  "answer": 0,
  "why": "map cria um novo array com o resultado da função em cada item."
 },
 {
  "id": 2,
  "topic": "js",
  "q": "Qual declaração tem escopo de bloco e não pode ser reatribuída?",
  "options": [
   "var",
   "let",
   "const",
   "function"
  ],
  "answer": 2,
  "why": "const tem escopo de bloco e não permite reatribuição."
 },
 {
  "id": 3,
  "topic": "js",
  "q": "O que 0.1 + 0.2 === 0.3 retorna em JavaScript?",
  "options": [
   "true",
   "false",
   "NaN",
   "TypeError"
  ],
  "answer": 1,
  "why": "Números de ponto flutuante binário geram 0.30000000000000004."
 },
 {
  "id": 4,
  "topic": "js",
  "q": "Qual método transforma uma Promise em código com aparência síncrona?",
  "options": [
   "setTimeout",
   "async/await",
   "Array.from",
   "JSON.parse"
  ],
  "answer": 1,
  "why": "async/await é açúcar sintático sobre Promises."
 },
 {
  "id": 5,
  "topic": "js",
  "q": "O que faz Array.prototype.filter?",
  "options": [
   "Ordena o array",
   "Remove itens do array original",
   "Cria um novo array com itens que passam no teste",
   "Soma os itens"
  ],
  "answer": 2,
  "why": "filter devolve um novo array só com os itens aprovados pela função."
 },
 {
  "id": 6,
  "topic": "ts",
  "q": "Qual tipo representa um valor que nunca ocorre?",
  "options": [
   "void",
   "unknown",
   "never",
   "any"
  ],
  "answer": 2,
  "why": "never indica que o valor nunca existe (ex.: função que sempre lança erro)."
 },
 {
  "id": 7,
  "topic": "ts",
  "q": "Qual a diferença principal entre unknown e any?",
  "options": [
   "Nenhuma",
   "unknown exige verificação antes do uso",
   "any é mais seguro",
   "unknown só aceita números"
  ],
  "answer": 1,
  "why": "unknown força o estreitamento do tipo antes de usar o valor."
 },
 {
  "id": 8,
  "topic": "ts",
  "q": "Como declarar um array de strings?",
  "options": [
   "string{}",
   "string[]",
   "array<string>()",
   "[string]()"
  ],
  "answer": 1,
  "why": "string[] ou Array<string>."
 },
 {
  "id": 9,
  "topic": "ts",
  "q": "O que faz o operador ? em 'nome?: string' numa interface?",
  "options": [
   "Torna a propriedade opcional",
   "Torna somente leitura",
   "Lança erro",
   "Converte para número"
  ],
  "answer": 0,
  "why": "A propriedade pode estar ausente (string | undefined)."
 },
 {
  "id": 10,
  "topic": "ts",
  "q": "Qual utilitário torna todas as propriedades opcionais?",
  "options": [
   "Required<T>",
   "Readonly<T>",
   "Partial<T>",
   "Pick<T>"
  ],
  "answer": 2,
  "why": "Partial<T> marca todas as propriedades como opcionais."
 },
 {
  "id": 11,
  "topic": "ts",
  "q": "TypeScript é verificado em...",
  "options": [
   "Tempo de execução no navegador",
   "Tempo de compilação",
   "Apenas no servidor",
   "Nunca"
  ],
  "answer": 1,
  "why": "Os tipos são checados na compilação e apagados no JavaScript final."
 },
 {
  "id": 12,
  "topic": "react",
  "q": "Qual hook guarda estado local em um componente?",
  "options": [
   "useEffect",
   "useState",
   "useMemo",
   "useRef"
  ],
  "answer": 1,
  "why": "useState retorna o valor e a função para atualizá-lo."
 },
 {
  "id": 13,
  "topic": "react",
  "q": "Para que serve a prop key em listas?",
  "options": [
   "Estilizar itens",
   "Ajudar o React a identificar itens entre renderizações",
   "Criptografar dados",
   "Definir a ordem"
  ],
  "answer": 1,
  "why": "Chaves estáveis permitem reconciliar a lista corretamente."
 },
 {
  "id": 14,
  "topic": "react",
  "q": "Quando um useEffect com array de dependências vazio [] roda?",
  "options": [
   "A cada render",
   "Somente após a primeira montagem",
   "Nunca",
   "Ao desmontar apenas"
  ],
  "answer": 1,
  "why": "Com [] o efeito roda uma vez após a montagem."
 },
 {
  "id": 15,
  "topic": "react",
  "q": "Props em React são...",
  "options": [
   "Mutáveis pelo filho",
   "Somente leitura",
   "Variáveis globais",
   "Estado interno"
  ],
  "answer": 1,
  "why": "Props fluem do pai para o filho e não devem ser alteradas."
 },
 {
  "id": 16,
  "topic": "react",
  "q": "O que useRef NÃO faz ao mudar .current?",
  "options": [
   "Guarda valores entre renders",
   "Dispara nova renderização",
   "Acessa elementos do DOM",
   "Persiste na vida do componente"
  ],
  "answer": 1,
  "why": "Alterar ref.current não causa re-render."
 },
 {
  "id": 17,
  "topic": "react",
  "q": "JSX é...",
  "options": [
   "Um banco de dados",
   "Uma extensão de sintaxe que parece HTML em JavaScript",
   "Um framework CSS",
   "Um servidor"
  ],
  "answer": 1,
  "why": "JSX é açúcar sintático convertido em chamadas de função."
 },
 {
  "id": 18,
  "topic": "css",
  "q": "Qual propriedade ativa Flexbox em um contêiner?",
  "options": [
   "display: flex",
   "position: flex",
   "flex: container",
   "float: flex"
  ],
  "answer": 0,
  "why": "display: flex transforma o elemento em contêiner flex."
 },
 {
  "id": 19,
  "topic": "css",
  "q": "Qual unidade é relativa à largura da viewport?",
  "options": [
   "px",
   "rem",
   "vw",
   "pt"
  ],
  "answer": 2,
  "why": "1vw equivale a 1% da largura da viewport."
 },
 {
  "id": 20,
  "topic": "css",
  "q": "O que z-index controla?",
  "options": [
   "Zoom",
   "Ordem de empilhamento",
   "Largura",
   "Opacidade"
  ],
  "answer": 1,
  "why": "Define qual elemento fica na frente em elementos posicionados."
 },
 {
  "id": 21,
  "topic": "css",
  "q": "Qual seletor tem maior especificidade?",
  "options": [
   "Tag",
   "Classe",
   "ID",
   "Universal *"
  ],
  "answer": 2,
  "why": "ID vence classe, que vence tag."
 },
 {
  "id": 22,
  "topic": "css",
  "q": "O que faz box-sizing: border-box?",
  "options": [
   "Remove bordas",
   "Inclui padding e borda na largura declarada",
   "Adiciona sombra",
   "Arredonda cantos"
  ],
  "answer": 1,
  "why": "A largura passa a incluir padding e border."
 },
 {
  "id": 23,
  "topic": "css",
  "q": "Qual media query detecta preferência por menos animação?",
  "options": [
   "prefers-color-scheme",
   "prefers-reduced-motion",
   "orientation",
   "hover"
  ],
  "answer": 1,
  "why": "prefers-reduced-motion: reduce respeita a configuração do sistema."
 },
 {
  "id": 24,
  "topic": "git",
  "q": "Qual comando cria um novo branch e já muda para ele?",
  "options": [
   "git branch -d x",
   "git checkout -b x",
   "git merge x",
   "git stash x"
  ],
  "answer": 1,
  "why": "git checkout -b (ou git switch -c) cria e troca."
 },
 {
  "id": 25,
  "topic": "git",
  "q": "O que git stash faz?",
  "options": [
   "Apaga o repositório",
   "Guarda mudanças não commitadas temporariamente",
   "Envia ao remoto",
   "Cria tag"
  ],
  "answer": 1,
  "why": "Salva o trabalho em andamento numa pilha para recuperar depois."
 },
 {
  "id": 26,
  "topic": "git",
  "q": "Qual comando baixa e integra mudanças do remoto?",
  "options": [
   "git pull",
   "git add",
   "git init",
   "git log"
  ],
  "answer": 0,
  "why": "git pull = fetch + merge (ou rebase)."
 },
 {
  "id": 27,
  "topic": "git",
  "q": "O que o arquivo .gitignore define?",
  "options": [
   "Usuários do repo",
   "Arquivos que o Git deve ignorar",
   "Branches protegidos",
   "Mensagens de commit"
  ],
  "answer": 1,
  "why": "Padrões de arquivos que não serão rastreados."
 },
 {
  "id": 28,
  "topic": "git",
  "q": "Qual comando mostra o histórico de commits?",
  "options": [
   "git log",
   "git diff",
   "git status",
   "git push"
  ],
  "answer": 0,
  "why": "git log lista os commits."
 }
];
