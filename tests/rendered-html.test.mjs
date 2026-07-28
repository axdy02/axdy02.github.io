import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the complete portfolio shell", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Ansh Kapoor/);
  assert.match(html, /ALWAYS LEARNING\./);
  assert.match(html, /ALWAYS GROWING\./);
  assert.match(html, /FloodReady/);
  assert.match(html, /EmoStudy/);
  assert.match(html, /AquaVision/);
  assert.match(html, /HAVE A PROBLEM/);
  assert.match(html, /href="#work"/);
  assert.match(html, /href="\/Ansh-Kapoor-Resume\.pdf"/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|SkeletonPreview/);
});

test("keeps public claims and links grounded in the supplied source", async () => {
  const [data, resume, floodMedia, emoMedia] = await Promise.all([
    readFile(new URL("../app/site-data.ts", import.meta.url), "utf8"),
    access(new URL("../public/Ansh-Kapoor-Resume.pdf", import.meta.url)),
    access(
      new URL(
        "../public/media/projects/floodready/floodready-landing.png",
        import.meta.url,
      ),
    ),
    access(
      new URL(
        "../public/media/projects/emostudy/emostudy-focus-dashboard.png",
        import.meta.url,
      ),
    ),
  ]);

  assert.equal(resume, undefined);
  assert.equal(floodMedia, undefined);
  assert.equal(emoMedia, undefined);
  assert.match(data, /https:\/\/floodready\.anshkapoor\.tech/);
  assert.match(data, /https:\/\/emostudy\.anshkapoor\.tech/);
  assert.match(data, /https:\/\/github\.com\/axdy02\/FloodReady/);
  assert.match(data, /https:\/\/github\.com\/axdy02\/Underwater-enhance-detection/);
  assert.match(data, /more than 500,000 records/);
  assert.doesNotMatch(data, /\bCGPA\b|\bphone\b/i);
  assert.match(data, /status: "planned"/);
});
