import Image from "next/image";
import Link from "next/link";

interface BookCardProps {
  slug: string;
  title: string;
  author: string;
  coverImageUrl: string;
  chapterCount: number;
  progress?: number;
}

export default function BookCard({
  slug,
  title,
  author,
  coverImageUrl,
  chapterCount,
  progress,
}: BookCardProps) {
  return (
    <Link
      href={`/book/${slug}`}
      className="group border-2 border-[var(--border)] overflow-hidden hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-colors duration-200"
    >
      <div className="aspect-[2/3] bg-[var(--muted)] relative">
        {coverImageUrl ? (
          <Image
            src={coverImageUrl}
            alt={title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center p-4 swiss-grid-pattern">
            <span className="text-center text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
              {title}
            </span>
          </div>
        )}
        {progress !== undefined && progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--muted)]">
            <div
              className="h-full bg-[var(--accent)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
      <div className="p-3 border-t-2 border-[var(--border)] group-hover:border-[var(--background)]">
        <h3 className="font-bold text-xs uppercase tracking-wide line-clamp-2 transition-colors duration-200">
          {title}
        </h3>
        <p className="text-[10px] uppercase tracking-widest text-[var(--muted-foreground)] group-hover:text-[var(--background)] mt-1 transition-colors duration-200">
          {author}
        </p>
        <p className="text-[10px] uppercase tracking-widest text-[var(--muted-foreground)] group-hover:text-[var(--background)] transition-colors duration-200">
          {chapterCount} chapter{chapterCount !== 1 ? "s" : ""}
        </p>
      </div>
    </Link>
  );
}
