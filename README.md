# @jamwidgets/astro

> **Note:** This repo is a read-only mirror. Source lives in a private monorepo.
> For issues/PRs, please open them here and we'll sync changes back.

Astro components and content loader for [JamWidgets](https://jamwidgets.com) - widgets for static sites.

## Installation

```bash
npm install @jamwidgets/astro
```

## Setup

Add your JamWidgets site key to your `.env`:

```
JAMWIDGETS_SITE_KEY=your_site_key_here
SITE_URL=https://example.com
```

## Content Loader (Posts)

Fetch posts from JamWidgets at build time using Astro's content collections:

```ts
// src/content.config.ts
import { defineCollection } from "astro:content";
import { jamwidgetsPostsLoader } from "@jamwidgets/astro/loader";

const posts = defineCollection({
  loader: jamwidgetsPostsLoader({
    siteKey: import.meta.env.JAMWIDGETS_SITE_KEY,
    origin: import.meta.env.SITE_URL,
  }),
});

export const collections = { posts };
```

Set `origin` to an allowed origin for production builds. JamWidgets rejects the
request when the site restricts origins and the loader omits it.

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
jamwidgetsPostsLoader({
  siteKey: string;        // Required - your JamWidgets site key
  endpoint?: string;      // Default: 'https://jamwidgets.com'
  origin?: string;        // Site URL used for allowed-origin validation
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
import Form from "@jamwidgets/astro/Form";
---

<Form siteKey={import.meta.env.JAMWIDGETS_SITE_KEY} formSlug="contact">
  <input name="name" placeholder="Name" required />
  <input name="email" type="email" placeholder="Email" required />
  <textarea name="message" placeholder="Message" required></textarea>
  <button type="submit">Send</button>
</Form>
```

**Props:**
- `siteKey` (required) - Your JamWidgets site key
- `formSlug` (required) - The form slug as configured in JamWidgets
- `endpoint` - Base URL (default: `https://jamwidgets.com`)
- `theme` - `'light'` | `'dark'` | `'auto'` (default: `'light'`)
- `class` - Additional CSS class

**Events:**
- `jamwidgets:loading` - Form submission started
- `jamwidgets:success` - Submission successful (detail contains response)
- `jamwidgets:error` - Submission failed (detail contains error)

### Comments

Threaded comments with a submission form:

```astro
---
import Comments from "@jamwidgets/astro/Comments";
---

<Comments
  siteKey={import.meta.env.JAMWIDGETS_SITE_KEY}
  pageId={Astro.url.pathname}
/>
```

**Props:**
- `siteKey` (required) - Your JamWidgets site key
- `pageId` (required) - Unique page identifier (e.g., URL path)
- `endpoint` - Base URL (default: `https://jamwidgets.com`)
- `theme` - `'light'` | `'dark'` | `'auto'` (default: `'light'`)
- `class` - Additional CSS class

**Events:**
- `jamwidgets:comment-posted` - Comment submitted (detail contains comment)

### Reactions

Reaction buttons (like, love, clap, etc.):

```astro
---
import Reactions from "@jamwidgets/astro/Reactions";
---

<Reactions
  siteKey={import.meta.env.JAMWIDGETS_SITE_KEY}
  pageId={Astro.url.pathname}
  reactions={["like", "love", "clap"]}
/>
```

**Props:**
- `siteKey` (required) - Your JamWidgets site key
- `pageId` (required) - Unique page identifier
- `reactions` - Array of reaction types (default: `['like']`)
- `icons` - Custom icons: `{ like: '👍', love: '❤️' }`
- `endpoint` - Base URL (default: `https://jamwidgets.com`)
- `theme` - `'light'` | `'dark'` | `'auto'` (default: `'light'`)
- `class` - Additional CSS class

**Built-in icons:** `like`, `love`, `clap`, `fire`, `think`, `sad`, `laugh`

**Events:**
- `jamwidgets:reaction-added` - Reaction added
- `jamwidgets:reaction-removed` - Reaction removed

### Subscribe

Email subscription form with double opt-in:

```astro
---
import Subscribe from "@jamwidgets/astro/Subscribe";
---

<Subscribe
  siteKey={import.meta.env.JAMWIDGETS_SITE_KEY}
  buttonText="Subscribe"
  placeholder="your@email.com"
/>
```

**Props:**
- `siteKey` (required) - Your JamWidgets site key
- `endpoint` - Base URL (default: `https://jamwidgets.com`)
- `buttonText` - Submit button text (default: `'Subscribe'`)
- `placeholder` - Email input placeholder
- `successMessage` - Custom success message
- `theme` - `'light'` | `'dark'` | `'auto'` (default: `'light'`)
- `class` - Additional CSS class

**Events:**
- `jamwidgets:subscribed` - Subscription successful

### SubscribeForm

A more flexible subscription form that wraps your own markup:

```astro
---
import SubscribeForm from "@jamwidgets/astro/SubscribeForm";
---

<SubscribeForm siteKey={import.meta.env.JAMWIDGETS_SITE_KEY}>
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
} from "@jamwidgets/astro";

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

Components inherit their font and text color from the surrounding page by default, while interactive controls use the browser's accent colors. Use a preset when the widget sits outside your site's normal color context:

```astro
<Comments theme="auto" ... />
```

Set semantic CSS custom properties on a wrapper or the widget itself to match your site. The same tokens work across every styled component:

```css
.article-widgets {
  --jamwidgets-color-text: var(--color-ink);
  --jamwidgets-color-muted: var(--color-ink-muted);
  --jamwidgets-color-surface: var(--color-paper);
  --jamwidgets-color-border: var(--color-rule);
  --jamwidgets-color-accent: var(--color-link);
  --jamwidgets-color-accent-hover: var(--color-link-hover);
  --jamwidgets-color-on-accent: white;
  --jamwidgets-focus-ring-color: color-mix(in srgb, var(--color-link) 28%, transparent);
}
```

Status colors can be customized with `--jamwidgets-color-success`, `--jamwidgets-color-error`, and `--jamwidgets-color-notice`. Components adapt to their container width, so subscribe, waitlist, comments, and feedback controls stack when embedded in a narrow column.

## License

MIT
