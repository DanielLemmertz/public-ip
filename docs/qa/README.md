# Redesign do Public IP

Base inicial: `origin/main`, commit `25692c7`, obtido por clone e pull antes do redesign. O redesign foi integrado à `main` em `05c9d8f`. A revisão de cards, identidade e animação foi executada diretamente na `main`, conforme solicitado.

## Mudanças

- Home com IP como resultado principal em card flutuante e botão destacado “Copiar IPv4/IPv6”, com confirmação “IP copiado”. A seleção de protocolo aparece somente quando há dois endereços. O primeiro protocolo a responder já fica disponível; atualizar preserva a escolha do usuário enquanto as consultas estão em andamento.
- DNS com domínio, registro e consulta; resultados em tabela, cópia individual e conjunta, erros curtos e ajuda opcional. URLs coladas são normalizadas para o domínio, incluindo nomes internacionalizados.
- CIDR com cálculo durante a digitação, confirmação por botão, resultados organizados e cópia individual ou conjunta. Corrigida a interação em que o blur do campo recriava o botão e cancelava a cópia.
- Conteúdo de apoio em `/guias/`; ajuda técnica das ferramentas em `details`. Metadados, canonical, Open Graph, JSON-LD, sitemap, robots e documentação para agentes preservados ou atualizados.
- Fontes Poppins globais e locais, SVGs Lucide selecionados e logo oficial da Argonauts no favicon, cabeçalho e rodapé. O arquivo foi reutilizado de `Argonauts-Web/public/brands/argonauts/logo-white.svg`, sem redesenho.
- GSAP anima a entrada dos cards, títulos por palavras, resultados e indicador de protocolo. A troca entre IP, DNS e CIDR tem saída e entrada horizontal, usando os links e documentos HTML existentes. O indicador da navegação acompanha a aba ativa. Contextos são revertidos ao sair, e movimento reduzido mantém conteúdo e navegação disponíveis sem animações.
- “Powered by Argonauts Soluções LTDA” aparece nas cinco páginas. O histórico do navegador retorna a ferramentas utilizáveis, inclusive se uma consulta tiver sido interrompida.

## Validação

- `npm test`: testes de CIDR, entradas DNS, endereços e SEO.
- `npm run build`: build Vite de cinco páginas e recursos estáticos.
- `npm run test:e2e`: cópia, seleção/atualização de protocolos, falhas e retomada, DNS, CIDR, layouts e axe.
- Capturas em 360×640, 390×844, 768×1024, 1440×900 e 844×390, incluindo IPv6 completo e TXT longo. A Home cabe na viewport, inclusive em paisagem; nenhuma página apresenta overflow horizontal. Capturas revisadas visualmente.

Os E2E usam respostas de API controladas para cobrir sucesso, demora e falhas de forma reproduzível. Os endereços das capturas são reservados para documentação. A disponibilidade real de ipify e Google Public DNS continua dependendo dos serviços externos.

Lighthouse e métricas de campo LCP, CLS e INP não foram medidos. Não há afirmação de que suas metas tenham sido atingidas.

## Arquivos principais

- Interface: `index.html`, `dns/index.html`, `cidr/index.html`, `src/styles.css`, `src/ui.js`, `src/motion.js`, `public/brands/argonauts.svg` e `public/favicon.svg`.
- Interações e validação: `src/ip.js`, `src/ip-core.js`, `src/dns.js`, `src/dns-core.js` e `src/cidr.js`.
- Conteúdo e SEO: `guias/index.html`, `privacidade/index.html`, `public/sitemap.xml`, `public/llms.txt`, `public/llms-full.txt` e `public/docs/*.md`. O `robots.txt` existente foi preservado e verificado.
- Build e testes: `vite.config.js`, `package.json`, `package-lock.json`, `playwright.config.js`, `.github/workflows/quality.yml`, `.gitignore`, `tests/inputs.test.js`, `tests/seo.test.js`, `tests/e2e/ux.spec.js` e `tests/e2e/motion.spec.js`.
- Documentação: `README.md`, este relatório e `docs/qa/screenshots/`.

Resultado final: 11 testes de lógica/SEO e 10 testes E2E aprovados, build concluído e nenhuma violação detectada pelo axe nas telas DNS/CIDR da matriz de resolução. A cobertura inclui copiar, trocar de aba, voltar pelo histórico, verificar logo/rodapé, movimento reduzido e preservar o IPv6 ao mudar a preferência de movimento.
