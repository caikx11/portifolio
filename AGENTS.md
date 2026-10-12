# Preferências do usuário

- Sempre responda em português (pt-BR), em todas as sessões e projetos.
  - Vale para TODO texto que o usuário vê: respostas, perguntas e também as frases curtas de andamento entre uma ferramenta e outra.
  - Vale mesmo quando o material de trabalho (skills, prompts de subagentes, relatórios, logs, código) estiver em inglês: não copie o idioma do material.
  - Prompts para subagentes podem ser em inglês, mas o que você escreve para o usuário sobre eles é sempre em português.

## Skills de decisão: jev e laya

Estas skills tomam decisões estruturadas (choice, score, noul). Elas só funcionam quando o usuário as ativa na conversa com `$jev on` / `$laya on`.

- Se estiverem ativas na conversa, use-as sempre que a tarefa envolver classificar/rotear entre opções fechadas (choice), pontuar numa escala (score) ou responder sim/não (noul). Não use para gerar texto, resumir, programar ou raciocinar em várias etapas: nesses casos o modelo principal faz o trabalho.
- Prefira o `laya` (local, gratuito). Use o `jev` quando o usuário pedir ou o `laya` não tiver tarefa/modelo adequado. Nunca envie dados sensíveis ao `jev`.
- Se estiverem desativadas, não as ative nem invoque por conta própria. Se a tarefa se encaixar claramente nesses tipos de decisão, sugira ao usuário em uma linha ativar com `$laya on` ou `$jev on`, e siga sem elas.
- Siga o "estado final" obrigatório de cada skill (⚡/🟡/⚪/🔴) nas respostas em que forem usadas.
- Nunca peça chaves no chat, instale pacotes, rode treino ou crie tarefas sem autorização explícita.

## Skills de delegação: free e nemo

Duas skills delegam subtarefas de geração a modelos gratuitos. Só funcionam quando o usuário as ativa na conversa. Ao ver um comando `$free ...` ou `$nemo ...`, leia e siga o `SKILL.md` correspondente:
- `free` (`~/.agents/skills/free/SKILL.md`): FreeLLMAPI, roteador local que junta vários provedores gratuitos e troca sozinho quando um falha. Mais estável; o modelo muda a cada chamada. **Preferida.**
- `nemo` (`~/.agents/skills/nemo/SKILL.md`): Nemotron 3 Ultra no OpenRouter. Use quando quiser especificamente esse modelo (contexto de 1M num modelo grande).

As regras abaixo valem para as duas:

- Se estiver ativa, delegue trabalho de volume que compense a espera: rascunho de código e boilerplate, testes iniciais, resumo de arquivos/logs grandes, segunda opinião em revisão e extração para JSON. O modelo gratuito rascunha; você revisa, verifica (lint/testes/código real) e integra. Nunca repasse a saída sem revisar.
- Não delegue tarefas pequenas, decisões de arquitetura/segurança, a resposta final ao usuário nem classificação/pontuação/sim-não (isso é do `laya`/`jev`).
- Antes do primeiro envio de código de um projeto, peça autorização em uma linha: o tier gratuito pode registrar os prompts. Nunca envie segredos, `.env` ou dados pessoais.
- Se estiverem desativadas, não as ative por conta própria. Sugira ativar com `/free on` (ou `/nemo on`), em uma linha e no início da resposta, quando surgir um destes casos:
  1. **Conteúdo grande para ler:** arquivo, log, dump ou diff com mais de ~2.000 linhas (ou vários arquivos somando isso) que só precisa ser entendido em linhas gerais. O ganho é poupar o seu contexto.
  2. **Volume repetitivo:** muitas variações parecidas (mais de ~10 endpoints, fixtures, conversões, traduções de strings) em que um rascunho em lote, revisado por amostragem e testes, economiza tempo.
  3. **Segunda opinião:** revisão de código importante (antes de merge/deploy, código de segurança ou de dinheiro), depois da sua própria revisão.
  Não sugira para tarefas pequenas, edições e depuração do dia a dia, implementação de feature, pedidos com pressa, nem para código proprietário/de clientes (os planos gratuitos podem registrar os prompts; no `nemo`, mencione a versão paga). No máximo uma sugestão por tipo de tarefa na conversa; se o usuário recusar ou ignorar, não insista. Faça a tarefa normalmente enquanto ele não ativar.
- Siga o "estado final" obrigatório da skill (⚡/🟡/⚪/🔴) nas respostas em que for usada.
- **Limite do Codex:** se o usuário perguntar o que fazer quando o limite de uso acabar (ou avisar que está perto), indique o comando `Codex-free` num terminal: ele abre o Codex usando o FreeLLMAPI, com qualidade menor. Os nomes `Codex-*` no FreeLLMAPI são apelidos de modelos gratuitos, não modelos da Anthropic.

## Arquivo de transferência: PROJECT_CONTEXT.md

O usuário costuma continuar o trabalho em outra sessão ou em outro modelo (por exemplo, quando o limite acaba). Para essa troca ser confiável, mantenha um `PROJECT_CONTEXT.md` na raiz de cada projeto em que você trabalhar.

- **No início da sessão:** se o arquivo existir, leia-o antes de mexer no projeto e retome a partir de "Onde parei".
- **Quando atualizar:** sem esperar pedido, ao concluir cada etapa significativa (feature, correção, decisão de arquitetura), quando a conversa estiver longa e, sempre, quando o usuário avisar que o limite está perto ou que vai trocar de sessão/modelo. Na dúvida, atualize: um arquivo velho é pior que nenhum.
- **Seções obrigatórias, nesta ordem:**
  1. Objetivo do projeto
  2. Arquitetura (pastas e módulos principais, fluxo de dados)
  3. Tecnologias (linguagens, frameworks, versões relevantes, como rodar e testar)
  4. Regras obrigatórias (padrões, convenções, restrições do usuário)
  5. Decisões tomadas (o quê e por quê)
  6. Não alterar (arquivos, APIs, comportamentos que devem ficar como estão, e o motivo)
  7. Tarefas concluídas
  8. Pendências (priorizadas)
  9. Onde parei: exatamente o último passo feito, o próximo passo, arquivos e linhas envolvidos, comandos em andamento e qualquer erro ainda não resolvido
- **Fidelidade:** registre só o que você verificou no código ou que o usuário disse. O que for suposição ou vier de outra sessão sem confirmação, marque como "(a confirmar)". Atualize as seções existentes em vez de só acrescentar texto no fim, e remova o que ficou desatualizado.
- **O que não entra:** segredos, chaves, senhas, conteúdo de `.env` ou dados pessoais.
- Se o projeto já tiver um `AGENTS.md` próprio, não duplique o conteúdo: deixe nele as regras do projeto e, no `PROJECT_CONTEXT.md`, o estado do trabalho, com uma linha em cada um apontando para o outro.
- Não crie o arquivo em sessões sem projeto (pasta temporária vazia) nem em perguntas avulsas. Não faça commit dele sem o usuário pedir.

## Agent skills

### Issue tracker
Issues tracked as Markdown files under .scratch/<feature/>. See `docs/agents/issue-tracker.md`.

### Domain docs
Single-context layout: one GLOSSARY.md + docs/adr/ at repo root. See `docs/agents/domain.md`.