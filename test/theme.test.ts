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

  it("ranks the widget layer above Tailwind's base whichever CSS loads first", async () => {
    // A layer's rank is fixed where it is first named. Without this statement,
    // widget CSS bundled before a Tailwind v4 site's global CSS would put the
    // jamwidgets layer below `base`, and Preflight would reset the widgets.
    const order = "@layer theme, base, components, utilities, jamwidgets;";
    for (const component of [...COMPONENTS, "Theme"]) {
      const text = await source(component);
      const declared = text.indexOf(order);
      expect(declared, component).toBeGreaterThan(-1);
      expect(declared, component).toBeLessThan(text.indexOf("@layer jamwidgets {"));
    }
  });

  it("names every email input for assistive technology", async () => {
    for (const component of ["Subscribe", "Waitlist"]) {
      const text = await source(component);
      expect(text, component).toContain('label = "Email address"');
      expect(text, component).toContain("aria-label={label}");
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

    // Core turns formLoadTime and requestId into _seriph_ts and _seriph_id.
    expect(form).toMatch(/import \{[^}]*\bsubmitForm\b[^}]*\} from "@jamwidgets\/core"/);
    expect(form).toContain("const formLoadTime = formTimestamps.get(formEl)");
    expect(form).toContain("const requestId = requestIds.get(formEl)");
    expect(form).toContain("requestBodies.get(formEl) !== comparableBody");
    expect(form).toMatch(/import \{[^}]*\bgenerateUUID\b[^}]*\} from "@jamwidgets\/core"/);
    expect(form).not.toContain("crypto.randomUUID");
    expect(comments).toContain("formLoadTime: loadTimestamp");
    expect(comments).toContain("honeypot: honeypot || undefined");
    expect(form).not.toContain("_jamwidgets_ts");
    expect(comments).not.toContain("_jamwidgets_ts");
  });
});
