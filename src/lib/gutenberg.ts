import { logger } from "@/lib/logger";

interface GutenbergMetadata {
  gutenbergId: number;
  title: string;
  author: string;
  language: string;
  subjects: string[];
  coverImageUrl: string;
  htmlUrl: string;
}

interface GutendexResponse {
  id: number;
  title: string;
  authors: { name: string; birth_year: number | null; death_year: number | null }[];
  languages: string[];
  subjects: string[];
  formats: Record<string, string>;
}

export async function fetchMetadata(gutenbergId: number): Promise<GutenbergMetadata> {
  const res = await fetch(`https://gutendex.com/books/${gutenbergId}/`);
  if (!res.ok) {
    throw new Error(`Failed to fetch metadata for Gutenberg ID ${gutenbergId}: ${res.status}`);
  }

  const data: GutendexResponse = await res.json();

  const author = data.authors.length > 0 ? data.authors[0].name : "Unknown Author";

  // Find HTML URL from formats
  const htmlUrl =
    data.formats["text/html; charset=utf-8"] ||
    data.formats["text/html"] ||
    `https://www.gutenberg.org/cache/epub/${gutenbergId}/pg${gutenbergId}-images.html`;

  // Find cover image
  const coverImageUrl =
    data.formats["image/jpeg"] || "";

  return {
    gutenbergId: data.id,
    title: data.title,
    author,
    language: data.languages[0] || "en",
    subjects: data.subjects,
    coverImageUrl,
    htmlUrl,
  };
}

export async function fetchBookContent(
  htmlUrl: string,
  gutenbergId: number
): Promise<string> {
  const urls = [
    htmlUrl,
    `https://www.gutenberg.org/cache/epub/${gutenbergId}/pg${gutenbergId}-images.html`,
    `https://www.gutenberg.org/cache/epub/${gutenbergId}/pg${gutenbergId}.html`,
    `https://www.gutenberg.org/files/${gutenbergId}/${gutenbergId}-h/${gutenbergId}-h.htm`,
  ];

  // Deduplicate URLs
  const uniqueUrls = [...new Set(urls)];

  for (const url of uniqueUrls) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const res = await fetch(url, {
          headers: {
            "User-Agent": "Readora/1.0 (reading platform; contact: admin@readora.app)",
          },
        });

        if (res.ok) {
          return await res.text();
        }

        if (res.status === 404) break; // Try next URL
        // Rate limited or server error — wait and retry
        await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
      } catch (err) {
        logger.warn(`Fetch attempt failed for ${url}.`, { error: String(err) });
        if (attempt === 2) continue; // Try next URL
        await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
      }
    }
  }

  throw new Error(`Failed to fetch content for Gutenberg ID ${gutenbergId} from any source`);
}
