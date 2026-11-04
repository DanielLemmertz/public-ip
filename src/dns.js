const $=id=>document.getElementById(id);
const types={A:1,NS:2,CNAME:5,SOA:6,PTR:12,MX:15,TXT:16,AAAA:28,CAA:257};
let active;
function render(items){const body=$("dns-rows");body.replaceChildren();if(!items.length){const tr=document.createElement("tr"),td=document.createElement("td");td.colSpan=3;td.textContent="Nenhum registro retornado.";tr.append(td);body.append(tr);return;}for(const item of items){const tr=document.createElement("tr");for(const value of [Object.keys(types).find(k=>types[k]===item.type)||item.type,String(item.data??"—"),String(item.TTL??"—")+" s"]){const td=document.createElement("td");td.textContent=value;tr.append(td)}body.append(tr)}}
$("dns-form").addEventListener("submit",async e=>{
 e.preventDefault();active?.abort();const controller=new AbortController();active=controller;
 const domain=$("dns-domain").value.trim().toLowerCase().replace(/\.$/,""),type=$("dns-type").value;
 const labels=domain.split(".");
 if(domain.length>253||labels.some(l=>l.length<1||l.length>63|| !/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(l))||!Object.hasOwn(types,type)){$("dns-status").textContent="Informe um domínio válido, como exemplo.com";render([]);return;}
 $("dns-submit").disabled=true;$("dns-status").textContent="Consultando Google Public DNS…";render([]);
 try{const u=new URL("https://dns.google/resolve");u.searchParams.set("name",domain);u.searchParams.set("type",type);const response=await fetch(u,{signal:AbortSignal.any([controller.signal,AbortSignal.timeout(8000)])});if(!response.ok)throw Error("HTTP "+response.status);
 const result=await response.json();if(controller.signal.aborted)return;
 if(result.Status!==0){$("dns-status").textContent=({3:"Domínio não encontrado (NXDOMAIN)",2:"Falha do resolvedor (SERVFAIL)",5:"Consulta recusada"}[result.Status]||"Resposta DNS "+result.Status);$("dns-count").textContent="DNS "+result.Status;render([]);return;}
 const rows=Array.isArray(result.Answer)?result.Answer:[];render(rows);$("dns-status").textContent=rows.length?"Resposta recebida do resolvedor Google Public DNS.":"Resposta sem registros na seção Answer.";$("dns-count").textContent=rows.length+" registro(s)";
 }catch(err){if(!controller.signal.aborted){$("dns-status").textContent="Não foi possível consultar DNS neste momento.";$("dns-count").textContent="Indisponível";}}
 finally{if(!controller.signal.aborted)$("dns-submit").disabled=false;}
});