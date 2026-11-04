# Redesign do Public IP

Base: `origin/main`, commit `25692c7`, obtido por clone e `git pull --ff-only origin main` antes das alterações. Trabalho na branch `codex/public-ip-ux`.

## Mudanças

- Home com IP como resultado principal, copiar ao lado, seleção de protocolo somente quando há dois endereços e atualização discreta. O primeiro protocolo a responder já fica disponível; atualizar preserva a escolha do usuário enquanto as consultas estão em andamento.
- DNS com domínio, registro e consulta; resultados em tabela, cópia individual e conjunta, erros curtos e ajuda opcional. URLs coladas são normalizadas para o domínio, incluindo nomes internacionalizados.
- CIDR com cálculo durante a digitação, confirmação por botão, resultados organizados e cópia individual ou conjunta. Corrigida a interação em que o blur do campo recriava o botão e cancelava a cópia.
- Conteúdo de apoio em `/guias/`; ajuda técnica das ferramentas em `details`. Metadados, canonical, Open Graph, JSON-LD, sitemap, robots e documentação para agentes preservados ou atualizados.
- Fontes Poppins locais, SVGs Lucide selecionados e transições CSS curtas. Sem bibliotecas de animação ou novo framework no runtime.

## Validação

- `npm test`: testes de CIDR, entradas DNS, endereços e SEO.
- `npm run build`: build Vite de cinco páginas e recursos estáticos.
- `npm run test:e2e`: cópia, seleção/atualização de protocolos, falhas e retomada, DNS, CIDR, layouts e axe.
- Capturas em 360×640, 390×844, 768×1024 e 1440×900, incluindo IPv6 completo e TXT longo. Home cabe na viewport; nenhuma página apresenta overflow horizontal. Capturas revisadas visualmente.

Os E2E usam respostas de API controladas para cobrir sucesso, demora e falhas de forma reproduzível. Os endereços das capturas são reservados para documentação. A disponibilidade real de ipify e Google Public DNS continua dependendo dos serviços externos.

Lighthouse e métricas de campo LCP, CLS e INP não foram medidos. Não há afirmação de que suas metas tenham sido atingidas.

## Arquivos principais

- Interface: `index.html`, `dns/index.html`, `cidr/index.html`, `src/styles.css` e `src/ui.js`.
- Interações e validação: `src/ip.js`, `src/ip-core.js`, `src/dns.js`, `src/dns-core.js` e `src/cidr.js`.
- Conteúdo e SEO: `guias/index.html`, `privacidade/index.html`, `public/sitemap.xml`, `public/llms.txt`, `public/llms-full.txt` e `public/docs/*.md`. O `robots.txt` existente foi preservado e verificado.
- Build e testes: `vite.config.js`, `package.json`, `package-lock.json`, `playwright.config.js`, `.github/workflows/quality.yml`, `.gitignore`, `tests/inputs.test.js`, `tests/seo.test.js` e `tests/e2e/ux.spec.js`.
- Documentação: `README.md`, este relatório e `docs/qa/screenshots/`.

Resultado final: 11 testes de lógica/SEO e 5 testes E2E aprovados, build concluído e nenhuma violação detectada pelo axe nas telas DNS/CIDR da matriz de resolução.
