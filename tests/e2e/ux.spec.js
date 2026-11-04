import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir } from "node:fs/promises";
const ipv4 = "203.0.113.42";
const ipv6 = "2001:0db8:85a3:0000:0000:8a2e:0370:7334";
const dns = {
  Status: 0,
  Answer: [
    { type: 1, data: ipv4, TTL: 300 },
    { type: 16, data: '"v=spf1 include:example.org -all"', TTL: 3600 },
  ],
};
async function mockIp(page) {
  await page.route("https://api4.ipify.org/**", (route) =>
    route.fulfill({ json: { ip: ipv4 } }),
  );
  await page.route("https://api6.ipify.org/**", (route) =>
    route.fulfill({ json: { ip: ipv6 } }),
  );
}
test("IPv4 can be copied before IPv6 returns, and switching copies exactly the visible address", async ({
  page,
}) => {
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  let calls = 0;
  await page.route("https://api4.ipify.org/**", (route) => {
    calls++;
    return route.fulfill({ json: { ip: ipv4 } });
  });
  await page.route("https://api6.ipify.org/**", async (route) => {
    calls++;
    await gate;
    await route.fulfill({ json: { ip: ipv6 } });
  });
  await page.goto("/");
  await expect(page.locator("#primary-ip")).toHaveText(ipv4);
  await expect(page.locator("#protocol-switch")).toBeHidden();
  await page.getByRole("button", { name: "Copiar IPv4", exact: true }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(ipv4);
  await expect(page.locator("#ip-feedback")).toHaveText("Copiado.");
  release();
  await expect(page.locator("#protocol-switch")).toBeVisible();
  await page.getByRole("button", { name: "IPv6", exact: true }).click();
  await expect(page.locator("#select-ipv6")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.locator("#select-ipv4")).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await expect(page.locator("#primary-ip")).toHaveText(ipv6);
  await page.getByRole("button", { name: "Copiar IPv6", exact: true }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(ipv6);
  expect(calls).toBe(2);
  await page.getByRole("button", { name: "Atualizar" }).click();
  await expect.poll(() => calls).toBe(4);
  await expect(page.locator("#primary-ip")).toHaveText(ipv6);
});
test("single-protocol and failed queries stay simple and can be retried", async ({
  page,
}) => {
  await page.route("https://api4.ipify.org/**", (route) =>
    route.fulfill({ json: { ip: ipv4 } }),
  );
  await page.route("https://api6.ipify.org/**", (route) => route.abort());
  await page.goto("/");
  await expect(page.locator("#primary-ip")).toHaveText(ipv4);
  await expect(page.locator("#protocol-single")).toHaveText("IPv4");
  await expect(page.locator("#protocol-switch")).toBeHidden();
  await page.route("https://api4.ipify.org/**", (route) => route.abort());
  await page.reload();
  await expect(page.locator("#copy-ip")).toBeDisabled();
  await expect(page.locator("#ip-feedback")).toContainText("Tente atualizar");
  await page.route("https://api4.ipify.org/**", (route) =>
    route.fulfill({ json: { ip: ipv4 } }),
  );
  await page.getByRole("button", { name: "Atualizar" }).click();
  await expect(page.locator("#primary-ip")).toHaveText(ipv4);
});
test("DNS normalizes a pasted URL, copies records and handles empty and NXDOMAIN responses", async ({
  page,
}) => {
  await page.route("https://dns.google/resolve?**", (route) =>
    route.fulfill({ json: dns }),
  );
  await page.goto("/dns/");
  await page
    .getByLabel("Domínio", { exact: true })
    .fill("https://EXAMPLE.ORG/path");
  await page.getByRole("button", { name: "Consultar", exact: true }).click();
  await expect(page.locator("#dns-domain")).toHaveValue("example.org");
  await expect(page.locator("#dns-rows tr")).toHaveCount(2);
  await page
    .getByRole("button", { name: "Copiar registro A", exact: true })
    .click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(ipv4);
  await page.getByRole("button", { name: "Copiar tudo" }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
    'TXT\t"v=spf1',
  );
  await page.route("https://dns.google/resolve?**", (route) =>
    route.fulfill({ json: { Status: 3 } }),
  );
  await page.getByRole("button", { name: "Consultar", exact: true }).click();
  await expect(page.locator("#dns-status")).toHaveText(
    "Domínio não encontrado.",
  );
  await expect(page.locator("#dns-results")).toBeHidden();
  await page.route("https://dns.google/resolve?**", (route) =>
    route.fulfill({ json: { Status: 0 } }),
  );
  await page.getByRole("button", { name: "Consultar", exact: true }).click();
  await expect(page.locator("#dns-status")).toHaveText(
    "Nenhum registro A encontrado.",
  );
});
test("CIDR calculates while typing, copies values and clears invalid results", async ({
  page,
}) => {
  await page.goto("/cidr/");
  await expect(page.locator("#result-network")).toHaveText("192.168.1.0/24");
  await page.getByLabel("IPv4 / prefixo").fill("10.0.0.0/31");
  await expect(page.locator("#result-usable")).toHaveText("2");
  await page.getByRole("button", { name: "Copiar rede", exact: true }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    "10.0.0.0/31",
  );
  await page.getByLabel("IPv4 / prefixo").fill("999.0.0.1/24");
  await page.getByRole("button", { name: "Calcular", exact: true }).click();
  await expect(page.locator("#result-network")).toHaveText("—");
  await expect(page.locator("#cidr-value")).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  await page.getByLabel("IPv4 / prefixo").fill("192.0.2.5/32");
  await expect(page.locator("#result-usable")).toHaveText("1");
  await page.getByRole("button", { name: "Copiar tudo" }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
    "Rede: 192.0.2.5/32",
  );
});
test("desktop and mobile fit IPv4, complete IPv6, DNS and CIDR, with no accessibility violations", async ({
  page,
}) => {
  test.setTimeout(60000);
  await mockIp(page);
  await page.route("https://dns.google/resolve?**", (route) =>
    route.fulfill({
      json: {
        Status: 0,
        Answer: [{ type: 16, data: '"' + "a".repeat(240) + '"', TTL: 300 }],
      },
    }),
  );
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await mkdir("docs/qa/screenshots", { recursive: true });
  for (const [width, height] of [
    [360, 640],
    [390, 844],
    [768, 1024],
    [1440, 900],
    [844, 390],
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator("html")).toHaveAttribute(
      "data-motion-state",
      "idle",
    );
    await expect(page.locator("#primary-ip")).toHaveText(ipv4);
    for (const protocol of ["IPv4", "IPv6"]) {
      await page.getByRole("button", { name: protocol, exact: true }).click();
      await expect(page.locator("#protocol-switch")).toHaveCSS(
        "--protocol-position",
        protocol === "IPv6" ? "1" : "0",
      );
      await expect(page.locator("#primary-ip")).toHaveCSS("opacity", "1");
      await expect(page.locator("#copy-ip")).toBeInViewport({ ratio: 1 });
      await expect(page.locator(".tool-shortcuts")).toBeInViewport({
        ratio: 1,
      });
      expect(
        await page.evaluate(
          () =>
            document.documentElement.scrollHeight <= innerHeight &&
            document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.screenshot({
        path: `docs/qa/screenshots/ip-${protocol}-${width}.png`,
        animations: "disabled",
      });
    }
    for (const tool of ["dns", "cidr"]) {
      await page.goto(`/${tool}/`);
      await expect(page.locator("html")).toHaveAttribute(
        "data-motion-state",
        "idle",
      );
      if (tool === "dns") {
        await page.getByLabel("Domínio", { exact: true }).fill("example.org");
        await page
          .getByRole("button", { name: "Consultar", exact: true })
          .click();
        await expect(page.locator("#dns-results")).toBeVisible();
        await expect(page.locator("#dns-rows tr").last()).toHaveCSS(
          "opacity",
          "1",
        );
      } else
        await expect(page.locator("#result-network")).toHaveText(
          "192.168.1.0/24",
        );
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.screenshot({
        path: `docs/qa/screenshots/${tool}-${width}.png`,
        fullPage: true,
      });
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    }
  }
  expect(errors).toEqual([]);
});
