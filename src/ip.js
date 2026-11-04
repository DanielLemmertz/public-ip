const $=id=>document.getElementById(id);let current={ipv4:"",ipv6:""},controller;
async function lookup(url,signal){const response=await fetch(url,{signal:AbortSignal.any([signal,AbortSignal.timeout(7000)]),cache:"no-store"});if(!response.ok)throw Error("Falha no serviço");const data=await response.json();return data.ip||""}
async function refresh(){
 controller?.abort();controller=new AbortController();const signal=controller.signal;
 current={ipv4:"",ipv6:""};for(const id of ["copy-ip","copy-ipv4","copy-ipv6"])$(id).disabled=true;$("refresh-ip").disabled=true;
 $("primary-ip").textContent="Consultando sua conexão…";$("ip-state").textContent="Consultando";$("ip-feedback").textContent="Consultando IPv4 e IPv6 separadamente…";
 for(const id of ["ipv4","ipv6"])$(id).textContent="Consultando…";
 const results=await Promise.allSettled([lookup("https://api4.ipify.org?format=json",signal),lookup("https://api6.ipify.org?format=json",signal)]);
 if(signal.aborted)return;
 if(results[0].status==="fulfilled"&&/^(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)$/.test(results[0].value))current.ipv4=results[0].value;
 if(results[1].status==="fulfilled"&&/^[a-fA-F\d:]+$/.test(results[1].value)&&results[1].value.includes(":"))current.ipv6=results[1].value;
 $("ipv4").textContent=current.ipv4||"Consulta indisponível";$("ipv6").textContent=current.ipv6||"Consulta indisponível";
 $("primary-ip").textContent=current.ipv4||current.ipv6||"Consulta indisponível";$("ip-state").textContent=current.ipv4||current.ipv6?"Consulta concluída":"Falha na consulta";
 $("ip-feedback").textContent=current.ipv4||current.ipv6?"IP observado por um serviço externo. Falha de um protocolo não comprova ausência de suporte.":"Não foi possível consultar os serviços. Tente atualizar.";
 $("copy-ip").disabled=!(current.ipv4||current.ipv6);$("copy-ipv4").disabled=!current.ipv4;$("copy-ipv6").disabled=!current.ipv6;$("refresh-ip").disabled=false;
}
async function copy(value){if(!value)return;try{await navigator.clipboard.writeText(value);$("ip-feedback").textContent="IP copiado para a área de transferência."}catch{$("ip-feedback").textContent="Não foi possível copiar automaticamente. Selecione o endereço e copie manualmente."}}
$("copy-ip").addEventListener("click",()=>copy(current.ipv4||current.ipv6));$("copy-ipv4").addEventListener("click",()=>copy(current.ipv4));$("copy-ipv6").addEventListener("click",()=>copy(current.ipv6));$("refresh-ip").addEventListener("click",refresh);refresh();