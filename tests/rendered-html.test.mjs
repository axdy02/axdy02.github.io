import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
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
  assert.doesNotMatch(
    html,
    />Full-stack developer building intelligent, real-world web applications\.</,
  );
  assert.match(html, /FloodReady/);
  assert.match(html, /EmoStudy/);
  assert.match(html, /AquaVision/);
  assert.match(html, /particles-container site-particles/);
  assert.match(html, /hyperspeed hero-hyperspeed/);
  assert.match(html, /id="hero-core-window"/);
  assert.doesNotMatch(html, /Scroll to inspect/i);
  assert.doesNotMatch(
    html,
    /gridscan|hero-gridscan|gridscan__preview|gridscan__video|gridscan__badge|<video\b/i,
  );
  assert.doesNotMatch(html, /id="lights"/);
  assert.doesNotMatch(html, /hero-orbit-field|hero-orbit-ring/);
  assert.match(html, /\/media\/projects\/aquavision\/original\.png/);
  assert.match(html, /\/media\/projects\/aquavision\/restored\.png/);
  assert.match(html, /\/media\/projects\/aquavision\/enhanced\.png/);
  assert.match(html, /\/media\/projects\/aquavision\/detected\.png/);
  assert.doesNotMatch(
    html,
    /Visual samples are being prepared|samples deliberately withheld/i,
  );
  assert.match(html, /HAVE A PROBLEM/);
  assert.match(html, /href="#work"/);
  assert.match(html, /href="\/Ansh-Kapoor-Resume\.pdf"/);
  assert.match(html, /Copy email address anshk12456@gmail\.com/);
  assert.doesNotMatch(html, /Drag \/ rotate \/ AK core|Click \+ hold/i);
  assert.doesNotMatch(
    html,
    /Open to internships and graduate software roles|Designed and engineered in Delhi/i,
  );
  assert.doesNotMatch(html, /<form\b|<input\b|<textarea\b/i);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|SkeletonPreview/);

  const introIndex = html.indexOf("boot-screen");
  const mainIndex = html.indexOf('id="main"');
  assert.ok(introIndex >= 0 && introIndex < mainIndex);
  assert.match(html.slice(introIndex, mainIndex), /Ansh Kapoor/);
});

test("keeps public claims and links grounded in the supplied source", async () => {
  const [
    data,
    resume,
    floodMedia,
    emoMedia,
    heroModel,
    aquaOriginal,
    aquaRestored,
    aquaEnhanced,
    aquaDetected,
    floodReadyFiles,
  ] = await Promise.all([
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
      access(new URL("../public/models/ak-hero.glb", import.meta.url)),
      access(
        new URL(
          "../public/media/projects/aquavision/original.png",
          import.meta.url,
        ),
      ),
      access(
        new URL(
          "../public/media/projects/aquavision/restored.png",
          import.meta.url,
        ),
      ),
      access(
        new URL(
          "../public/media/projects/aquavision/enhanced.png",
          import.meta.url,
        ),
      ),
      access(
        new URL(
          "../public/media/projects/aquavision/detected.png",
          import.meta.url,
        ),
      ),
      readdir(
        new URL("../public/media/projects/floodready/", import.meta.url),
      ),
    ]);

  assert.equal(resume, undefined);
  assert.equal(floodMedia, undefined);
  assert.equal(emoMedia, undefined);
  assert.equal(heroModel, undefined);
  assert.equal(aquaOriginal, undefined);
  assert.equal(aquaRestored, undefined);
  assert.equal(aquaEnhanced, undefined);
  assert.equal(aquaDetected, undefined);
  assert.deepEqual(floodReadyFiles, ["floodready-landing.png"]);
  assert.match(data, /https:\/\/floodready\.anshkapoor\.tech/);
  assert.match(data, /https:\/\/emostudy\.anshkapoor\.tech/);
  assert.match(data, /https:\/\/github\.com\/axdy02\/FloodReady/);
  assert.match(data, /https:\/\/github\.com\/axdy02\/Underwater-enhance-detection/);
  assert.match(data, /more than 500,000 records/);
  assert.doesNotMatch(data, /\bCGPA\b|\bphone\b/i);
  assert.doesNotMatch(data, /status: "planned"/);
});
