import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
const root = resolve(import.meta.dirname, "..");
const origin = "https://public-ip-dusky.vercel.app";
const routes = ["", "dns/", "cidr/", "privacidade/", "guias/"];
test("all pages keep semantic HTML, unique metadata, canonical, Open Graph and valid JSON-LD", () => {
  const titles = new Set();
  for (const route of routes) {
    const html = readFileSync(resolve(root, route, "index.html"), "utf8");
    assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, route);
    const title = /<title>([^<]+)<\/title>/.exec(html)?.[1];
    assert.ok(title);
    assert.ok(!titles.has(title));
    titles.add(title);
    assert.match(html, /name="description"\s+content="[^"]+"/);
    const canonical = [...html.matchAll(/<link\b([^>]+)>/g)].find(
      ([, attributes]) => /rel="canonical"/.test(attributes),
    )?.[1];
    assert.ok(canonical?.includes(`href="${origin}/${route}"`));
    assert.doesNotMatch(html, /p\?blico|Navega\?\?o|\?ltimo|conte\?do|\uFFFD/);
    assert.match(html, /property="og:title"/);
    assert.match(html, /property="og:url"/);
    const blocks = [
      ...html.matchAll(
        /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
      ),
    ];
    assert.ok(blocks.length, route);
    for (const [, data] of blocks)
      assert.equal(JSON.parse(data)["@context"], "https://schema.org");
  }
});
test("sitemap, robots, guides and agent files point to existing resources", () => {
  const sitemap = readFileSync(resolve(root, "public/sitemap.xml"), "utf8");
  for (const route of routes)
    assert.ok(sitemap.includes(`<loc>${origin}/${route}</loc>`));
  assert.match(
    readFileSync(resolve(root, "public/robots.txt"), "utf8"),
    /Sitemap: https:\/\/public-ip-dusky.vercel.app\/sitemap.xml/,
  );
  for (const file of ["llms.txt", "llms-full.txt"]) {
    const content = readFileSync(resolve(root, "public", file), "utf8");
    assert.ok(content.includes(`${origin}/guias/`));
    for (const [, url] of content.matchAll(
      /\]\((https:\/\/public-ip-dusky\.vercel\.app\/[^)]*)\)/g,
    )) {
      const path = new URL(url).pathname;
      assert.ok(
        existsSync(
          resolve(
            root,
            path.endsWith("/") ? path.slice(1) + "index.html" : "public" + path,
          ),
        ),
        url,
      );
    }
  }
});
test("home keeps tool links in its initial HTML without editorial sections or placeholder results", () => {
  const html = readFileSync(resolve(root, "index.html"), "utf8");
  assert.match(html, /href="\/dns\/"/);
  assert.match(html, /href="\/cidr\/"/);
  assert.match(html, /id="primary-ip"/);
  assert.match(html, /id="copy-ip"/);
  assert.doesNotMatch(
    html,
    /class="editorial"|Seu IP P[uú]blico é:|Copie com um clique|NETWORK TOOLS \/ 0/,
  );
});
