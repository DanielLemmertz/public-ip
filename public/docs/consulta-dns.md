# Consulta DNS Online — Argonauts Network Tools

Ferramenta: https://public-ip-dusky.vercel.app/dns/

Consulte registros DNS utilizando o Google Public DNS em formato JSON via HTTPS. O domínio informado é enviado pelo navegador ao resolvedor, e os registros retornados são exibidos na interface.

## Registros aceitos

- A: endereço IPv4.
- AAAA: endereço IPv6.
- MX: servidores responsáveis pelo recebimento de e-mail.
- TXT: dados textuais e verificações de domínio (como SPF e DMARC).
- CNAME: nome alternativo apontando para outro hostname.
- NS: servidores de nomes.
- SOA: metadados da zona DNS.
- CAA: política de autoridade de certificação.
- PTR: resolução reversa, quando consultada sobre um nome adequado.

## Entendendo o resultado

TTL significa Time To Live e representa o prazo de cache da resposta em segundos. O status DNS é diferente do status HTTP: uma resposta HTTP 200 pode conter um erro DNS. Um retorno sem Answer não comprova que o domínio está fora do ar.

## Limites

A consulta reflete o resolvedor público usado, não a visão de todos os servidores autoritativos. Mudanças em DNS podem levar tempo para se propagar entre caches. Não use esta ferramenta para inserir senhas, tokens ou informações privadas.

## Fonte de consulta

https://developers.google.com/speed/public-dns/docs/doh/json
