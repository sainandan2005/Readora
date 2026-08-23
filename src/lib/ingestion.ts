import { connectDB } from "@/lib/db";
import { fetchMetadata, fetchBookContent } from "@/lib/gutenberg";
import { generateSlug } from "@/lib/utils";
import Book from "@/models/Book";
import Chapter from "@/models/Chapter";

/**
 * Clean Gutenberg HTML by removing headers, footers, and boilerplate.
 * Resolves relative image/link URLs to absolute Gutenberg URLs.
 */
export function cleanHTML(raw: string, gutenbergId: number): string {
  let html = raw;

  // Remove everything before the actual content start markers
  const startMarkers = [
    /\*\*\*\s*START OF TH(?:IS|E) PROJECT GUTENBERG EBOOK[\s\S]*?\*\*\*/i,
    /<!--\s*end\s+of\s+header\s*-->/i,
  ];
  for (const marker of startMarkers) {
    const match = html.match(marker);
    if (match && match.index !== undefined) {
      html = html.slice(match.index + match[0].length);
      break;
    }
  }

  // Remove everything after the content end markers
  const endMarkers = [
    /\*\*\*\s*END OF TH(?:IS|E) PROJECT GUTENBERG EBOOK[\s\S]*?\*\*\*/i,
    /<!--\s*start\s+of\s+footer\s*-->/i,
    /End of the Project Gutenberg/i,
    /End of Project Gutenberg/i,
  ];
  for (const marker of endMarkers) {
    const match = html.match(marker);
    if (match && match.index !== undefined) {
      html = html.slice(0, match.index);
      break;
    }
  }

  // Remove <head> block entirely
  html = html.replace(/<head[\s\S]*?<\/head>/gi, "");

  // Remove <style> and <script> tags
  html = html.replace(/<style[\s\S]*?<\/style>/gi, "");
  html = html.replace(/<script[\s\S]*?<\/script>/gi, "");

  // Remove HTML/body tags but keep content
  html = html.replace(/<\/?html[^>]*>/gi, "");
  html = html.replace(/<\/?body[^>]*>/gi, "");

  // Remove class and style attributes to keep HTML clean
  html = html.replace(/\s+(class|style|id)="[^"]*"/gi, "");

  // Normalize whitespace
  html = html.replace(/\n{3,}/g, "\n\n");

  // Resolve relative image URLs to absolute Gutenberg URLs
  const baseUrl = `https://www.gutenberg.org/cache/epub/${gutenbergId}/`;
  html = resolveRelativeUrls(html, baseUrl);

  return html.trim();
}

/**
 * Convert relative URLs in src and href attributes to absolute URLs.
 */
export function resolveRelativeUrls(html: string, baseUrl: string): string {
  return html.replace(
    /(<(?:img|image|source)[^>]*\s(?:src|srcset))="([^"]+)"/gi,
    (_match, prefix: string, url: string) => {
      if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
        return `${prefix}="${url}"`;
      }
      // Strip leading ../ or ./ and resolve against base
      const cleaned = url.replace(/^(?:\.\.\/)+/, "").replace(/^\.\//, "");
      return `${prefix}="${baseUrl}${cleaned}"`;
    }
  );
}

interface ChapterData {
  title: string;
  contentHTML: string;
}

type PartType = "chapter" | "continuation" | "frontmatter" | "unknown";

interface ClassifiedPart {
  title: string;
  contentHTML: string;
  type: PartType;
  titleFromHeading: boolean;
}

/** Sections that are boilerplate, never real reading chapters */
const FRONT_MATTER_TITLE =
  /^(contents|table of contents|list of (?:illustrations|plates|maps)|illustrations?|cover(?: page)?|title page|copyright(?: page)?|colophon|dedication|epigraph|about this ebook.*|transcription note.*)\.?$/i;

/** Titles that carry no meaning: page markers like "{ix}", bare roman/arabic numerals */
const JUNK_TITLE =
  /^[{[(]?([ivxlcdm]+|\d+)[})\].]*$/i;

/** Number words that books commonly use instead of digits/roman numerals */
const NUMBER_WORDS =
  "(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty(?:[-\\s](?:one|two|three|four|five|six|seven|eight|nine))?|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred)";

