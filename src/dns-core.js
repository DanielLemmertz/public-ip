export const recordTypes = {
  A: 1,
  NS: 2,
  CNAME: 5,
  SOA: 6,
  PTR: 12,
  MX: 15,
  TXT: 16,
  AAAA: 28,
  CAA: 257,
};

export function normalizeDomain(input) {
  const value = input.trim();
  if (!value || /\s/.test(value)) throw new Error("Informe um domínio válido.");
  let url;
  try {
    url = new URL(value.includes("://") ? value : `https://${value}`);
  } catch {
    throw new Error("Informe um domínio válido.");
  }
  const domain = url.hostname.toLowerCase().replace(/\.$/, "");
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    domain.length > 253 ||
    !domain.includes(".") ||
    domain
      .split(".")
      .some((label) => !/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label))
  ) {
    throw new Error("Informe um domínio válido.");
  }
  return domain;
}
