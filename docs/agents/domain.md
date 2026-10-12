Este projeto usa layout de documentação de domínio single-context:
- `GLOSSARY.md` na raiz do repositório define termos e convenções
- `docs/adr/` contém Arquitetura de Decisões (ADRs) em formato Markdown
- Todas as skills de agente leem desses locais por padrão
- Para alterar o layout, edite este arquivo e execute a skill novamente