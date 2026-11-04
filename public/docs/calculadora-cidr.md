# Calculadora CIDR IPv4 — Argonauts Network Tools

Ferramenta: https://publicip.argonauts.com.br/cidr/

A notação CIDR usa um prefixo para indicar quantos bits de um endereço IPv4 pertencem à rede. Exemplo: 192.168.1.10/24.

## Resultados

- Rede: endereço inicial do bloco.
- Máscara: equivalente decimal ao prefixo (por exemplo, /24 = 255.255.255.0).
- Broadcast: endereço final do bloco no modelo IPv4 tradicional.
- Primeiro e último endereço: limites do intervalo de endereços atribuídos ao bloco.
- Total: 2 elevado à quantidade de bits de host.
- Hosts utilizáveis: para /0 a /30, total menos 2; para /31, dois endereços utilizáveis em enlaces ponto a ponto (RFC 3021); para /32, um único endereço.

## Exemplos

192.168.1.10/24 -> rede 192.168.1.0, broadcast 192.168.1.255, máscara 255.255.255.0, 256 endereços, 254 hosts tradicionais.

10.0.0.0/31 -> 2 endereços em contexto ponto a ponto.

192.0.2.5/32 -> um único endereço.

## Privacidade

O cálculo é realizado totalmente no navegador. O valor digitado não precisa ser enviado à rede.

## Limites

Calcula apenas IPv4. Não decide regras de roteamento, ACLs ou configuração real de equipamentos de rede.

## Interação

Resultados válidos são atualizados durante a digitação. Calcular confirma a entrada. Cada valor pode ser copiado individualmente; "Copiar tudo" reúne os resultados.
