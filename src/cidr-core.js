export function calculateCIDR(input) {
  const match = /^([^/]+)\/(\d{1,2})$/.exec(input.trim());
  if (!match) throw new Error("Use IPv4/prefixo, por exemplo 192.168.1.10/24");
  const parts = match[1].split(".");
  const prefix = Number(match[2]);
  if(parts.length!==4 || parts.some(x=> !/^(0|[1-9]\d{0,2})$/.test(x) || Number(x)>255) || prefix>32) throw new Error("IPv4 ou prefixo inválido");
  const ip = parts.reduce((a,b)=> ((a*256)+Number(b))>>>0,0);
  const mask = prefix===0 ? 0 : (0xffffffff << (32-prefix))>>>0;
  const net = (ip & mask)>>>0, end = (net | (~mask>>>0))>>>0;
  const fmt = n=>[24,16,8,0].map(s=>(n>>>s)&255).join(".");
  const total=2**(32-prefix);
  return {network:fmt(net)+"/"+prefix,mask:fmt(mask),broadcast:fmt(end),first:fmt(prefix<=30?net+1:net),last:fmt(prefix<=30?end-1:end),total,usable:prefix<=30?total-2:prefix===31?2:1};
}