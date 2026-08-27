import { afterEach, describe, expect, it, vi } from "vitest";

import { jamwidgetsPostsLoader } from "../src/loader.js";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("jamwidgetsPostsLoader", () => {
  it("sends the configured site origin", async () => {
    const fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ posts: [], total: 0 }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetch);

    const loader = jamwidgetsPostsLoader({
      siteKey: "sk-acme",
      endpoint: "https://jamwidgets.example",
      origin: "https://acme.example",
    });

    await loader.load({
      store: { clear: vi.fn(), set: vi.fn() },
      logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn() },
    } as never);

    expect(fetch).toHaveBeenCalledWith(
      "https://jamwidgets.example/api/v1/posts?limit=500",
      expect.objectContaining({
        headers: expect.objectContaining({ Origin: "https://acme.example" }),
      }),
    );
  });
});
