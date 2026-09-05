import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

const COMPONENTS = [
  "Announcements",
  "Comments",
  "Embed",
  "Feedback",
  "Form",
  "Poll",
  "Reactions",
  "Subscribe",
  "Views",
  "Waitlist",
] as const;

async function source(name: string): Promise<string> {
  return readFile(new URL(`../src/${name}.astro`, import.meta.url), "utf8");
}

describe("widget theme contract", () => {
  it("loads the shared theme for every styled widget", async () => {
    for (const component of COMPONENTS) {
      const componentSource = await source(component);
      expect(componentSource, component).toContain(
        'import Theme from "./Theme.astro";',
      );
      expect(componentSource, component).toContain("<Theme />");
    }
  });

  it("keeps every widget rule in the shared cascade layer", async () => {
    for (const component of COMPONENTS) {
      expect(await source(component), component).toContain("@layer jamwidgets");
    }
  });

  it("inherits host styling unless a preset is requested", async () => {
    for (const component of COMPONENTS) {
      expect(await source(component), component).toContain('theme = "inherit"');
    }
  });

  it("keeps inherit mode neutral and readable without host tokens", async () => {
    const theme = await source("Theme");
    const announcements = await source("Announcements");
    const views = await source("Views");

    expect(theme).not.toContain("AccentColor");
    expect(theme).not.toContain("--jamwidgets-focus-ring");
    expect(theme).toContain(
      ":where(.jamwidgets-theme-light, .jamwidgets-theme-auto)",
    );
    expect(theme).toContain(
      "--jamwidgets-success-text: var(--jamwidgets-color-success, currentColor)",
    );
    expect(theme).toContain(
      "--jamwidgets-error-text: var(--jamwidgets-color-error, currentColor)",
    );
    expect(announcements).toContain(
      "color: var(--jamwidgets-color-info, currentColor)",
    );
    expect(views).toContain("color: var(--jamwidgets-count-color)");
  });

  it("uses one shared focus ring for form controls", async () => {
    for (const component of ["Comments", "Feedback", "Subscribe", "Waitlist"]) {
      expect(await source(component), component).not.toContain(
        "box-shadow: 0 0 0",
      );
    }
  });
});

describe("widget moderation protocol", () => {
  it("sends server-recognized internal fields", async () => {
    const form = await source("Form");
    const comments = await source("Comments");

    expect(form).toContain("data._seriph_ts = loadTimestamp");
    expect(form).toContain("data._seriph_id = requestIds.get(formEl)");
    expect(form).toContain("requestBodies.get(formEl) !== comparableBody");
    expect(form).toContain("import { generateUUID,");
    expect(form).not.toContain("crypto.randomUUID");
    expect(comments).toContain("_seriph_ts: loadTimestamp");
    expect(form).not.toContain("_jamwidgets_ts");
    expect(comments).not.toContain("_jamwidgets_ts");
  });
});
