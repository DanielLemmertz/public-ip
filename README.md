# Argonauts Network Tools

Site gratuito de diagnóstico básico da rede: consulta de IP público IPv4/IPv6, DNS e cálculo de sub-redes IPv4.

## Instalação

Requer Node.js 22 e npm.

- `npm ci`
- `npm run dev`
- `npm test`
- `npm run build`
- `npx playwright install chromium`
- `npm run test:e2e`
- `npm run preview`

Build multi-page com Vite. Diretórios públicos: /, /dns/, /cidr/, /guias/ e /privacidade/. Output: dist.

A Home prioriza o IP, a cópia do protocolo selecionado e os atalhos DNS/CIDR. As consultas de IPv4 e IPv6 são independentes: um resultado pode ser usado sem esperar pelo outro. DNS e CIDR oferecem cópia individual e completa. Entradas CIDR válidas são calculadas durante a digitação. Poppins é servida localmente; os ícones usam apenas os SVGs Lucide importados.

## SEO e indexação por IA

- Conteúdo essencial no HTML inicial. Guias e documentação ficam em páginas próprias, sem ocupar a Home.
- Titles, descriptions, canonical, Open Graph, Twitter meta, JSON-LD WebApplication.
- Sitemap em /sitemap.xml e instruções em /robots.txt.
- Documentação para IA em /llms.txt, /llms-full.txt e /docs/*.md.
- llms.txt é uma convenção voluntária; não garante indexação, ranking ou citações por agentes.

## Hospedagem

O domínio configurado no HTML e nos metadados é https://public-ip-dusky.vercel.app/. Confirme que o deploy utiliza este domínio canônico. Na Vercel, configure Vite, comando npm run build, output dist e **não** crie regra SPA fallback que substitua todas as páginas por index.html.

Antes de mudar de domínio, atualize todos os URLs canônicos e arquivos em public/.

## Dados e privacidade

A API ipify fornece IPv4/IPv6. Google Public DNS recebe consultas DNS por DNS-over-HTTPS. Calculadora CIDR opera localmente. O app não implementa analytics, conta, banco nem histórico. Logs de hospedagem e serviços externos dependem das respectivas políticas.

## Testes e validação

`npm test` verifica CIDR, entradas DNS, endereços IPv4/IPv6, metadados e links de sitemap/documentação. `npm run test:e2e` exercita os fluxos em Chromium contra o build de produção, com respostas de API controladas e endereços reservados para documentação. As capturas ficam em `docs/qa/screenshots/`.

O workflow executa testes, build e confirma arquivos SEO no dist. Lighthouse, LCP, CLS e INP não foram medidos; os valores citados como metas não são resultados deste trabalho. Após publicar, validar também Google Search Console, Bing Webmaster Tools e respostas HTTP dos recursos estáticos.

O pacote ainda contém dependências do protótipo React. Os novos HTML e scripts não importam React; as dependências podem ser removidas do lockfile num PR posterior.
