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
import { fetchPosts as coreFetchPosts, fetchPost as coreFetchPost, type SeriphPost, type FetchPostsOptions, type FetchPostOptions } from "@seriphxyz/core";
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
        set: (entry: {
            id: string;
            data: SeriphPost;
        }) => void;
        clear: () => void;
    };
    logger: {
        info: (message: string) => void;
        warn: (message: string) => void;
        error: (message: string) => void;
    };
    generateDigest: (data: unknown) => string;
}
/**
 * Creates an Astro content loader that fetches posts from Seriph.
 *
 * Posts are fetched at build time and cached by Astro.
 */
export declare function seriphPostsLoader(options: SeriphPostsLoaderOptions): {
    name: string;
    load(context: LoaderContext): Promise<void>;
};
