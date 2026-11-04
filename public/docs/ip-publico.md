# Qual é meu IP público? — Argonauts Network Tools

URL da ferramenta: https://public-ip-dusky.vercel.app/

O site mostra o IPv4 e o IPv6 que os serviços externos da ipify observam quando o navegador realiza uma consulta. É gratuito e não exige cadastro.

## IPv4 e IPv6

- IPv4 tem 32 bits; exemplo reservado para documentação: 203.0.113.10.
- IPv6 tem 128 bits; exemplo reservado para documentação: 2001:db8::1.
- Nem toda conexão oferece os dois protocolos. Uma falha de consulta não prova ausência do protocolo.

## IP público versus privado

Um IP privado, como 192.168.1.20, costuma identificar um dispositivo dentro da rede local. O IP público é o endereço observado na saída para a internet. CGNAT, VPN e proxies podem fazer múltiplos dispositivos compartilharem um mesmo IP público.

## Como utilizar

1. Abra https://public-ip-dusky.vercel.app/.
2. Confira o endereço principal e os campos IPv4/IPv6.
3. Use o botão ao lado do resultado. Ele copia o protocolo selecionado.
4. Clique em "Atualizar" para repetir a consulta.

## Limitações

O IP público não permite identificar por si só um endereço residencial exato. Endereços dinâmicos podem mudar com o tempo. Uma falha da API é informada como indisponibilidade de consulta, não como diagnóstico definitivo da conectividade.

## Privacidade

A consulta é feita pelo navegador aos endpoints https://api4.ipify.org e https://api6.ipify.org. Leia https://public-ip-dusky.vercel.app/privacidade/.