/** A recognizable numbered section marker, possibly buried in caption text */
const SECTION_MARKER = new RegExp(
  `\\b(chapter|stave|letter|part|book|act|scene|canto|volume|canticle)\\s+([ivxlcdm]+|\\d+|${NUMBER_WORDS})\\b`,
  "i"
);

/** Unnumbered sections that still belong to the story body */
const UNNUMBERED_BODY_TITLE =
  /^(prologue|epilogue|foreword|afterword|introduction)\b/i;

function classifyPart(part: string): ClassifiedPart {
  const trimmed = part.trim();
  const headingMatch = trimmed.match(/<h[23][^>]*>([\s\S]*?)<\/h[23]>/i);
  const titleFromHeading = !!headingMatch;
  const title = titleFromHeading
    ? headingMatch![1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim()
    : "";

  if (!titleFromHeading || !title) {
    return {
      title,
      contentHTML: trimmed,
      type: "unknown",
      titleFromHeading,
    };
  }

  if (FRONT_MATTER_TITLE.test(title)) {
    return { title, contentHTML: trimmed, type: "frontmatter", titleFromHeading };
  }

  if (JUNK_TITLE.test(title)) {
    return { title, contentHTML: trimmed, type: "continuation", titleFromHeading };
  }

  if (SECTION_MARKER.test(title) || UNNUMBERED_BODY_TITLE.test(title)) {
    return { title, contentHTML: trimmed, type: "chapter", titleFromHeading };
  }

  return { title, contentHTML: trimmed, type: "unknown", titleFromHeading };
}

/**
 * Strip illustration-caption prefixes from a chapter heading, keeping the
 * section marker onward: "He rode a black horse. CHAPTER III." -> "CHAPTER III."
 */
function normalizeChapterTitle(title: string): string {
  const collapsed = title.replace(/\s+/g, " ").trim();
  const markerMatch = collapsed.match(SECTION_MARKER);
  if (markerMatch && markerMatch.index !== undefined && markerMatch.index > 0) {
    // Only strip when meaningful text precedes the marker (a caption)
    return collapsed.slice(markerMatch.index).trim();
  }
  return collapsed;
}

/**
 * Split book HTML into chapters using a multi-strategy approach.
 */
export function splitChapters(html: string): ChapterData[] {
  // Strategy 1: Split on heading tags (h2, h3) with front-matter filtering
  const headingChapters = splitByHeadings(html);
  if (headingChapters.length > 1) {
    return headingChapters;
  }

  // Strategy 2: Split on "CHAPTER" text patterns
  const textChapters = splitByChapterText(html);
  if (textChapters.length > 1) {
    return textChapters;
  }

  // Strategy 3: Fallback — split by size (~50KB chunks)
  return splitBySize(html, 50_000);
}

function splitByHeadings(html: string): ChapterData[] {
  // Split on h2 or h3 tags
  const parts = html.split(/(?=<h[23][^>]*>)/i);

  // Drop fragments that are too small to be meaningful
  const classified: ClassifiedPart[] = [];
  for (const part of parts) {
    if (!part.trim() || part.trim().length < 100) continue;
    classified.push(classifyPart(part));
  }
  if (classified.length === 0) return [];

  // Everything before the first recognized body section is front matter
  let bodyStart = classified.findIndex((p) => p.type === "chapter");
  if (bodyStart === -1) {
    // No standard markers at all: treat titled sections as chapters instead
    bodyStart = classified.findIndex(
      (p) => p.titleFromHeading && p.type === "unknown"
    );
  }
  if (bodyStart === -1) bodyStart = 0;

  const chapters: ChapterData[] = [];
  for (let i = bodyStart; i < classified.length; i++) {
    const part = classified[i];
    const isBodySection =
      part.type === "chapter" ||
      (part.type === "unknown" && part.titleFromHeading);

    if (!isBodySection) {
      // Page-marker fragments and leftover boilerplate merge into previous chapter
      if (chapters.length > 0) {
        chapters[chapters.length - 1].contentHTML += "\n" + part.contentHTML;
      }
      continue;
    }

    if (chapters.length === 0 && part.contentHTML.trim().length < 200) {
      // Tiny first fragment (half-title pages) — still front matter
      continue;
    }

    chapters.push({
      title: part.titleFromHeading && part.title
        ? normalizeChapterTitle(part.title) || `Chapter ${chapters.length + 1}`
        : `Chapter ${chapters.length + 1}`,
      contentHTML: part.contentHTML,
    });
  }

  // Safety net: filtering went wrong and collapsed the book — revert to raw split
  if (chapters.length <= 1 && classified.length > 1) {
    return classified.map((p, i) => ({
      title: p.title || `Chapter ${i + 1}`,
      contentHTML: p.contentHTML,
    }));
  }

  return chapters;
}

function splitByChapterText(html: string): ChapterData[] {
  // Split on patterns like "CHAPTER I", "Chapter 1", "CHAPTER XII", etc.
  const pattern =
    /(?=<[^>]*>\s*(?:CHAPTER|Chapter)\s+[IVXLCDM\d]+[.\s:—-]*)/i;
  const parts = html.split(pattern);
  const chapters: ChapterData[] = [];

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed || trimmed.length < 100) continue;

    // Try to extract chapter title
    const titleMatch = trimmed.match(
      /<[^>]*>\s*((?:CHAPTER|Chapter)\s+[IVXLCDM\d]+[.\s:—-]*[^<]*)/i
    );
    const title = titleMatch
      ? titleMatch[1].trim()
      : `Chapter ${chapters.length + 1}`;

    chapters.push({ title, contentHTML: trimmed });
  }

  return chapters;
}

