"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  getUserBook,
  parseTextToParagraphs,
  type UserBook,
} from "@/lib/userContent";
import Reader from "@/app/components/Reader";

export default function UserChapterPage({
  bookId,
  chapterId,
}: {
  bookId: string;
  chapterId: string;
}) {
  const [book, setBook] = useState<UserBook | null | undefined>(undefined);

  useEffect(() => {
    const b = getUserBook(bookId);
    setBook(b ?? null);
  }, [bookId]);

  if (book === undefined) return null;

  if (book === null) {
    return (
      <div className="min-h-screen bg-[#f8f4ef] flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-zinc-400 text-sm">找不到这本书</p>
          <Link href="/" className="text-xs text-amber-600 hover:underline">返回书库</Link>
        </div>
      </div>
    );
  }

  const index = book.chapters.findIndex((c) => c.id === chapterId);
  const chapter = book.chapters[index];

  if (!chapter) {
    return (
      <div className="min-h-screen bg-[#f8f4ef] flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-zinc-400 text-sm">找不到这篇文章</p>
          <Link href={`/book/${bookId}`} className="text-xs text-amber-600 hover:underline">返回目录</Link>
        </div>
      </div>
    );
  }

  const prevChapter = index > 0 ? book.chapters[index - 1] : null;
  const nextChapter = index < book.chapters.length - 1 ? book.chapters[index + 1] : null;
  const paragraphs = parseTextToParagraphs(chapter.text);

  return (
    <Reader
      bookId={book.id}
      chapterId={chapter.id}
      bookTitle={book.title}
      chapterTitle={chapter.title}
      paragraphs={paragraphs}
      prevChapter={prevChapter ? { id: prevChapter.id, title: prevChapter.title } : null}
      nextChapter={nextChapter ? { id: nextChapter.id, title: nextChapter.title } : null}
    />
  );
}
