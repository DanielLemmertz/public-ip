import test from "node:test";
import assert from "node:assert/strict";
import { normalizeDomain } from "../src/dns-core.js";
import { isIPAddress } from "../src/ip-core.js";

test("DNS accepts domains, pasted URLs and internationalized hostnames", () => {
  assert.equal(normalizeDomain(" EXAMPLE.COM. "), "example.com");
  assert.equal(
    normalizeDomain("https://example.com/path?q=test"),
    "example.com",
  );
  assert.equal(normalizeDomain("café.com"), "xn--caf-dma.com");
  assert.equal(
    normalizeDomain("1.0.0.127.in-addr.arpa"),
    "1.0.0.127.in-addr.arpa",
  );
});
test("DNS rejects credentials, invalid labels, empty and non-HTTP inputs", () => {
  for (const input of [
    "",
    "localhost",
    "not a domain",
    "-bad.com",
    "bad-.com",
    "a".repeat(64) + ".com",
    "https://user:password@example.com",
    "javascript:alert(1)",
    "ftp://example.com",
  ])
    assert.throws(() => normalizeDomain(input));
});
test("protocol detection rejects malformed API responses and accepts complete IPv6", () => {
  assert.equal(isIPAddress("203.0.113.42", "ipv4"), true);
  for (const value of ["999.0.0.1", "", undefined, "2001:db8::1"])
    assert.equal(isIPAddress(value, "ipv4"), false);
  for (const value of [
    "2001:db8::1",
    "2001:0db8:85a3:0000:0000:8a2e:0370:7334",
    "::ffff:192.0.2.1",
  ])
    assert.equal(isIPAddress(value, "ipv6"), true);
  for (const value of [":", "::::", "<script>", "", undefined, "203.0.113.42"])
    assert.equal(isIPAddress(value, "ipv6"), false);
});
