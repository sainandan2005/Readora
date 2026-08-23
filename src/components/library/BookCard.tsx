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
      className="group block transition-transform duration-200 ease-out hover:-translate-y-1"
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--muted)] shadow-[var(--shadow-md)] transition-shadow duration-200 group-hover:shadow-[var(--shadow-lg)]">
        {coverImageUrl ? (
          <Image
            src={coverImageUrl}
            alt={title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--accent)] to-[var(--accent-hover)] p-4">
            <span className="font-display text-center text-sm font-semibold italic leading-snug text-[var(--accent-foreground)]">
              {title}
            </span>
          </div>
        )}
        {progress !== undefined && progress > 0 && (
          <div className="absolute inset-x-0 bottom-0 h-1.5 bg-black/20 backdrop-blur-sm">
            <div
              className="h-full bg-[var(--gold)] transition-[width]"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
      <div className="px-1 pt-3">
        <h3 className="font-display line-clamp-2 text-[15px] font-semibold leading-snug text-[var(--foreground)]">
          {title}
        </h3>
        <p className="mt-0.5 truncate text-xs text-[var(--muted-foreground)]">
          {author}
        </p>
        <p className="mt-1 text-[11px] font-medium uppercase tracking-wider text-[var(--muted-foreground)]/70">
          {chapterCount} chapter{chapterCount !== 1 ? "s" : ""}
        </p>
      </div>
    </Link>
  );
}
