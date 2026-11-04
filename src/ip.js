import { copyText } from "./ui.js";
import { isIPAddress } from "./ip-core.js";
import { animateResult, animateProtocol } from "./motion.js";
const $ = (id) => document.getElementById(id);
const endpoints = {
  ipv4: "https://api4.ipify.org?format=json",
  ipv6: "https://api6.ipify.org?format=json",
};
let addresses = { ipv4: "", ipv6: "" },
  selected = "",
  active,
  pending = false;
function render() {
  const available = Object.keys(addresses).filter((key) => addresses[key]);
  if (!addresses[selected]) selected = available[0] || "";
  const ip = addresses[selected];
  $("ip-result").classList.toggle("is-ipv6", selected === "ipv6");
  $("ip-result").classList.toggle("is-loading", !ip && pending);
  const output = $("primary-ip");
  const previous = output.textContent;
  if (selected === "ipv6" && ip) {
    output.replaceChildren();
    const parts = ip.split(":");
    parts.forEach((part, index) => {
      output.append(
        document.createTextNode(part + (index < parts.length - 1 ? ":" : "")),
      );
      if (index < parts.length - 1)
        output.append(document.createElement("wbr"));
    });
  } else output.textContent = ip || "—";
  if (ip && previous !== ip) animateResult(output);
  $("copy-ip").disabled = !ip;
  $("copy-ip").setAttribute(
    "aria-label",
    selected ? `Copiar ${selected === "ipv4" ? "IPv4" : "IPv6"}` : "Copiar IP",
  );
  $("copy-ip").title = $("copy-ip").getAttribute("aria-label");
  $("copy-ip").dataset.copyLabel = $("copy-ip").title;
  if (!$("copy-ip").classList.contains("is-copied"))
    $("copy-ip").querySelector("[data-copy-label]").textContent =
      $("copy-ip").title;
  $("protocol-switch").hidden = available.length < 2;
  $("protocol-single").hidden = available.length !== 1;
  $("protocol-single").textContent = selected === "ipv4" ? "IPv4" : "IPv6";
  for (const key of ["ipv4", "ipv6"])
    $("select-" + key).setAttribute("aria-pressed", String(selected === key));
  animateProtocol($("protocol-switch"), selected === "ipv6" ? 1 : 0);
  $("refresh-ip").disabled = pending;
  $("refresh-ip").classList.toggle("is-loading", pending);
  $("refresh-ip").setAttribute("aria-busy", String(pending));
}
async function refresh() {
  active?.abort();
  const controller = new AbortController();
  active = controller;
  pending = true;
  $("ip-feedback").textContent = "";
  $("copy-ip").classList.remove("is-copied");
  render();
  const next = { ipv4: "", ipv6: "" };
  let received = false;
  const tasks = Object.entries(endpoints).map(async ([key, url]) => {
    try {
      const response = await fetch(url, {
        signal: AbortSignal.any([controller.signal, AbortSignal.timeout(7000)]),
        cache: "no-store",
      });
      if (!response.ok) return;
      const { ip } = await response.json();
      const valid = isIPAddress(ip, key);
      if (!valid || controller.signal.aborted) return;
      next[key] = ip;
      received = true;
      addresses[key] = ip;
      render();
    } catch {
      /* Protocols resolve independently; the other address can still be copied. */
    }
  });
  await Promise.allSettled(tasks);
  if (controller.signal.aborted) return;
  pending = false;
  if (received) addresses = next;
  else
    $("ip-feedback").textContent = selected
      ? "Não foi possível atualizar. Tente novamente."
      : "Não foi possível consultar seu IP. Tente atualizar.";
  render();
}
$("copy-ip").addEventListener("click", () =>
  copyText(addresses[selected], $("copy-ip"), $("ip-feedback")),
);
for (const key of ["ipv4", "ipv6"])
  $("select-" + key).addEventListener("click", () => {
    selected = key;
    $("ip-feedback").textContent = "";
    $("copy-ip").classList.remove("is-copied");
    render();
  });
$("refresh-ip").addEventListener("click", refresh);
window.addEventListener("pagehide", () => active?.abort());
window.addEventListener("pageshow", (event) => {
  if (event.persisted) refresh();
});
refresh();
