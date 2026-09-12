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

  it("renders post Markdown through Astro's content pipeline", async () => {
    const post = {
      id: "42",
      title: "Hello",
      slug: "hello",
      content: "Hello **world**\n\n*Powered by [Jamwidgets](https://jamwidgets.com/)*",
      tags: [],
      publishedAt: "2026-09-12T00:00:00Z",
    };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ posts: [post], total: 1 }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );
    const set = vi.fn();
    const rendered = { html: "<p>Hello <strong>world</strong></p>" };
    const renderMarkdown = vi.fn().mockResolvedValue(rendered);

    const loader = jamwidgetsPostsLoader({
      siteKey: "sk-acme",
      endpoint: "https://jamwidgets.example",
    });

    await loader.load({
      store: { clear: vi.fn(), set },
      logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn() },
      renderMarkdown,
    } as never);

    expect(renderMarkdown).toHaveBeenCalledWith(post.content);
    expect(set).toHaveBeenCalledWith({
      id: post.slug,
      data: post,
      body: post.content,
      rendered,
    });
  });

  it("keeps the previous collection when Markdown rendering fails", async () => {
    const post = {
      id: "42",
      title: "Broken",
      slug: "broken",
      content: "broken",
      tags: [],
      publishedAt: "2026-09-12T00:00:00Z",
    };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ posts: [post], total: 1 }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );
    const clear = vi.fn();
    const set = vi.fn();
    const warn = vi.fn();
    const loader = jamwidgetsPostsLoader({
      siteKey: "sk-acme",
      endpoint: "https://jamwidgets.example",
      onError: "warn",
    });

    await loader.load({
      store: { clear, set },
      logger: { info: vi.fn(), error: vi.fn(), warn },
      renderMarkdown: vi.fn().mockRejectedValue(new Error("Invalid Markdown")),
    } as never);

    expect(clear).not.toHaveBeenCalled();
    expect(set).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledWith(
      "Error loading posts (continuing anyway): Invalid Markdown",
    );
  });
});
