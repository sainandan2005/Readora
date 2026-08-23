import { cleanHTML, resolveRelativeUrls, splitChapters } from "@/lib/ingestion";

describe("resolveRelativeUrls", () => {
  const baseUrl = "https://www.gutenberg.org/cache/epub/1342/";

  it("should convert relative image URLs to absolute", () => {
    const html = '<img src="images/cover.jpg">';
    const result = resolveRelativeUrls(html, baseUrl);
    expect(result).toBe(
      `<img src="${baseUrl}images/cover.jpg">`
    );
  });

  it("should leave absolute URLs unchanged", () => {
    const html = '<img src="https://example.com/img.png">';
    const result = resolveRelativeUrls(html, baseUrl);
    expect(result).toBe(html);
  });

  it("should leave data URLs unchanged", () => {
    const html = '<img src="data:image/png;base64,abc123">';
    const result = resolveRelativeUrls(html, baseUrl);
    expect(result).toBe(html);
  });

  it("should strip ../ prefixes", () => {
    const html = '<img src="../../images/fig1.png">';
    const result = resolveRelativeUrls(html, baseUrl);
    expect(result).toBe(
      `<img src="${baseUrl}images/fig1.png">`
    );
  });

  it("should strip ./ prefixes", () => {
    const html = '<img src="./images/fig1.png">';
    const result = resolveRelativeUrls(html, baseUrl);
    expect(result).toBe(
      `<img src="${baseUrl}images/fig1.png">`
    );
  });

  it("should handle source and image tags", () => {
    const html = '<source src="audio.mp3"><image src="pic.svg">';
    const result = resolveRelativeUrls(html, baseUrl);
    expect(result).toContain(`${baseUrl}audio.mp3`);
    expect(result).toContain(`${baseUrl}pic.svg`);
  });
});

describe("cleanHTML", () => {
  it("should strip Gutenberg start markers", () => {
    const raw =
      "Some header text *** START OF THE PROJECT GUTENBERG EBOOK TEST ***<p>Actual content here with enough text to pass the length check.</p>";
    const result = cleanHTML(raw, 1234);
    expect(result).not.toContain("START OF THE PROJECT GUTENBERG");
    expect(result).toContain("Actual content");
  });

  it("should strip Gutenberg end markers", () => {
    const raw =
      "<p>Content text</p> *** END OF THE PROJECT GUTENBERG EBOOK TEST *** License text";
    const result = cleanHTML(raw, 1234);
    expect(result).not.toContain("END OF THE PROJECT GUTENBERG");
    expect(result).not.toContain("License text");
  });

  it("should remove head, style, and script tags", () => {
    const raw = "<head><title>Test</title></head><style>.foo{}</style><script>alert(1)</script><p>Content</p>";
    const result = cleanHTML(raw, 1234);
    expect(result).not.toContain("<head>");
    expect(result).not.toContain("<style>");
    expect(result).not.toContain("<script>");
    expect(result).toContain("<p>Content</p>");
  });

  it("should remove class, style, and id attributes", () => {
    const raw = '<p class="test" style="color:red" id="para1">Hello</p>';
    const result = cleanHTML(raw, 1234);
    expect(result).not.toContain('class=');
    expect(result).not.toContain('style=');
    expect(result).not.toContain('id=');
    expect(result).toContain("<p>Hello</p>");
  });

  it("should strip html and body tags", () => {
    const raw = '<html lang="en"><body class="x"><p>Text</p></body></html>';
    const result = cleanHTML(raw, 1234);
    expect(result).not.toContain("<html");
    expect(result).not.toContain("<body");
    expect(result).toContain("<p>Text</p>");
  });
});

