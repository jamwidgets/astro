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
import { DEFAULT_ENDPOINT, API_PATH, getSiteKey, fetchPosts as coreFetchPosts, fetchPost as coreFetchPost, } from "@seriphxyz/core";
export { coreFetchPosts as fetchPosts, coreFetchPost as fetchPost };
/**
 * Creates an Astro content loader that fetches posts from Seriph.
 *
 * Posts are fetched at build time and cached by Astro.
 */
export function seriphPostsLoader(options) {
    const { endpoint = DEFAULT_ENDPOINT, tag, limit = 500, onError = "throw", } = options;
    const siteKey = getSiteKey({ siteKey: options.siteKey });
    const baseUrl = endpoint.replace(/\/+$/, "") + API_PATH;
    return {
        name: "seriph-posts-loader",
        async load(context) {
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
                    throw new Error(`Failed to fetch posts: ${response.status} ${response.statusText}`);
                }
                const data = await response.json();
                store.clear();
                for (const post of data.posts) {
                    store.set({
                        id: post.slug,
                        data: post,
                    });
                }
                logger.info(`Loaded ${data.posts.length} posts from Seriph`);
            }
            catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                if (onError === "throw") {
                    logger.error(`Error loading posts: ${message}`);
                    throw error;
                }
                else if (onError === "warn") {
                    logger.warn(`Error loading posts (continuing anyway): ${message}`);
                }
            }
        },
    };
}
