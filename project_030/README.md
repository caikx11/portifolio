# Jogo da Velha Online

Este é um projeto de Jogo da Velha (Tic-Tac-Toe) online que permite jogar contra outro jogador local ou contra o computador com diferentes níveis de dificuldade.

## Funcionalidades

- **Modo Dois Jogadores**: Jogue contra outro jogador no mesmo dispositivo
- **Modo Contra o Computador**: Jogue contra IA com 3 níveis de dificuldade
  - Fácil: Movimentos aleatórios
  - Médio: Bloqueia vitórias do jogador e tenta vencer
  - Difícil: Usa algoritmo Minimax para jogadas ótimas
- **Placar em tempo real**: Contador de vitórias para X e O
- **Histórico de partidas**: Registro de todas as partidas jogadas com resultado, modo e dificuldade
- **Design responsivo**: Funciona bem em desktop e mobile
- **Feedback visual**: Animações de vitória, destaque da combinação vencedora

## Estrutura do Projeto

```
project_030/
├── index.html          # Página principal
├── css/
│   └── style.css       # Estilos do projeto
├── js/
│   └── main.js         # Lógica do jogo
└── README.md           # Este arquivo
```

## Como Executar

1. Clone ou copie este diretório para seu ambiente local
2. Abra o arquivo `index.html` em qualquer navegador moderno
3. Selecione o modo de jogo (Dois Jogadores ou Contra o Computador)
4. Se Contra o Computador, escolha a dificuldade
5. Clique nas células do tabuleiro para fazer suas jogadas

## Tecnologias Utilizadas

- HTML5
- CSS3 (com Grid para o tabuleiro, Flexbox para layout, animações)
- JavaScript ES6+ (módulos)

## Detalhes da Implementação

### IA do Computador

O jogo implementa três níveis de dificuldade usando diferentes estratégias:

1. **Fácil**: Escolhe aleatoriamente entre as células vazias disponíveis
2. **Médio**: 
   - Primeiro verifica se pode vencer na próxima jogada
   - Depois verifica se precisa bloquear o jogador de vencer
   - Caso contrário, escolhe movimento aleatório
3. **Difícil**: Implementa o algoritmo **Minimax** que explora todas as possíveis jogadas futuras para encontrar a jogada ótima, garantindo que o computador nunca perca (no máximo empata)

### Algoritmo Minimax

O algoritmo Minimax é um algoritmo de decisão usado em teoria dos jogos para minimizar a perda máxima possível. No contexto do Jogo da Velha:
- O computador (jogador O) tenta maximizar a pontuação
- O jogador humano (jogador X) tenta minimizar a pontuação do computador
- A pontuação é: +10 para vitória do computador, -10 para vitória do jogador, 0 para empate
- A profundidade é considerada para preferir vitórias mais rápidas

### Estado do Jogo

O estado é gerenciado através de variáveis globais:
- `board`: Array de 9 posições representando o tabuleiro
- `currentPlayer`: Jogador atual ('X' ou 'O')
- `gameMode`: Modo de jogo ('pvp' ou 'pvc')
- `difficulty`: Nível de dificuldade ('easy', 'medium', 'hard')
- `scoreX`, `scoreO`: Placar
- `gameHistory`: Array com histórico de todas as partidas

### Responsividade

O layout se adapta a diferentes tamanhos de tela:
- Desktop: Controles lado a lado, tabuleiro centralizado
- Mobile: Controles empilhados, painéis de sobreposição ocupam tela inteira

## Próximos Passos (Para Projetos Futuros)

Este projeto segue a progressão de complexidade definida nas instruções:
- Projetos 021-030: Aplicações com APIs simuladas, estado mais complexo e integração de múltiplas funcionalidades
- Este projeto implementa IA com algoritmos diferentes, gerenciamento de estado complexo, histórico persistente na sessão
- Preparatório para projetos 031-040 que incluirão visualização de dados e gráficos

Para projetos futuros, o Jogo da Velha poderia ser expandido com:
- Multiplayer online real via WebSockets
- Estatísticas detalhadas (taxa de vitória, tempo médio por jogada)
- Diferentes tamanhos de tabuleiro (4x4, 5x5)
- Temas visuais personalizáveis