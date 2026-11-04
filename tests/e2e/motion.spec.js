import { test, expect } from "@playwright/test";
const ipv4 = "203.0.113.42";
async function mockIp(page) {
  await page.route("https://api4.ipify.org/**", (route) =>
    route.fulfill({ json: { ip: ipv4 } }),
  );
  await page.route("https://api6.ipify.org/**", (route) => route.abort());
}

test("copy is a visible labelled action inside the floating IP card", async ({
  page,
}) => {
  await mockIp(page);
  await page.goto("/");
  await expect(page.locator(".ip-hero.floating-card")).toBeVisible();
  const button = page.locator("#copy-ip");
  await expect(button).toContainText("Copiar IPv4");
  await expect(button).toBeEnabled();
  await button.click();
  await expect(button).toContainText("IP copiado");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(ipv4);
});

test("tab changes animate and browser back returns to a usable IP tool", async ({
  page,
}) => {
  await mockIp(page);
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute(
    "data-motion-state",
    "idle",
  );
  const nav = page.getByRole("navigation", { name: "Navegação principal" });
  await nav.getByRole("link", { name: "Consulta DNS", exact: true }).click();
  await expect(page).toHaveURL(/\/dns\/$/);
  await expect(page.locator("html")).toHaveAttribute(
    "data-page-transition",
    "animated",
  );
  await expect(
    page.getByRole("heading", { name: "Consulta DNS", exact: true }),
  ).toBeVisible();
  await nav
    .getByRole("link", { name: "Calculadora CIDR", exact: true })
    .click();
  await expect(page.locator("#result-network")).toHaveText("192.168.1.0/24");
  await page.goBack();
  await expect(page).toHaveURL(/\/dns\/$/);
  await expect(page.locator("#dns-submit")).toBeEnabled();
  await page.goBack();
  await expect(page.locator("#primary-ip")).toHaveText(ipv4);
  await expect(page.locator("#copy-ip")).toBeEnabled();
  await page.locator("#copy-ip").click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(ipv4);
  expect(errors).toEqual([]);
});

test("official logo, favicon and Powered by appear on all five pages", async ({
  page,
}) => {
  await mockIp(page);
  for (const path of ["/", "/dns/", "/cidr/", "/guias/", "/privacidade/"]) {
    await page.goto(path);
    await expect(page.locator(".brand img")).toHaveAttribute(
      "src",
      "/brands/publicip/logo.png",
    );
    await expect(page.locator('link[rel="icon"]')).toHaveAttribute(
      "href",
      "/brands/publicip/logo.png",
    );
    await expect(page.locator(".powered-by")).toContainText("Powered by");
    await expect(page.locator(".powered-by a")).toHaveText(
      "Argonauts Soluções LTDA",
    );
    expect(
      await page
        .locator(".brand img")
        .evaluate((image) => image.complete && image.naturalWidth > 0),
    ).toBe(true);
    await expect(page.locator(".powered-by img")).toBeVisible();
  }
});

test("reduced motion keeps cards, text and navigation immediately usable", async ({
  page,
}) => {
  await mockIp(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute(
    "data-motion-state",
    "reduced",
  );
  await expect(page.locator("#copy-ip")).toBeEnabled();
  expect(
    await page
      .locator(".ip-hero")
      .evaluate((card) => getComputedStyle(card).transform),
  ).toBe("none");
  await page
    .getByRole("navigation", { name: "Navegação principal" })
    .getByRole("link", { name: "Consulta DNS", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Consulta DNS", exact: true }),
  ).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute(
    "data-motion-state",
    "reduced",
  );
});

test("changing motion preference preserves the IPv6 selection and its indicator", async ({
  page,
}) => {
  await mockIp(page);
  await page.route("https://api6.ipify.org/**", (route) =>
    route.fulfill({ json: { ip: "2001:db8::1" } }),
  );
  await page.goto("/");
  await page.getByRole("button", { name: "IPv6", exact: true }).click();
  await expect(page.locator("#protocol-switch")).toHaveCSS(
    "--protocol-position",
    "1",
  );
  await expect(page.locator("#primary-ip")).toHaveCSS("opacity", "1");
  const position = () =>
    page
      .locator("#protocol-switch")
      .evaluate((element) => getComputedStyle(element, "::before").transform);
  const before = await position();
  expect(
    await page
      .locator("#protocol-switch")
      .evaluate(
        (element) =>
          new DOMMatrix(getComputedStyle(element, "::before").transform).m41,
      ),
  ).toBeGreaterThan(0);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator("html")).toHaveAttribute(
    "data-motion-state",
    "reduced",
  );
  expect(await position()).toBe(before);
  await expect(page.locator("#select-ipv6")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.locator("#primary-ip")).toHaveText("2001:db8::1");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(page.locator("html")).toHaveAttribute(
    "data-motion-state",
    "idle",
  );
  expect(await position()).toBe(before);
});