function splitBySize(html: string, maxSize: number): ChapterData[] {
  const chapters: ChapterData[] = [];

  // Split on paragraph boundaries
  const paragraphs = html.split(/(?=<p[^>]*>)/i);
  let currentChapter = "";
  let chapterIndex = 1;

  for (const paragraph of paragraphs) {
    if (currentChapter.length + paragraph.length > maxSize && currentChapter.length > 0) {
      chapters.push({
        title: `Part ${chapterIndex}`,
        contentHTML: currentChapter.trim(),
      });
      chapterIndex++;
      currentChapter = "";
    }
    currentChapter += paragraph;
  }

  if (currentChapter.trim()) {
    chapters.push({
      title: chapters.length === 0 ? "Full Text" : `Part ${chapterIndex}`,
      contentHTML: currentChapter.trim(),
    });
  }

  return chapters;
}

/**
 * Process a single book: fetch, clean, split, and store.
 */
export async function processBook(gutenbergId: number): Promise<void> {
  await connectDB();

  // Check if already processed
  const existing = await Book.findOne({ gutenbergId });
  if (existing && existing.status === "ready") {
    return;
  }

  // Create or update book record
  let book = existing;
  if (!book) {
    const metadata = await fetchMetadata(gutenbergId);
    let slug = generateSlug(metadata.title);

    // Ensure slug uniqueness
    const slugExists = await Book.findOne({ slug });
    if (slugExists) {
      slug = `${slug}-${gutenbergId}`;
    }

    book = await Book.create({
      gutenbergId,
      title: metadata.title,
      author: metadata.author,
      slug,
      language: metadata.language,
      categories: metadata.subjects,
      coverImageUrl: metadata.coverImageUrl,
      status: "processing",
    });
  } else {
    book.status = "processing";
    await book.save();
  }

  try {
    // Fetch metadata if we need the HTML URL
    const metadata = await fetchMetadata(gutenbergId);

    // Fetch content
    const rawHTML = await fetchBookContent(metadata.htmlUrl, gutenbergId);

    // Store raw content
    book.rawContent = rawHTML;

    // Clean and split
    const cleanedHTML = cleanHTML(rawHTML, gutenbergId);
    const chapters = splitChapters(cleanedHTML);

    if (chapters.length === 0) {
      throw new Error("No chapters could be extracted from the book content");
    }

    // Delete any existing chapters for this book
    await Chapter.deleteMany({ bookId: book._id });

    // Store chapters
    const chapterDocs = chapters.map((ch, i) => ({
      bookId: book!._id,
      chapterNumber: i + 1,
      title: ch.title,
      contentHTML: ch.contentHTML,
    }));
    await Chapter.insertMany(chapterDocs);

    // Update book status and release the raw HTML — it is only needed
    // during ingestion and would otherwise bloat storage
    book.chapterCount = chapters.length;
    book.status = "ready";
    book.coverImageUrl = metadata.coverImageUrl || book.coverImageUrl;
    book.rawContent = "";
    await book.save();
  } catch (error) {
    book.status = "failed";
    await book.save();
    throw error;
  }
}
