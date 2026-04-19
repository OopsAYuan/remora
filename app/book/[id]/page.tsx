import Link from "next/link";
import { getBook, BOOKS } from "@/lib/content";
import UserBookDetail from "@/app/components/UserBookDetail";

interface Props {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return BOOKS.map((b) => ({ id: b.id }));
}

export default async function BookPage({ params }: Props) {
  const { id } = await params;
  const book = getBook(id);
  if (!book) return <UserBookDetail bookId={id} />;

  return (
    <div className="min-h-screen bg-[#f8f4ef]">
      {/* Header band */}
      <div
        className="relative px-6 pt-14 pb-10 sm:px-10 sm:pt-20 sm:pb-14"
        style={{ backgroundColor: book.coverColor }}
      >
        {/* Back to library */}
        <Link
          href="/"
          className="absolute top-5 left-5 sm:top-7 sm:left-8 flex items-center gap-1.5 text-xs font-medium transition-opacity opacity-60 hover:opacity-100"
          style={{ color: book.accentColor }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          书库
        </Link>

        <div className="max-w-[640px] mx-auto flex gap-6 sm:gap-8 items-end">
          {/* Spine / cover icon */}
          <div
            className="shrink-0 w-16 h-24 sm:w-20 sm:h-28 rounded-sm shadow-xl flex items-center justify-center"
            style={{ backgroundColor: book.accentColor + "22", border: `2px solid ${book.accentColor}44` }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={book.accentColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest mb-2 opacity-60" style={{ color: book.accentColor }}>
              {book.author}
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold leading-tight text-white mb-3"
              style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
              {book.title}
            </h1>
            <p className="text-sm leading-relaxed opacity-60 text-white line-clamp-3">
              {book.description}
            </p>
          </div>
        </div>
      </div>

      {/* Chapter list */}
      <div className="max-w-[640px] mx-auto px-6 sm:px-10 py-8 sm:py-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-4">目录</p>

        <div className="space-y-1">
          {book.chapters.map((chapter, i) => (
            <Link
              key={chapter.id}
              href={`/book/${book.id}/${chapter.id}`}
              className="group flex items-center gap-4 px-4 py-4 -mx-4 rounded-xl hover:bg-amber-50 transition-colors"
            >
              <span className="text-2xl font-bold text-zinc-200 w-7 shrink-0 text-right leading-none"
                style={{ fontFamily: "'Georgia', serif" }}>
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-medium text-zinc-800 group-hover:text-zinc-900 leading-snug">
                  {chapter.title}
                </p>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {chapter.paragraphs.length} 段 · 约 {Math.ceil(chapter.paragraphs.join(" ").split(/\s+/).length / 200)} 分钟
                </p>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                className="shrink-0 text-zinc-300 group-hover:text-amber-500 transition-colors">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>

        {/* Start reading CTA */}
        <Link
          href={`/book/${book.id}/${book.chapters[0].id}`}
          className="mt-8 flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 active:opacity-80"
          style={{ backgroundColor: book.coverColor }}
        >
          开始阅读
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
