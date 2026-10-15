import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";

import {
  fetchAnnouncements,
  fetchComments,
  fetchReactions,
  joinWaitlist,
  PollController,
  recordView,
  submitFeedback,
  submitForm,
  subscribe,
} from "@jamwidgets/core";
import { afterEach, describe, expect, it, vi } from "vitest";

import type * as Parity from "../../jamwidgets-core/test/parity.js";

// The shared fixture lives in the monorepo. Standalone package mirrors
// don't have it, so they skip these suites.
const fixture = new URL("../../jamwidgets-core/test/parity.ts", import.meta.url);
const parity: typeof Parity | null = existsSync(fixture)
  ? await import(/* @vite-ignore */ fixture.pathname)
  : null;
const { CONFIG, expectRequest, PAGE, POLL, SERVER_ERROR, stubApi, WIDGET_CASES } =
  parity ?? ({ WIDGET_CASES: [] } as unknown as typeof Parity);
type Widget = Parity.Widget;

// Each Astro widget's script calls this core function; the parity cases drive
// it exactly as the script does.
const ASTRO: Record<Widget, { file: string; call: string; run: () => Promise<unknown> }> = {
  subscribe: { file: "Subscribe.astro", call: "subscribe", run: () => subscribe({ ...CONFIG, email: "a@example.com" }) },
  form: {
    file: "Form.astro",
    call: "submitForm",
    run: () => submitForm({ ...CONFIG, formSlug: "contact", data: { message: "Hi" } }),
  },
  waitlist: { file: "Waitlist.astro", call: "joinWaitlist", run: () => joinWaitlist({ ...CONFIG, email: "a@example.com" }) },
  feedback: {
    file: "Feedback.astro",
    call: "submitFeedback",
    run: () => submitFeedback({ ...CONFIG, type: "bug", content: "Broken" }),
  },
  comments: { file: "Comments.astro", call: "fetchComments", run: () => fetchComments({ ...CONFIG, pageId: PAGE }) },
  reactions: { file: "Reactions.astro", call: "fetchReactions", run: () => fetchReactions({ ...CONFIG, pageId: PAGE }) },
  views: { file: "Views.astro", call: "recordView", run: () => recordView({ ...CONFIG, pageId: PAGE }) },
  poll: {
    file: "poll-view.ts",
    call: "PollController",
    run: () => new PollController(CONFIG, POLL.slug, "Poll").fetch(),
  },
  announcements: { file: "Announcements.astro", call: "fetchAnnouncements", run: () => fetchAnnouncements(CONFIG) },
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe.skipIf(!parity)("Astro widget parity", () => {
  for (const testCase of WIDGET_CASES) {
    const astro = ASTRO[testCase.widget];

    it(`${testCase.widget}: the widget uses ${astro.call} from core`, async () => {
      const source = await readFile(new URL(`../src/${astro.file}`, import.meta.url), "utf8");
      expect(source).toMatch(new RegExp(`import \\{[^}]*\\b${astro.call}\\b[^}]*\\} from "@jamwidgets/core"`));
    });

    it(`${testCase.widget}: happy path`, async () => {
      const fetch = stubApi(testCase, true);
      await expect(astro.run()).resolves.toBeTruthy();
      expectRequest(fetch, testCase);
    });

    it(`${testCase.widget}: error path shows the server's message`, async () => {
      const fetch = stubApi(testCase, false);
      await expect(astro.run()).rejects.toThrow(SERVER_ERROR);
      expectRequest(fetch, testCase);
    });
  }
});