describe("splitChapters", () => {
  it("should split by headings when h2/h3 are present", () => {
    const html = `
      <h2>Chapter 1: Introduction</h2>
      <p>${"Lorem ipsum ".repeat(20)}</p>
      <h2>Chapter 2: The Journey</h2>
      <p>${"Dolor sit amet ".repeat(20)}</p>
    `;
    const chapters = splitChapters(html);
    expect(chapters.length).toBe(2);
    expect(chapters[0].title).toContain("Introduction");
    expect(chapters[1].title).toContain("Journey");
  });

  it("should split by CHAPTER text patterns", () => {
    const html = `
      <p>CHAPTER I</p>
      <p>${"Start of the novel. ".repeat(20)}</p>
      <p>CHAPTER II</p>
      <p>${"Middle of the novel. ".repeat(20)}</p>
    `;
    const chapters = splitChapters(html);
    expect(chapters.length).toBe(2);
  });

  it("should fall back to size-based splitting for long content without chapters", () => {
    const longParagraph = `<p>${"A".repeat(60_000)}</p><p>${"B".repeat(60_000)}</p>`;
    const chapters = splitChapters(longParagraph);
    expect(chapters.length).toBeGreaterThanOrEqual(2);
  });

  it("should return single chapter for short content without markers", () => {
    const html = `<p>${"Short content. ".repeat(20)}</p>`;
    const chapters = splitChapters(html);
    expect(chapters.length).toBe(1);
    expect(chapters[0].title).toBe("Full Text");
  });

  it("should skip contents pages and leading front matter (Alice-style)", () => {
    const html = `
      <p>Title page block with enough text to survive length filters here.</p>
      <h2>Contents</h2>
      <p>${"Chapter One ............ 3 Chapter Two ............ 14 ".repeat(5)}</p>
      <h2>CHAPTER I. Down the Rabbit-Hole</h2>
      <p>${"Rabbit hole story. ".repeat(30)}</p>
      <h2>CHAPTER II. The Pool of Tears</h2>
      <p>${"Pool of tears story. ".repeat(30)}</p>
    `;
    const chapters = splitChapters(html);
    expect(chapters.length).toBe(2);
    expect(chapters[0].title).toBe("CHAPTER I. Down the Rabbit-Hole");
    expect(chapters[1].title).toBe("CHAPTER II. The Pool of Tears");
    expect(JSON.stringify(chapters)).not.toContain("Contents");
    expect(JSON.stringify(chapters)).not.toContain("Title page");
  });

  it("should strip illustration captions from chapter titles (P&P-style)", () => {
    const html = `
      <h2>{ix}</h2>
      <p>${"Front matter with illustrations list. ".repeat(15)}</p>
      <h2>I hope Mr. Bingley will like it. CHAPTER II.</h2>
      <p>${"Story two. ".repeat(30)}</p>
      <h2>{xxv}</h2>
      <p>${"Another stray caption fragment. ".repeat(15)}</p>
      <h2>CHAPTER III.</h2>
      <p>${"Story three. ".repeat(30)}</p>
    `;
    const chapters = splitChapters(html);
    expect(chapters.map((c) => c.title)).toEqual(["CHAPTER II.", "CHAPTER III."]);
    // The {xxv} fragment should be merged into the preceding chapter
    expect(chapters[0].contentHTML).toContain("stray caption");
  });

  it("should skip preface/contents/illustrations front matter (Carol-style)", () => {
    const html = `
      <p>A half-title page block that passes the length threshold easily.</p>
      <h2>PREFACE</h2>
      <p>${"Preface words. ".repeat(20)}</p>
      <h2>CONTENTS</h2>
      <p>${"Stave One .... 1 Stave Two .... 25 ".repeat(6)}</p>
      <h2>ILLUSTRATIONS</h2>
      <p>${"List of plates. ".repeat(15)}</p>
      <h2>STAVE ONE. MARLEY'S GHOST.</h2>
      <p>${"Marley was dead. ".repeat(30)}</p>
      <h2>STAVE TWO. THE FIRST OF THE THREE SPIRITS.</h2>
      <p>${"Scrooge woke up. ".repeat(30)}</p>
    `;
    const chapters = splitChapters(html);
    expect(chapters.length).toBe(2);
    expect(chapters[0].title).toBe("STAVE ONE. MARLEY'S GHOST.");
    expect(chapters[1].title).toBe("STAVE TWO. THE FIRST OF THE THREE SPIRITS.");
  });

  it("should use titled sections as chapters when no numbered markers exist", () => {
    const html = `
      <h2>The Ship</h2>
      <p>${"Ocean voyage text. ".repeat(40)}</p>
      <h2>The Storm</h2>
      <p>${"Storm and thunder text. ".repeat(40)}</p>
    `;
    const chapters = splitChapters(html);
    expect(chapters.map((c) => c.title)).toEqual(["The Ship", "The Storm"]);
  });

  it("should treat letters as chapters but skip the table of contents (Frankenstein-style)", () => {
    const html = `
      <h2>CONTENTS</h2>
      <p>${"Letter 1 .... 1 Letter 2 .... 9 ".repeat(8)}</p>
      <h2>Letter 1</h2>
      <p>${"To Mrs. Saville, England. ".repeat(30)}</p>
      <h2>Letter 2</h2>
      <p>${"To Mrs. Saville, England. Archangel. ".repeat(30)}</p>
    `;
    const chapters = splitChapters(html);
    expect(chapters.length).toBe(2);
    expect(chapters[0].title).toBe("Letter 1");
    expect(chapters[1].title).toBe("Letter 2");
  });
});
