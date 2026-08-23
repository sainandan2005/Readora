# Readora

*A quiet home for public-domain books.*

Readora takes free ebooks from [Project Gutenberg](https://www.gutenberg.org), turns their messy 100-year-old HTML into clean chapters, and serves them in a distraction-free reader that remembers exactly where you stopped reading — down to the scroll position.

---

## The idea

Reading platforms are usually either ad-riddled storefronts or bare-bones text dumps. Readora sits in between: a personal library that feels *yours*. You pick up a classic, and the app quietly handles everything else — saving progress as you scroll, keeping your bookmarks, tracking your streak, and staying out of the way.

## What's inside

**Reading**
- Chapter-aware reader with adjustable font size and serif/sans toggle
- Table-of-contents drawer, keyboard shortcuts (`←` `→` `T` `B` `?`), and swipe navigation
- Progress saved automatically as you read (throttled saves + `sendBeacon` on tab close)
- Bookmarks pinned to any point in any chapter

**Your library**
- Full-text search across titles and authors
- A personal bookshelf for the books you care about
- Continue-reading shelf and reading stats (streaks, chapters, completion)

**Under the hood**
- An ingestion pipeline that fetches Gutenberg ebooks, strips two centuries of formatting boilerplate, detects chapter boundaries across wildly inconsistent ebook structures, and rewrites relative image URLs
- Admin dashboard for managing imports (resumable if interrupted), inspecting the catalog, and deleting books with full cascade cleanup
- Credentials auth with roles, brute-force throttling on both signup and login

## How ingestion works

Gutenberg ebooks have no standardized structure — chapter headings might be `<h2>` tags, page markers like `{ix}`, or buried under illustration captions. The pipeline in `src/lib/ingestion.ts` handles this with a multi-strategy splitter:

1. Strip Gutenberg license banners, headers, footers, styles
2. Split on heading tags, then classify each fragment: real chapter vs. front matter (`CONTENTS`, illustration lists) vs. junk (page markers)
3. Drop everything before the first true body section; merge stray fragments into their neighbors; sanitize titles polluted by captions ("He rode a black horse. **CHAPTER II.**" → "**CHAPTER II.**")
4. Fall back to text-pattern matching, then size-based splitting for structureless books

The result: *Pride and Prejudice* lands as exactly 61 clean chapters, *A Christmas Carol* as its 5 staves — regardless of how messy the source file was.

## Tech stack

| Layer      | Choice                                       |
| ---------- | -------------------------------------------- |
| Framework  | Next.js 15 (App Router, React 19)            |
| Database   | MongoDB Atlas via Mongoose                   |
| Auth       | Auth.js v5 (credentials, JWT sessions)       |
| Styling    | Tailwind CSS 4 with a custom design system   |
| Testing    | Jest                                         |

## Design notes

The UI follows a warm **"modern library"** aesthetic — cream paper tones, Fraunces serif display type, deep green and brass accents, soft shadows instead of hard borders — with full dark mode and system-preference detection.
