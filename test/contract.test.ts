import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

// The server's OpenAPI document exists in the monorepo, not in the standalone
// package mirror, so the check that needs it runs here.
const specPath = new URL("../../../go-server/openapi/openapi.json", import.meta.url);
const hasSpec = existsSync(specPath);

async function source(name: string): Promise<string> {
  return readFile(new URL(`../src/${name}`, import.meta.url), "utf8");
}

async function apiEnum(schema: string, property: string): Promise<string[]> {
  const spec = JSON.parse(await readFile(specPath, "utf8"));
  return spec.components.schemas[schema].properties[property].enum;
}

describe("widget API contract", () => {
  it.skipIf(!hasSpec)("Feedback only offers and falls back to feedback types the API accepts", async () => {
    const accepted = await apiEnum("FeedbackWrite", "feedbackType");
    const feedback = await source("Feedback.astro");
    const offered = [...feedback.matchAll(/name="feedbackType" value="([^"]+)"/g)].map((m) => m[1]);
    const fallback = feedback.match(/const feedbackType = \(?typeInput\?\.value \|\| "([^"]+)"/)?.[1];

    expect(offered.length).toBeGreaterThan(0);
    for (const type of [...offered, fallback]) {
      expect(accepted, `feedback type "${type}"`).toContain(type);
    }
  });

  it("Comments sends replies through core, which sends the parent as an integer", async () => {
    const comments = await source("Comments.astro");
    expect(comments).toMatch(/import \{[^}]*\bpostComment\b[^}]*\} from "@jamwidgets\/core"/);
    expect(comments).toContain("parentId: parentId || undefined");
  });

  it("leaves widget requests to core", async () => {
    const widgets = (await readdir(new URL("../src/", import.meta.url))).filter((name) => name.endsWith(".astro"));
    for (const widget of widgets) {
      expect(await source(widget), widget).not.toMatch(/\bfetch\(/);
    }
    // The shared poll view only calls the core controller's fetch method.
    expect(await source("poll-view.ts")).not.toMatch(/(?<!\.)\bfetch\(/);
  });

  it("Poll and Embed share one poll implementation", async () => {
    for (const widget of ["Poll.astro", "Embed.astro"]) {
      const text = await source(widget);
      expect(text, widget).toContain("POLL_MARKUP");
      expect(text, widget).not.toContain("function renderPoll");
    }
  });

  it("shows the server's error message, never a raw body or statusText", async () => {
    const widgets = (await readdir(new URL("../src/", import.meta.url))).filter((name) => name.endsWith(".astro"));
    for (const widget of widgets) {
      const text = await source(widget);
      expect(text, widget).not.toMatch(/statusText/);
      expect(text, widget).not.toMatch(/const errorText = await response\.text\(\)/);
      expect(text, widget).not.toMatch(/const error = await response\.json\(\)/);
    }
  });
});
