# @jamwidgets/astro

> **Note:** This repo is a read-only mirror. Source lives in a private monorepo.
> For issues/PRs, please open them here and we'll sync changes back.

Astro components and content loader for [Jamwidgets](https://jamwidgets.com) - widgets for static sites.

## Installation

```bash
npm install @jamwidgets/astro
```

## Setup

Add your Jamwidgets site key to your `.env`:

```
JAMWIDGETS_SITE_KEY=your_site_key_here
SITE_URL=https://example.com
```

## Content Loader (Posts)

Fetch posts from Jamwidgets at build time using Astro's content collections:

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

Set `origin` to an allowed origin for production builds. Jamwidgets rejects the
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

Render a post's Markdown body with Astro's content component:

```astro
---
import { getEntry, render } from "astro:content";
import { Image } from "astro:assets";
const post = await getEntry("posts", "hello-world");
if (!post) throw new Error("Post not found");
const { Content } = await render(post);
---

{post.data.coverImage && (
  <Image
    src={post.data.coverImage}
    inferSize
    layout="full-width"
    alt={post.data.title}
  />
)}
<article><Content /></article>
```

`post.data.content` is Markdown, not an HTML string. Do not render it with
`set:html`; use Astro's `render()` and `<Content />` as above.

For responsive uploaded images, authorize Jamwidgets' asset host in your Astro
config. Astro will then generate correctly sized image variants for Markdown
images. The hostname below is for Jamwidgets Cloud; self-hosted deployments use
the hostname configured by `ASSET_BASE_URL` (or fall back to
`<AWS_S3_BUCKET>.s3.<AWS_S3_REGION>.amazonaws.com`):

```js
import { defineConfig } from "astro/config";

export default defineConfig({
  image: {
    domains: ["assets.jamwidgets.com"],
    layout: "constrained",
    responsiveStyles: true,
  },
});
```

### Loader Options

```ts
jamwidgetsPostsLoader({
  siteKey: string;        // Required - your Jamwidgets site key
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
- `siteKey` (required) - Your Jamwidgets site key
- `formSlug` (required) - The form slug as configured in Jamwidgets
- `endpoint` - Base URL (default: `https://jamwidgets.com`)
- `theme` - `'inherit'` | `'light'` | `'dark'` | `'auto'` (default: `'inherit'`, matching the host page)
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
- `siteKey` (required) - Your Jamwidgets site key
- `pageId` (required) - Unique page identifier (e.g., URL path)
- `endpoint` - Base URL (default: `https://jamwidgets.com`)
- `theme` - `'inherit'` | `'light'` | `'dark'` | `'auto'` (default: `'inherit'`, matching the host page)
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
- `siteKey` (required) - Your Jamwidgets site key
- `pageId` (required) - Unique page identifier
- `reactions` - Array of reaction types (default: `['like']`)
- `icons` - Custom icons: `{ like: '👍', love: '❤️' }`
- `endpoint` - Base URL (default: `https://jamwidgets.com`)
- `theme` - `'inherit'` | `'light'` | `'dark'` | `'auto'` (default: `'inherit'`, matching the host page)
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
- `siteKey` (required) - Your Jamwidgets site key
- `endpoint` - Base URL (default: `https://jamwidgets.com`)
- `buttonText` - Submit button text (default: `'Subscribe'`)
- `placeholder` - Email input placeholder
- `label` - Accessible name for the email input (default: `'Email address'`)
- `successMessage` - Custom success message
- `theme` - `'inherit'` | `'light'` | `'dark'` | `'auto'` (default: `'inherit'`, matching the host page)
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

### Poll

A poll with live results. Results follow the poll's visibility setting (always, after voting, after the poll ends, or never):

```astro
---
import Poll from "@jamwidgets/astro/Poll";
---

<Poll siteKey={import.meta.env.JAMWIDGETS_SITE_KEY} slug="favorite-framework" />
```

**Props:**
- `siteKey` (required) - Your Jamwidgets site key
- `slug` (required) - The poll slug
- `endpoint` - Base URL (default: `https://jamwidgets.com`)
- `theme` - `'inherit'` | `'light'` | `'dark'` | `'auto'` (default: `'inherit'`, matching the host page)
- `class` - Additional CSS class

### Embed

Brings polls placed in a post with the editor to life. Render it after the post content:

```astro
---
import { render } from "astro:content";
import Embed from "@jamwidgets/astro/Embed";
const { Content } = await render(post);
---

<article><Content /></article>
<Embed siteKey={import.meta.env.JAMWIDGETS_SITE_KEY} />
```

It hydrates every `<div data-jamwidgets-embed="poll" data-slug="...">` on the page with the same poll as `Poll`.

**Props:**
- `siteKey` (required) - Your Jamwidgets site key
- `endpoint` - Base URL (default: `https://jamwidgets.com`)
- `theme` - `'inherit'` | `'light'` | `'dark'` | `'auto'` (default: `'inherit'`, matching the host page)

### Views

Records a page view and shows the count:

```astro
---
import Views from "@jamwidgets/astro/Views";
---

<Views siteKey={import.meta.env.JAMWIDGETS_SITE_KEY} pageId={Astro.url.pathname} showUnique />
```

**Props:**
- `siteKey` (required) - Your Jamwidgets site key
- `pageId` (required) - Unique page identifier
- `showUnique` - Also show unique visitors (default: `false`)
- `endpoint` - Base URL (default: `https://jamwidgets.com`)
- `theme` - `'inherit'` | `'light'` | `'dark'` | `'auto'` (default: `'inherit'`, matching the host page)
- `class` - Additional CSS class

**Events:**
- `jamwidgets:view-recorded` - View recorded (detail contains the counts)

### Analytics

Cookieless pageview analytics. Put it once in your layout; it renders nothing:

```astro
---
import Analytics from "@jamwidgets/astro/Analytics";
---

<Analytics siteKey={import.meta.env.JAMWIDGETS_SITE_KEY} />
```

**Props:**
- `siteKey` - Your Jamwidgets site key (falls back to the `jamwidgets-site-key` meta tag)
- `endpoint` - Base URL (default: `https://jamwidgets.com`)

### Announcements

Site-wide banners managed in the dashboard. Visitors can dismiss the ones marked dismissible:

```astro
---
import Announcements from "@jamwidgets/astro/Announcements";
---

<Announcements siteKey={import.meta.env.JAMWIDGETS_SITE_KEY} />
```

**Props:**
- `siteKey` (required) - Your Jamwidgets site key
- `endpoint` - Base URL (default: `https://jamwidgets.com`)
- `theme` - `'inherit'` | `'light'` | `'dark'` | `'auto'` (default: `'inherit'`, matching the host page)
- `class` - Additional CSS class

**Events:**
- `jamwidgets:announcement-dismissed` - Announcement dismissed

### Feedback

A feedback box with a type selector (feature, bug, other):

```astro
---
import Feedback from "@jamwidgets/astro/Feedback";
---

<Feedback siteKey={import.meta.env.JAMWIDGETS_SITE_KEY} />
```

**Props:**
- `siteKey` (required) - Your Jamwidgets site key
- `placeholder` - Input placeholder (default: `'Share your feedback...'`)
- `showTypeSelector` - Show the type selector (default: `true`)
- `endpoint` - Base URL (default: `https://jamwidgets.com`)
- `theme` - `'inherit'` | `'light'` | `'dark'` | `'auto'` (default: `'inherit'`, matching the host page)
- `class` - Additional CSS class

**Events:**
- `jamwidgets:feedback-submitted` - Feedback sent

### Waitlist

An email signup for a waitlist, optionally showing the visitor's position:

```astro
---
import Waitlist from "@jamwidgets/astro/Waitlist";
---

<Waitlist siteKey={import.meta.env.JAMWIDGETS_SITE_KEY} buttonText="Get early access" />
```

**Props:**
- `siteKey` (required) - Your Jamwidgets site key
- `placeholder` - Email input placeholder (default: `'Enter your email'`)
- `label` - Accessible name for the email input (default: `'Email address'`)
- `buttonText` - Submit button text (default: `'Join Waitlist'`)
- `successMessage` - Success message (default: `"You're on the list!"`)
- `endpoint` - Base URL (default: `https://jamwidgets.com`)
- `theme` - `'inherit'` | `'light'` | `'dark'` | `'auto'` (default: `'inherit'`, matching the host page)
- `class` - Additional CSS class

**Events:**
- `jamwidgets:waitlist-joined` - Visitor joined (detail contains the email)

### Gallery, GalleryIndex and RandomPhoto

Responsive photo galleries uploaded in the dashboard. The gallery code loads only on pages that use one of these three:

```astro
---
import Gallery from "@jamwidgets/astro/Gallery";
import GalleryIndex from "@jamwidgets/astro/GalleryIndex";
import RandomPhoto from "@jamwidgets/astro/RandomPhoto";
---

<GalleryIndex siteKey={import.meta.env.JAMWIDGETS_SITE_KEY} deepLink />
<Gallery siteKey={import.meta.env.JAMWIDGETS_SITE_KEY} slug="field-notes" tag="portraits" />
<RandomPhoto siteKey={import.meta.env.JAMWIDGETS_SITE_KEY} slug="field-notes" />
```

**Props:**
- `siteKey` (required) - Your Jamwidgets site key
- `slug` (required for `Gallery` and `RandomPhoto`) - The gallery slug
- `tag` - Only show photos with this tag (`Gallery`, `RandomPhoto`)
- `seed` - Pick the same random photo for the same seed (`RandomPhoto`)
- `deepLink` - Keep the open gallery in the URL (`GalleryIndex`)
- `endpoint` - Base URL (default: `https://jamwidgets.com`)

### PoweredBy

The "Powered by Jamwidgets" link, shown only when the site's plan requires it:

```astro
---
import PoweredBy from "@jamwidgets/astro/PoweredBy";
---

<PoweredBy siteKey={import.meta.env.JAMWIDGETS_SITE_KEY} />
```

**Props:**
- `siteKey` (required) - Your Jamwidgets site key
- `endpoint` - Base URL (default: `https://jamwidgets.com`)

### Missing content

`Poll`, `Embed` polls, `Gallery` and `RandomPhoto` render nothing when their slug doesn't exist or isn't published, and log a `console.warn` naming it. Create or publish the content in the Jamwidgets dashboard and it appears on the next page load. Other failures still show a short error.

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

### Cascade layers and Tailwind

Widget styles live in a `jamwidgets` cascade layer. Every component declares the order `@layer theme, base, components, utilities, jamwidgets;` before its rules, so the widgets rank above Tailwind v4's layers (including Preflight in `base`) whichever stylesheet the browser sees first. Your unlayered CSS still overrides the widgets. If your site declares its own layer order, keep `jamwidgets` after `base` or Preflight will reset the widgets' padding, borders and buttons.

## License

MIT
