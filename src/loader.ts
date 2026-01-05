/**
 * Astro Content Loader for Seriph Posts
 *
 * Use this loader to fetch posts from your Seriph instance at build time.
 *
 * @example
 * // In src/content.config.ts
 * import { defineCollection } from 'astro:content';
 * import { seriphPostsLoader } from '@seriphxyz/astro/loader';
 *
 * const posts = defineCollection({
 *   loader: seriphPostsLoader({
 *     siteKey: import.meta.env.SERIPH_SITE_KEY,
 *   }),
 * });
 *
 * export const collections = { posts };
 */

import {
  DEFAULT_ENDPOINT,
  API_PATH,
  getSiteKey,
  fetchPosts as coreFetchPosts,
  fetchPost as coreFetchPost,
  type SeriphPost,
  type FetchPostsOptions,
  type FetchPostOptions,
} from "@seriphxyz/core";

// Re-export types and functions from core
export type { SeriphPost, FetchPostsOptions, FetchPostOptions };
export { coreFetchPosts as fetchPosts, coreFetchPost as fetchPost };

export interface SeriphPostsLoaderOptions {
  /** Your site key (required) */
  siteKey: string;
  /** Base URL of your Seriph instance (default: 'https://seriph.xyz') */
  endpoint?: string;
  /** Filter posts by tag */
  tag?: string;
  /** Maximum number of posts to fetch (default: 500) */
  limit?: number;
  /** How to handle errors: 'throw' (default), 'warn', or 'ignore' */
  onError?: "throw" | "warn" | "ignore";
}

interface LoaderContext {
  store: {
    set: (entry: { id: string; data: SeriphPost }) => void;
    clear: () => void;
  };
  logger: {
    info: (message: string) => void;
    warn: (message: string) => void;
    error: (message: string) => void;
  };
  generateDigest: (data: unknown) => string;
}

interface ApiResponse {
  posts: SeriphPost[];
  total: number;
}

/**
 * Creates an Astro content loader that fetches posts from Seriph.
 *
 * Posts are fetched at build time and cached by Astro.
 */
export function seriphPostsLoader(options: SeriphPostsLoaderOptions) {
  const {
    endpoint = DEFAULT_ENDPOINT,
    tag,
    limit = 500,
    onError = "throw",
  } = options;

  const siteKey = getSiteKey({ siteKey: options.siteKey });
  const baseUrl = endpoint.replace(/\/+$/, "") + API_PATH;

  return {
    name: "seriph-posts-loader",

    async load(context: LoaderContext) {
      const { store, logger } = context;

      try {
        const url = new URL(`${baseUrl}/posts`);
        url.searchParams.set("limit", String(limit));
        if (tag) {
          url.searchParams.set("tag", tag);
        }

        logger.info(`Fetching posts from ${url.toString()}`);

        const response = await fetch(url.toString(), {
          headers: {
            "X-Seriph-Key": siteKey,
          },
        });

        if (!response.ok) {
          throw new Error(
            `Failed to fetch posts: ${response.status} ${response.statusText}`,
          );
        }

        const data: ApiResponse = await response.json();

        store.clear();

        for (const post of data.posts) {
          store.set({
            id: post.slug,
            data: post,
          });
        }

        logger.info(`Loaded ${data.posts.length} posts from Seriph`);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);

        if (onError === "throw") {
          logger.error(`Error loading posts: ${message}`);
          throw error;
        } else if (onError === "warn") {
          logger.warn(`Error loading posts (continuing anyway): ${message}`);
        }
      }
    },
  };
}
