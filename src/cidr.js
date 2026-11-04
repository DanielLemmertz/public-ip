import {calculateCIDR} from "./cidr-core.js";
const keys=["network","mask","broadcast","first","last","total","usable"];
const fmt=new Intl.NumberFormat("pt-BR");
function update(){
 try{const d=calculateCIDR(document.getElementById("cidr-value").value);
 for(const key of keys)document.getElementById("result-"+key).textContent=typeof d[key]==="number"?fmt.format(d[key]):d[key];
 document.getElementById("cidr-status").textContent="Cálculo concluído no navegador, sem consultar APIs.";
 }catch(e){for(const key of keys)document.getElementById("result-"+key).textContent="—";document.getElementById("cidr-status").textContent=e.message;}
}
document.getElementById("cidr-form").addEventListener("submit",e=>{e.preventDefault();update();});update();