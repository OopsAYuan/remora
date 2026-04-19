"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { BOOKS } from "@/lib/content";
import {
  getUserBooks,
  removeUserBook,
  coverColorForBook,
  type UserBook,
} from "@/lib/userContent";
import { CATEGORIES, getCategory } from "@/lib/categories";
import ImportModal from "./components/ImportModal";

// Unified book shape for rendering
interface LibraryBook {
  id: string;
  title: string;
  author: string;
  category: string;
  coverColor: string;
  accentColor: string;
  chapterCount: number;
  readingMinutes: number;
  isUser: boolean;
}

export default function LibraryPage() {
  const [userBooks, setUserBooks] = useState<UserBook[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const refreshUserBooks = useCallback(() => setUserBooks(getUserBooks()), []);
  useEffect(() => { refreshUserBooks(); }, [refreshUserBooks]);

  function handleDelete(id: string) {
    removeUserBook(id);
    setConfirmDelete(null);
    refreshUserBooks();
  }

  // Build unified list
  const allBooks: LibraryBook[] = [
    ...BOOKS.map((b) => ({
      id: b.id,
      title: b.title,
      author: b.author,
      category: b.category,
      coverColor: b.coverColor,
      accentColor: b.accentColor,
      chapterCount: b.chapters.length,
      readingMinutes: Math.ceil(
        b.chapters.flatMap((c) => c.paragraphs).join(" ").split(/\s+/).length / 200
      ),
      isUser: false,
    })),
    ...userBooks.map((b) => {
      const { coverColor, accentColor } = coverColorForBook(b);
      return {
        id: b.id,
        title: b.title,
        author: b.author || "未知作者",
        category: b.category ?? "other",
        coverColor,
        accentColor,
        chapterCount: b.chapters.length,
        readingMinutes: Math.ceil(
          b.chapters.map((c) => c.text).join(" ").trim().split(/\s+/).length / 200
        ),
        isUser: true,
      };
    }),
  ];

  // Only show categories that have books
  const activeCategoryIds = new Set(allBooks.map((b) => b.category));
  const tabs = CATEGORIES.filter((c) => activeCategoryIds.has(c.id));

  const displayed =
    selectedCategory === "all"
      ? allBooks
      : allBooks.filter((b) => b.category === selectedCategory);

  const selectedCat = getCategory(selectedCategory);

  return (
    <div className="min-h-screen bg-[#111318]">
      {/* Header */}
      <header className="px-5 pt-12 pb-5 sm:px-10 sm:pt-16 border-b border-white/5">
        <div className="max-w-[900px] mx-auto">
          <div className="flex items-end justify-between mb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-amber-500 mb-1.5">Remora</p>
              <h1 className="text-2xl sm:text-3xl font-bold text-white" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
                我的书库
              </h1>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-black text-xs font-semibold transition-colors shrink-0"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              添加书籍
            </button>
          </div>

          {/* Category tabs */}
          <div className="flex gap-2 overflow-x-auto pb-px" style={{ scrollbarWidth: "none" }}>
            <button
              onClick={() => setSelectedCategory("all")}
              className="shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors"
              style={
                selectedCategory === "all"
                  ? { backgroundColor: "#f59e0b", color: "#000" }
                  : { backgroundColor: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.45)" }
              }
            >
              全部 {allBooks.length}
            </button>
            {tabs.map((cat) => {
              const count = allBooks.filter((b) => b.category === cat.id).length;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className="shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors"
                  style={
                    isActive
                      ? { backgroundColor: cat.color + "28", color: cat.color, outline: `1px solid ${cat.color}50` }
                      : { backgroundColor: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.45)" }
                  }
                >
                  {cat.label} {count}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Book grid */}
      <main className="max-w-[900px] mx-auto px-5 sm:px-10 py-7 sm:py-9">
        {displayed.length === 0 ? (
          <div className="text-center py-16 space-y-2">
            <p className="text-white/20 text-sm">
              {selectedCategory === "all" ? "书库为空" : `暂无「${selectedCat?.label}」类书籍`}
            </p>
            {selectedCategory !== "all" && (
              <button onClick={() => setSelectedCategory("all")} className="text-xs text-amber-500 hover:text-amber-400">
                查看全部
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5">
            {displayed.map((book) => {
              const cat = getCategory(book.category);
              return (
                <div key={book.id} className="group flex flex-col">
                  <Link href={`/book/${book.id}`} className="flex flex-col">
                    {/* Cover */}
                    <div
                      className="relative w-full aspect-[2/3] rounded-xl shadow-lg mb-2.5 flex flex-col justify-between p-3.5 overflow-hidden transition-transform duration-200 group-hover:scale-[1.02] group-active:scale-[0.98]"
                      style={{ backgroundColor: book.coverColor }}
                    >
                      {/* Texture lines */}
                      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 28px, rgba(255,255,255,0.15) 28px, rgba(255,255,255,0.15) 29px)" }} />
                      {/* Spine shadow */}
                      <div className="absolute left-0 top-0 bottom-0 w-3 bg-black/20 rounded-l-xl" />

                      {/* Delete button – inside cover so stacking context is correct */}
                      {book.isUser && (
                        <button
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setConfirmDelete(book.id); }}
                          onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); setConfirmDelete(book.id); }}
                          className="absolute top-2 left-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center z-20 active:bg-red-500 transition-colors"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                            <path d="M10 11v6M14 11v6" />
                            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                          </svg>
                        </button>
                      )}

                      {/* Category badge */}
                      {cat && (
                        <div className="flex justify-end relative z-10">
                          <span
                            className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                            style={{ backgroundColor: cat.color + "30", color: cat.color }}
                          >
                            {cat.label}
                          </span>
                        </div>
                      )}

                      {/* Title area */}
                      <div className="relative z-10">
                        <p className="text-[9px] font-semibold uppercase tracking-widest mb-1 opacity-60" style={{ color: book.accentColor }}>
                          {book.author}
                        </p>
                        <h2 className="text-xs font-bold text-white leading-snug" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
                          {book.title}
                        </h2>
                      </div>
                    </div>

                    {/* Meta */}
                    <p className="text-[11px] text-white/35 leading-snug px-0.5">
                      {book.chapterCount} {book.isUser ? "篇" : "章"} · 约 {book.readingMinutes} 分钟
                    </p>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Import modal */}
      {showModal && (
        <ImportModal onClose={() => setShowModal(false)} onImported={refreshUserBooks} />
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <>
          <div className="fixed inset-0 z-50 bg-black/60" onClick={() => setConfirmDelete(null)} />
          <div className="fixed z-50 inset-x-8 top-1/2 -translate-y-1/2 sm:inset-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-72 bg-[#1a1a24] rounded-2xl border border-white/10 p-5 text-center shadow-2xl">
            <p className="text-sm text-white font-medium mb-1">删除这本书？</p>
            <p className="text-xs text-white/40 mb-4">此操作不可撤销</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2 rounded-lg text-sm text-white/60 border border-white/10 hover:bg-white/5 transition-colors">取消</button>
              <button onClick={() => handleDelete(confirmDelete)} className="flex-1 py-2 rounded-lg text-sm text-white font-medium bg-red-500/80 hover:bg-red-500 transition-colors">删除</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
