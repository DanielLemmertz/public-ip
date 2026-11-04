# Argonauts Network Tools

Site gratuito de diagnóstico básico da rede: consulta de IP público IPv4/IPv6, DNS e cálculo de sub-redes IPv4.

## Instalação

Requer Node.js 22 e npm.

- `npm ci`
- `npm run dev`
- `npm test`
- `npm run build`
- `npm run preview`

Build multi-page com Vite. Diretórios públicos: /, /dns/, /cidr/ e /privacidade/. Output: dist.

## SEO e indexação por IA

- Conteúdo editorial HTML retornado diretamente, sem exigir renderização JavaScript.
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

Teste unitário de CIDR com Node `--test`; workflow executa testes, build e confirma arquivos SEO no dist. Após publicar, validar Core Web Vitals no mobile, Google Search Console, Bing Webmaster Tools, URLs canonicals, dados estruturados e HTTP 200 de arquivos .txt e .md.

O pacote ainda contém dependências do protótipo React. Os novos HTML e scripts não importam React; as dependências podem ser removidas do lockfile num PR posterior.
