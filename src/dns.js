import { icons, copyButton, copyText } from "./ui.js";
import { normalizeDomain, recordTypes } from "./dns-core.js";
import { revealResults } from "./motion.js";
const $ = (id) => document.getElementById(id);
let active,
  records = [];
function render(rows) {
  $("dns-rows").replaceChildren();
  for (const item of rows) {
    const row = document.createElement("tr");
    const type =
      Object.keys(recordTypes).find((key) => recordTypes[key] === item.type) ||
      String(item.type);
    const kind = document.createElement("td");
    kind.textContent = type;
    kind.className = "record-type";
    const value = document.createElement("td");
    const text = document.createElement("span");
    text.className = "record-value";
    text.textContent = String(item.data ?? "—");
    const ttl = document.createElement("span");
    ttl.className = "record-meta";
    ttl.textContent = `TTL ${item.TTL ?? "—"} s`;
    value.append(text, ttl);
    const action = document.createElement("td");
    action.className = "record-action";
    action.append(
      copyButton(
        `Copiar registro ${type}`,
        String(item.data ?? ""),
        $("dns-status"),
      ),
    );
    row.append(kind, value, action);
    $("dns-rows").append(row);
  }
  icons();
}
$("dns-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  active?.abort();
  $("dns-submit").disabled = false;
  $("dns-submit").removeAttribute("aria-busy");
  const type = $("dns-type").value;
  let domain;
  try {
    domain = normalizeDomain($("dns-domain").value);
    if (!Object.hasOwn(recordTypes, type))
      throw new Error("Selecione um tipo de registro.");
  } catch (error) {
    $("dns-domain").setAttribute("aria-invalid", "true");
    $("dns-status").textContent = error.message;
    $("dns-results").hidden = true;
    return;
  }
  $("dns-domain").removeAttribute("aria-invalid");
  $("dns-domain").value = domain;
  const controller = new AbortController();
  active = controller;
  $("dns-submit").disabled = true;
  $("dns-submit").setAttribute("aria-busy", "true");
  $("dns-status").textContent = "Consultando…";
  $("dns-results").hidden = true;
  try {
    const url = new URL("https://dns.google/resolve");
    url.searchParams.set("name", domain);
    url.searchParams.set("type", type);
    const response = await fetch(url, {
      signal: AbortSignal.any([controller.signal, AbortSignal.timeout(8000)]),
    });
    if (!response.ok)
      throw new Error("Não foi possível consultar. Tente novamente.");
    const result = await response.json();
    if (controller.signal.aborted) return;
    if (result.Status !== 0)
      throw new Error(
        {
          3: "Domínio não encontrado.",
          2: "O servidor DNS não respondeu. Tente novamente.",
          5: "A consulta foi recusada.",
        }[result.Status] || "Não foi possível consultar este domínio.",
      );
    records = Array.isArray(result.Answer) ? result.Answer : [];
    render(records);
    $("dns-count").textContent =
      `${records.length} ${records.length === 1 ? "registro" : "registros"}`;
    $("dns-status").textContent = records.length
      ? ""
      : `Nenhum registro ${type} encontrado.`;
    $("dns-results").hidden = !records.length;
    if (records.length) revealResults($("dns-results"));
  } catch (error) {
    if (!controller.signal.aborted)
      $("dns-status").textContent =
        error.name === "TimeoutError"
          ? "A consulta demorou. Tente novamente."
          : error.message === "Failed to fetch"
            ? "Sem resposta. Verifique sua conexão."
            : error.message;
  } finally {
    if (!controller.signal.aborted) {
      $("dns-submit").disabled = false;
      $("dns-submit").removeAttribute("aria-busy");
    }
  }
});
$("copy-dns").addEventListener("click", () =>
  copyText(
    records
      .map(
        (item) =>
          `${Object.keys(recordTypes).find((key) => recordTypes[key] === item.type) || item.type}\t${item.data}\t${item.TTL} s`,
      )
      .join("\n"),
    $("copy-dns"),
    $("dns-status"),
  ),
);
window.addEventListener("pagehide", () => active?.abort());
window.addEventListener("pageshow", (event) => {
  if (!event.persisted) return;
  if ($("dns-submit").hasAttribute("aria-busy"))
    $("dns-status").textContent = "";
  $("dns-submit").disabled = false;
  $("dns-submit").removeAttribute("aria-busy");
});
