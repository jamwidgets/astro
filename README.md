# @seriphxyz/astro

> **Note:** This repo is a read-only mirror. Source lives in a private monorepo.
> For issues/PRs, please open them here and we'll sync changes back.

Astro components and content loader for [Seriph](https://seriph.xyz) - widgets for static sites.

## Installation

```bash
npm install @seriphxyz/astro
```

## Setup

Add your Seriph site key to your `.env`:

```
SERIPH_SITE_KEY=your_site_key_here
```

## Content Loader (Posts)

Fetch posts from Seriph at build time using Astro's content collections:

```ts
// src/content.config.ts
import { defineCollection } from "astro:content";
import { seriphPostsLoader } from "@seriphxyz/astro/loader";

const posts = defineCollection({
  loader: seriphPostsLoader({
    siteKey: import.meta.env.SERIPH_SITE_KEY,
  }),
});

export const collections = { posts };
```

Then use in your pages:

```astro
---
import { getCollection } from "astro:content";
const posts = await getCollection("posts");
---

{posts.map((post) => (
  <article>
    <h2>{post.data.title}</h2>
    <p>{post.data.excerpt}</p>
  </article>
))}
```

### Loader Options

```ts
seriphPostsLoader({
  siteKey: string;        // Required - your Seriph site key
  endpoint?: string;      // Default: 'https://seriph.xyz'
  tag?: string;           // Filter posts by tag
  limit?: number;         // Max posts to fetch (default: 500)
  onError?: 'throw' | 'warn' | 'ignore';  // Error handling
})
```

## Components

### Form

A wrapper component for contact forms with built-in spam protection:

```astro
---
import Form from "@seriphxyz/astro/Form";
---

<Form siteKey={import.meta.env.SERIPH_SITE_KEY} formSlug="contact">
  <input name="name" placeholder="Name" required />
  <input name="email" type="email" placeholder="Email" required />
  <textarea name="message" placeholder="Message" required></textarea>
  <button type="submit">Send</button>
</Form>
```

**Props:**
- `siteKey` (required) - Your Seriph site key
- `formSlug` (required) - The form slug as configured in Seriph
- `endpoint` - Base URL (default: `https://seriph.xyz`)
- `theme` - `'light'` | `'dark'` | `'auto'` (default: `'light'`)
- `class` - Additional CSS class

**Events:**
- `seriph:loading` - Form submission started
- `seriph:success` - Submission successful (detail contains response)
- `seriph:error` - Submission failed (detail contains error)

### Comments

Threaded comments with a submission form:

```astro
---
import Comments from "@seriphxyz/astro/Comments";
---

<Comments
  siteKey={import.meta.env.SERIPH_SITE_KEY}
  pageId={Astro.url.pathname}
/>
```

**Props:**
- `siteKey` (required) - Your Seriph site key
- `pageId` (required) - Unique page identifier (e.g., URL path)
- `endpoint` - Base URL (default: `https://seriph.xyz`)
- `theme` - `'light'` | `'dark'` | `'auto'` (default: `'light'`)
- `class` - Additional CSS class

**Events:**
- `seriph:comment-posted` - Comment submitted (detail contains comment)

### Reactions

Reaction buttons (like, love, clap, etc.):

```astro
---
import Reactions from "@seriphxyz/astro/Reactions";
---

<Reactions
  siteKey={import.meta.env.SERIPH_SITE_KEY}
  pageId={Astro.url.pathname}
  reactions={["like", "love", "clap"]}
/>
```

**Props:**
- `siteKey` (required) - Your Seriph site key
- `pageId` (required) - Unique page identifier
- `reactions` - Array of reaction types (default: `['like']`)
- `icons` - Custom icons: `{ like: '👍', love: '❤️' }`
- `endpoint` - Base URL (default: `https://seriph.xyz`)
- `theme` - `'light'` | `'dark'` | `'auto'` (default: `'light'`)
- `class` - Additional CSS class

**Built-in icons:** `like`, `love`, `clap`, `fire`, `think`, `sad`, `laugh`

**Events:**
- `seriph:reaction-added` - Reaction added
- `seriph:reaction-removed` - Reaction removed

### Subscribe

Email subscription form with double opt-in:

```astro
---
import Subscribe from "@seriphxyz/astro/Subscribe";
---

<Subscribe
  siteKey={import.meta.env.SERIPH_SITE_KEY}
  buttonText="Subscribe"
  placeholder="your@email.com"
/>
```

**Props:**
- `siteKey` (required) - Your Seriph site key
- `endpoint` - Base URL (default: `https://seriph.xyz`)
- `buttonText` - Submit button text (default: `'Subscribe'`)
- `placeholder` - Email input placeholder
- `successMessage` - Custom success message
- `theme` - `'light'` | `'dark'` | `'auto'` (default: `'light'`)
- `class` - Additional CSS class

**Events:**
- `seriph:subscribed` - Subscription successful

### SubscribeForm

A more flexible subscription form that wraps your own markup:

```astro
---
import SubscribeForm from "@seriphxyz/astro/SubscribeForm";
---

<SubscribeForm siteKey={import.meta.env.SERIPH_SITE_KEY}>
  <input name="email" type="email" placeholder="Email" required />
  <button type="submit">Join newsletter</button>
</SubscribeForm>
```

## JavaScript API

For advanced use cases, use the JavaScript API directly:

```ts
import {
  submitForm,
  fetchComments,
  postComment,
  fetchReactions,
  addReaction,
  fetchPosts,
  fetchPost,
} from "@seriphxyz/astro";

// Submit a form
await submitForm({
  siteKey: "your_key",
  formSlug: "contact",
  data: { name: "John", email: "john@example.com", message: "Hello!" },
});

// Fetch comments
const comments = await fetchComments({
  siteKey: "your_key",
  pageId: "/blog/my-post",
});

// Add a reaction
await addReaction({
  siteKey: "your_key",
  pageId: "/blog/my-post",
  reactionType: "like",
});
```

## Styling

Components use CSS custom properties for theming. Override them to match your site:

```css
.seriph-comments {
  --seriph-border-color: #e5e7eb;
  --seriph-bg-color: #f9fafb;
  --seriph-text-color: inherit;
  --seriph-button-bg: #3b82f6;
  /* ... see component source for all variables */
}
```

## License

MIT
