import BookCard from "./BookCard";

interface Book {
  id: string;
  slug: string;
  title: string;
  author: string;
  coverImageUrl: string;
  chapterCount: number;
}

interface BookGridProps {
  books: Book[];
  progressMap?: Record<string, number>;
}

export default function BookGrid({ books, progressMap = {} }: BookGridProps) {
  if (books.length === 0) {
    return (
      <p className="text-[var(--muted-foreground)] text-xs uppercase tracking-widest text-center py-12">
        No books found.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {books.map((book) => (
        <BookCard
          key={book.id}
          slug={book.slug}
          title={book.title}
          author={book.author}
          coverImageUrl={book.coverImageUrl}
          chapterCount={book.chapterCount}
          progress={progressMap[book.id]}
        />
      ))}
    </div>
  );
}
