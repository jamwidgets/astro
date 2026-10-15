import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

async function source(name: string): Promise<string> {
  return readFile(new URL(`../src/${name}`, import.meta.url), "utf8");
}

describe("polls with missing content", () => {
  // The controller warns with the widget's label and resolves null for a 404;
  // core's tests cover that. The shared view hides the container on null.
  it("the shared poll view hides itself when its poll is not found", async () => {
    const view = await source("poll-view.ts");
    const missing = view.slice(view.indexOf("if (poll) {"));

    expect(missing.slice(0, 300)).toContain('container.style.display = "none"');
  });

  it("the shared poll view still shows other failures", async () => {
    const view = await source("poll-view.ts");

    expect(view).toContain('errorEl.textContent = "Failed to load poll"');
  });

  for (const [widget, label] of [
    ["Poll.astro", "Poll"],
    ["Embed.astro", "Embedded poll"],
  ] as const) {
    it(`${widget} mounts the shared view and names itself in warnings`, async () => {
      const text = await source(widget);

      expect(text).toMatch(/import \{[^}]*\bmountPoll\b[^}]*\} from "\.\/poll-view"/);
      expect(text).toContain(`widget: "${label}"`);
    });
  }
});
