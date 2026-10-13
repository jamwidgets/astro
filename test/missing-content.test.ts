import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

async function source(name: string): Promise<string> {
  return readFile(new URL(`../src/${name}`, import.meta.url), "utf8");
}

describe("widgets with missing content", () => {
  for (const [widget, label] of [
    ["Poll.astro", "Poll"],
    ["Embed.astro", "Embedded poll"],
  ] as const) {
    it(`${widget} hides itself and warns when its poll is not found`, async () => {
      const text = await source(widget);
      const notFound = text.slice(text.indexOf("response.status === 404"));

      expect(text).toContain("response.status === 404");
      expect(notFound.slice(0, 400)).toContain('style.display = "none"');
      expect(notFound.slice(0, 400)).toContain(`warnMissingContent("${label}"`);
    });

    it(`${widget} still shows other failures`, async () => {
      const text = await source(widget);

      expect(text).toContain('throw await apiError(response, "Failed to load poll")');
      expect(text).toContain('errorEl.textContent = "Failed to load poll"');
    });
  }
});
