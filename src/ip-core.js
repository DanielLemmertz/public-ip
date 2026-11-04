export function isIPAddress(value, protocol) {
  if (typeof value !== "string") return false;
  if (protocol === "ipv4")
    return /^(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)$/.test(
      value,
    );
  if (protocol !== "ipv6" || !value.includes(":")) return false;
  try {
    return new URL(`http://[${value}]/`).hostname.startsWith("[");
  } catch {
    return false;
  }
}
