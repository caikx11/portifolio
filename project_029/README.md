# Portal de Notícias

Este é um projeto de portal de notícias simulado que consome dados de uma API mock e permite filtrar notícias por categoria e busca textual.

## Funcionalidades

- Exibição de notícias em formato de cartões
- Filtragem por categoria (Política, Tecnologia, Esportes, Economia, Cultura, Educação)
- Busca textual por título, resumo e conteúdo
- Paginação de resultados
- Design responsivo
- Simulação de atraso de rede para experiência mais realista

## Estrutura do Projeto

```
project_029/
├── index.html          # Página principal
├── css/
│   └── style.css       # Estilos do projeto
├── js/
│   ├── main.js         # Lógica da aplicação
│   └── api/
│       └── news-api.js # Mock da API de notícias
├── data/
│   └── news.json       # Dados de notícias em formato JSON
└── README.md           # Este arquivo
```

## Como Executar

1. Clone ou copie este diretório para seu ambiente local
2. Abra o arquivo `index.html` em qualquer navegador moderno
3. Use os filtros de categoria e busca para encontrar notícias específicas
4. Navegue pelas páginas usando os controles de paginação

## Tecnologias Utilizadas

- HTML5
- CSS3 (com Flexbox e Grid)
- JavaScript ES6+ (módulos)
- JSON para dados de notícias

## Detalhes da Implementação

### API Mock

A aplicação utiliza uma API mock localizada em `api/news-api.js` que simula:
- Atraso de rede aleatório entre 500ms e 1500ms
- Filtragem por categoria e busca textual
- Paginação dos resultados
- Ordenação por data (mais recentes primeiro)

### Dados de Notícias

Os dados estão armazenados em `data/articles.json` e contêm notícias de diversas categorias com:
- Título
- Categoria
- Resumo
- Conteúdo completo
- Data
- Autor
- URL da imagem

### Responsividade

O layout se adapta a diferentes tamanhos de tela:
- Desktop: grade de notícias com múltiplas colunas
- Mobile: grade de notícias com uma única coluna
- Controles de busca e filtro empilhados verticalmente em telas pequenas

## Próximos Passos (Para Projetos Futuros)

Este projeto segue a progressão de complexidade definida nas instruções:
- Projetos 021-030: Aplicações com APIs simuladas, estado mais complexo e integração de múltiplas funcionalidades
- Este projeto implementa uma API mock com estado de filtragem e paginação
- Preparatório para projetos 031-040 que incluirão visualização de dados e gráficos

Para projetos futuros de visualização de dados, bibliotecas como Chart.js podem ser integradas para criar gráficos interativos baseado nos dados das notícias (por exemplo, distribuição por categoria, frequência de publicação ao longo do tempo, etc.).