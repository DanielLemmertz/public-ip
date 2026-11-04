import {
  createIcons,
  Copy,
  Check,
  RotateCw,
  ArrowUpRight,
  ArrowRight,
  Globe2,
  Network,
  Calculator,
  Search,
  ChevronDown,
} from "lucide";

export function icons(root = document) {
  createIcons({
    icons: {
      Copy,
      Check,
      RotateCw,
      ArrowUpRight,
      ArrowRight,
      Globe2,
      Network,
      Calculator,
      Search,
      ChevronDown,
    },
    root,
    attrs: { "stroke-width": 1.6, "aria-hidden": "true", focusable: "false" },
  });
}

const timers = new WeakMap();
export async function copyText(value, button, status) {
  if (!value) return;
  try {
    await navigator.clipboard.writeText(value);
    clearTimeout(timers.get(button));
    button.classList.add("is-copied");
    status.textContent = "Copiado.";
    timers.set(
      button,
      setTimeout(() => {
        button.classList.remove("is-copied");
        if (status.textContent === "Copiado.") status.textContent = "";
      }, 1800),
    );
  } catch {
    status.textContent = "Selecione o valor e copie manualmente.";
  }
}

export function copyButton(label, value, status) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "icon-button copy-button";
  button.setAttribute("aria-label", label);
  button.title = label;
  button.innerHTML =
    '<span class="icon-default"><i data-lucide="copy"></i></span><span class="icon-success"><i data-lucide="check"></i></span>';
  button.addEventListener("click", () => copyText(value, button, status));
  return button;
}

icons();
