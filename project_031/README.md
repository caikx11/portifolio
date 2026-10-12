# Aplicativo de Meditação - Projeto 031

Este é o projeto 031 do portfólio: um aplicativo de meditação com temporizadores personalizáveis, meditações guiadas e exercícios de respiração.

## Funcionalidades

- **Modo Temporizador**: Temporizadores personalizáveis para meditações com sons de fundo opcionais
- **Modo Guiada**: Meditações guiadas pré-definidas com diferentes temas e durações
- **Modo Respiração**: Exercícios de respiração guiados com diferentes padrões (4-7-8, Box, 4-4-6-2 e personalizado)
- **Sons de Fundo**: Opções de sons ambientais (chuva, floresta, oceano, lareira, ruído branco)
- **Estatísticas**: Acompanhamento de sessões totais, minutos meditados e streak de dias consecutivos
- **Design Responsivo**: Funciona em dispositivos móveis e desktops

## Estrutura de Arquivos

```
project_031/
├── index.html          # Estrutura HTML do aplicativo
├── css/
│   └── style.css       # Estilos e design visual
└── js/
    └── main.js         # Lógica e funcionalidades do aplicativo
```

## Como Usar

1. Abra o arquivo `index.html` em qualquer navegador web moderno
2. Seleção entre os modos: Temporizador, Guiada ou Respiração
3. Configure suas preferências de tempo, som e outros parâmetros
4. Clique em "Iniciar" para começar sua sessão de meditação
5. Use os controles de pausa e reinicialização conforme necessário

## Tecnologias Utilizadas

- HTML5
- CSS3 (com variáveis e flexbox/grid)
- JavaScript ES6+
- LocalStorage para persistência de estatísticas
- API de Áudio Web para reprodução de sons

## Próximos Passos

- Adicionar mais opções de sons de fundo
- Melhorar a visualização do círculo de respiração
- Adicionar opção de salvar/carregar configurações personalizadas
- Implementar notificações para fim de sessão