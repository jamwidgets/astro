/**
 * Astro Content Loader for Jamwidgets Posts
 *
 * Use this loader to fetch posts from your Jamwidgets instance at build time.
 *
 * @example
 * // In src/content.config.ts
 * import { defineCollection } from 'astro:content';
 * import { jamwidgetsPostsLoader } from '@jamwidgets/astro/loader';
 *
 * const posts = defineCollection({
 *   loader: jamwidgetsPostsLoader({
 *     siteKey: import.meta.env.JAMWIDGETS_SITE_KEY,
 *   }),
 * });
 *
 * export const collections = { posts };
 */
import { fetchPosts as coreFetchPosts, fetchPost as coreFetchPost, type JamwidgetsPost, type SeriphPost, // deprecated alias
type FetchPostsOptions, type FetchPostOptions } from "@jamwidgets/core";
export type { JamwidgetsPost, SeriphPost, FetchPostsOptions, FetchPostOptions };
export { coreFetchPosts as fetchPosts, coreFetchPost as fetchPost };
export interface JamwidgetsPostsLoaderOptions {
    /** Your site key (required) */
    siteKey: string;
    /** Base URL of your Jamwidgets instance (default: 'https://jamwidgets.com') */
    endpoint?: string;
    /** Filter posts by tag */
    tag?: string;
    /** Maximum number of posts to fetch (default: 500) */
    limit?: number;
    /** How to handle errors: 'throw' (default), 'warn', or 'ignore' */
    onError?: "throw" | "warn" | "ignore";
}
/** @deprecated Use JamwidgetsPostsLoaderOptions instead */
export type SeriphPostsLoaderOptions = JamwidgetsPostsLoaderOptions;
interface LoaderContext {
    store: {
        set: (entry: {
            id: string;
            data: JamwidgetsPost;
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
 * Creates an Astro content loader that fetches posts from Jamwidgets.
 *
 * Posts are fetched at build time and cached by Astro.
 */
export declare function jamwidgetsPostsLoader(options: JamwidgetsPostsLoaderOptions): {
    name: string;
    load(context: LoaderContext): Promise<void>;
};
/** @deprecated Use jamwidgetsPostsLoader instead */
export declare const seriphPostsLoader: typeof jamwidgetsPostsLoader;
