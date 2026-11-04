import { calculateCIDR } from "./cidr-core.js";
import { icons, copyButton, copyText } from "./ui.js";
const input = document.getElementById("cidr-value"),
  status = document.getElementById("cidr-status");
const labels = {
  network: "Rede",
  mask: "Máscara",
  broadcast: "Broadcast",
  first: "Primeiro host",
  last: "Último host",
  total: "Total de endereços",
  usable: "Hosts utilizáveis",
};
const format = new Intl.NumberFormat("pt-BR");
let current, timer;
function update(report = true) {
  try {
    const result = calculateCIDR(input.value);
    if (
      current &&
      Object.keys(labels).every((key) => current[key] === result[key])
    ) {
      input.removeAttribute("aria-invalid");
      status.textContent = "";
      return;
    }
    current = result;
    input.removeAttribute("aria-invalid");
    status.textContent = "";
    for (const [key, label] of Object.entries(labels)) {
      const value =
        typeof result[key] === "number"
          ? format.format(result[key])
          : result[key];
      const node = document.getElementById("result-" + key);
      node.textContent = value;
      const action = document.getElementById("copy-" + key);
      action.replaceChildren(
        copyButton(
          `Copiar ${label.toLowerCase()}`,
          String(result[key]),
          status,
        ),
      );
    }
    document.getElementById("copy-cidr").disabled = false;
    icons();
  } catch {
    if (!report) return;
    current = null;
    input.setAttribute("aria-invalid", "true");
    status.textContent = "Use um IPv4 com prefixo de /0 a /32.";
    for (const key of Object.keys(labels)) {
      document.getElementById("result-" + key).textContent = "—";
      document.getElementById("copy-" + key).replaceChildren();
    }
    document.getElementById("copy-cidr").disabled = true;
  }
}
input.addEventListener("input", () => {
  clearTimeout(timer);
  timer = setTimeout(() => update(false), 180);
});
input.addEventListener("blur", () => {
  clearTimeout(timer);
  update();
});
document.getElementById("cidr-form").addEventListener("submit", (event) => {
  event.preventDefault();
  clearTimeout(timer);
  update();
});
document.getElementById("copy-cidr").addEventListener("click", () => {
  if (current)
    copyText(
      Object.entries(labels)
        .map(([key, label]) => `${label}: ${current[key]}`)
        .join("\n"),
      document.getElementById("copy-cidr"),
      status,
    );
});
window.addEventListener("pagehide", () => clearTimeout(timer));
update();
