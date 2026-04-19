"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getUserBook,
  addChapterToBook,
  removeChapterFromBook,
  removeUserBook,
  updateUserBook,
  updateChapter,
  moveChapter,
  coverColorForBook,
  parseTextToParagraphs,
  COVER_PALETTE,
  type UserBook,
} from "@/lib/userContent";
import { CATEGORIES } from "@/lib/categories";

export default function UserBookDetail({ bookId }: { bookId: string }) {
  const router = useRouter();
  const [book, setBook] = useState<UserBook | null | undefined>(undefined);

  // modes
  const [editMode, setEditMode] = useState(false);
  const [editingBook, setEditingBook] = useState(false);

  // book‑level edit form
  const [ebTitle, setEbTitle] = useState("");
  const [ebAuthor, setEbAuthor] = useState("");
  const [ebDesc, setEbDesc] = useState("");
  const [ebColor, setEbColor] = useState(0);
  const [ebCategory, setEbCategory] = useState("other");

  // chapter‑level edit form
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const [ecTitle, setEcTitle] = useState("");
  const [ecText, setEcText] = useState("");

  // add chapter
  const [addingChapter, setAddingChapter] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newText, setNewText] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const editFileRef = useRef<HTMLInputElement>(null);

  // delete confirm: chapter id | "book" | null
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  function reload() {
    const b = getUserBook(bookId);
    setBook(b ?? null);
  }

  useEffect(() => { reload(); }, [bookId]);

  // ── Book edit ──────────────────────────────────────────────
  function openEditBook() {
    if (!book) return;
    setEbTitle(book.title);
    setEbAuthor(book.author);
    setEbDesc(book.description);
    setEbColor(book.colorIndex ?? 0);
    setEbCategory(book.category ?? "other");
    setEditingBook(true);
  }

  function saveBook() {
    if (!ebTitle.trim()) return;
    updateUserBook(bookId, {
      title: ebTitle.trim(),
      author: ebAuthor.trim(),
      description: ebDesc.trim(),
      colorIndex: ebColor,
      category: ebCategory,
    });
    setEditingBook(false);
    reload();
  }

  // ── Chapter edit ───────────────────────────────────────────
  function openEditChapter(ch: { id: string; title: string; text: string }) {
    setEditingChapterId(ch.id);
    setEcTitle(ch.title);
    setEcText(ch.text);
    setAddingChapter(false);
  }

  function saveChapter() {
    if (!editingChapterId || !ecText.trim()) return;
    updateChapter(bookId, editingChapterId, {
      title: ecTitle.trim() || ecTitle,
      text: ecText.trim(),
    });
    setEditingChapterId(null);
    reload();
  }

  // ── Add chapter ────────────────────────────────────────────
  function handleAddChapter() {
    if (!newText.trim()) return;
    const ch = addChapterToBook(bookId, {
      title: newTitle.trim() || `第 ${(book?.chapters.length ?? 0) + 1} 篇`,
      text: newText.trim(),
    });
    setNewTitle(""); setNewText(""); setAddingChapter(false);
    reload();
    router.push(`/book/${bookId}/${ch.id}`);
  }

  // ── Delete ─────────────────────────────────────────────────
  function handleDeleteChapter(chapterId: string) {
    removeChapterFromBook(bookId, chapterId);
    setConfirmDelete(null);
    reload();
  }

  function handleDeleteBook() {
    removeUserBook(bookId);
    router.replace("/");
  }

  // ── File upload ────────────────────────────────────────────
  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!newTitle) setNewTitle(file.name.replace(/\.[^.]+$/, ""));
    const reader = new FileReader();
    reader.onload = (ev) => setNewText((ev.target?.result as string) ?? "");
    reader.readAsText(file, "utf-8");
    e.target.value = "";
  }

  function handleEditFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setEcText((ev.target?.result as string) ?? "");
    reader.readAsText(file, "utf-8");
    e.target.value = "";
  }

  // ── Reorder ────────────────────────────────────────────────
  function handleMove(idx: number, dir: -1 | 1) {
    moveChapter(bookId, idx, idx + dir);
    reload();
  }

  // ── Render ─────────────────────────────────────────────────
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

  const { coverColor, accentColor } = coverColorForBook(book);
  const previewPalette = COVER_PALETTE[ebColor];

  return (
    <div className="min-h-screen bg-[#f8f4ef]">
      {/* ── Header ── */}
      <div className="relative px-6 pt-14 pb-10 sm:px-10 sm:pt-20 sm:pb-14" style={{ backgroundColor: coverColor }}>
        <Link
          href="/"
          className="absolute top-5 left-5 sm:top-7 sm:left-8 flex items-center gap-1.5 text-xs font-medium opacity-60 hover:opacity-100 transition-opacity"
          style={{ color: accentColor }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          书库
        </Link>

        <div className="max-w-[640px] mx-auto flex gap-6 sm:gap-8 items-end">
          <div
            className="shrink-0 w-16 h-24 sm:w-20 sm:h-28 rounded-sm shadow-xl flex items-center justify-center"
            style={{ backgroundColor: accentColor + "22", border: `2px solid ${accentColor}44` }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest mb-2 opacity-60" style={{ color: accentColor }}>
              {book.author || "未知作者"}
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold leading-tight text-white mb-2" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
              {book.title}
            </h1>
            {book.description && (
              <p className="text-sm opacity-60 text-white line-clamp-2">{book.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Chapter list ── */}
      <div className="max-w-[640px] mx-auto px-6 sm:px-10 py-8 sm:py-10">

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">目录</p>
          <div className="flex items-center gap-3">
            {!editMode ? (
              <>
                <button
                  onClick={() => { setAddingChapter(true); setEditMode(false); setEditingChapterId(null); }}
                  onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); setAddingChapter(true); }}
                  className="flex items-center gap-1 text-xs font-medium text-amber-600 active:text-amber-700 transition-colors"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  添加文章
                </button>
                <button
                  onClick={() => setEditMode(true)}
                  onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); setEditMode(true); }}
                  className="flex items-center gap-1 text-xs font-medium text-zinc-500 active:text-zinc-800 transition-colors"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  编辑
                </button>
              </>
            ) : (
              <button
                onClick={() => { setEditMode(false); setEditingChapterId(null); setEditingBook(false); }}
                onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); setEditMode(false); setEditingChapterId(null); setEditingBook(false); }}
                className="text-xs font-semibold text-amber-600 active:text-amber-700 transition-colors px-2 py-1 rounded-lg bg-amber-50"
              >
                完成
              </button>
            )}
          </div>
        </div>

        {/* Edit book info form (shown in edit mode) */}
        {editMode && (
          <div className="mb-4">
            {!editingBook ? (
              <button
                onClick={openEditBook}
                onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); openEditBook(); }}
                className="w-full flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-zinc-300 text-sm text-zinc-500 active:text-zinc-800 active:border-zinc-400 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                编辑书籍信息（书名、作者、封面颜色…）
              </button>
            ) : (
              <div className="rounded-xl border border-zinc-200 bg-white p-4 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">编辑书籍信息</p>

                {/* Color picker */}
                <div>
                  <p className="text-xs text-zinc-400 mb-1.5">封面颜色</p>
                  <div className="flex gap-2">
                    {COVER_PALETTE.map((p, i) => (
                      <button
                        key={i}
                        onClick={() => setEbColor(i)}
                        onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); setEbColor(i); }}
                        className="w-8 h-8 rounded-lg transition-transform active:scale-110"
                        style={{ backgroundColor: p.coverColor, outline: ebColor === i ? `2px solid ${p.accentColor}` : "none", outlineOffset: 2 }}
                      />
                    ))}
                  </div>
                </div>

                {/* Category picker */}
                <div>
                  <p className="text-xs text-zinc-400 mb-1.5">分类</p>
                  <div className="flex flex-wrap gap-1.5">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setEbCategory(cat.id)}
                        onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); setEbCategory(cat.id); }}
                        className="px-2.5 py-1 rounded-full text-xs font-medium transition-colors"
                        style={
                          ebCategory === cat.id
                            ? { backgroundColor: cat.color + "22", color: cat.color, outline: `1px solid ${cat.color}44` }
                            : { backgroundColor: "rgba(0,0,0,0.04)", color: "#71717a" }
                        }
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preview strip */}
                <div className="w-full h-10 rounded-lg flex items-center px-3 gap-2 relative overflow-hidden" style={{ backgroundColor: previewPalette.coverColor }}>
                  <div className="absolute left-0 top-0 bottom-0 w-2 bg-black/20 rounded-l-lg" />
                  <span className="text-white text-xs font-bold truncate" style={{ fontFamily: "'Georgia', serif" }}>
                    {ebTitle || "书名预览"}
                  </span>
                </div>

                <input
                  className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-800 placeholder-zinc-300 focus:outline-none focus:border-amber-400"
                  placeholder="书名 *"
                  value={ebTitle}
                  onChange={(e) => setEbTitle(e.target.value)}
                />
                <input
                  className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-800 placeholder-zinc-300 focus:outline-none focus:border-amber-400"
                  placeholder="作者（可选）"
                  value={ebAuthor}
                  onChange={(e) => setEbAuthor(e.target.value)}
                />
                <textarea
                  className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-800 placeholder-zinc-300 focus:outline-none focus:border-amber-400 resize-none"
                  rows={2}
                  placeholder="简介（可选）"
                  value={ebDesc}
                  onChange={(e) => setEbDesc(e.target.value)}
                />

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setEditingBook(false)}
                    className="px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-700 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={saveBook}
                    disabled={!ebTitle.trim()}
                    className="flex-1 py-1.5 text-xs font-semibold text-white rounded-lg disabled:opacity-40 transition-colors"
                    style={{ backgroundColor: coverColor }}
                  >
                    保存书籍信息
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Chapter rows */}
        {book.chapters.length === 0 ? (
          <p className="text-sm text-zinc-400 py-6 text-center">还没有文章，点击「添加文章」开始</p>
        ) : (
          <div className="space-y-1">
            {book.chapters.map((chapter, i) => {
              const words = parseTextToParagraphs(chapter.text).join(" ").split(/\s+/).length;
              const isEditing = editingChapterId === chapter.id;
              return (
                <div key={chapter.id}>
                  {/* Chapter row */}
                  <div className={`flex items-center gap-3 px-4 py-3.5 -mx-4 rounded-xl transition-colors ${isEditing ? "bg-amber-50" : "hover:bg-amber-50"}`}>
                    {/* Reorder buttons (edit mode) */}
                    {editMode && (
                      <div className="flex flex-col gap-0.5 shrink-0">
                        <button
                          disabled={i === 0}
                          onClick={() => handleMove(i, -1)}
                          onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); if (i > 0) handleMove(i, -1); }}
                          className="w-6 h-6 flex items-center justify-center rounded text-zinc-400 disabled:opacity-20 active:text-zinc-700 active:bg-zinc-100 transition-colors"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 15l-6-6-6 6" />
                          </svg>
                        </button>
                        <button
                          disabled={i === book.chapters.length - 1}
                          onClick={() => handleMove(i, 1)}
                          onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); if (i < book.chapters.length - 1) handleMove(i, 1); }}
                          className="w-6 h-6 flex items-center justify-center rounded text-zinc-400 disabled:opacity-20 active:text-zinc-700 active:bg-zinc-100 transition-colors"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 9l6 6 6-6" />
                          </svg>
                        </button>
                      </div>
                    )}

                    {/* Number + title */}
                    {editMode ? (
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="text-2xl font-bold text-zinc-200 w-7 shrink-0 text-right leading-none" style={{ fontFamily: "'Georgia', serif" }}>
                          {i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[15px] font-medium text-zinc-800 leading-snug truncate">{chapter.title}</p>
                          <p className="text-xs text-zinc-400 mt-0.5">约 {Math.ceil(words / 200)} 分钟</p>
                        </div>
                      </div>
                    ) : (
                      <Link href={`/book/${book.id}/${chapter.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="text-2xl font-bold text-zinc-200 w-7 shrink-0 text-right leading-none" style={{ fontFamily: "'Georgia', serif" }}>
                          {i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[15px] font-medium text-zinc-800 leading-snug truncate">{chapter.title}</p>
                          <p className="text-xs text-zinc-400 mt-0.5">约 {Math.ceil(words / 200)} 分钟</p>
                        </div>
                      </Link>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center gap-1 shrink-0">
                      {editMode ? (
                        <>
                          {/* Edit chapter */}
                          <button
                            onClick={() => isEditing ? setEditingChapterId(null) : openEditChapter(chapter)}
                            onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); isEditing ? setEditingChapterId(null) : openEditChapter(chapter); }}
                            className={`p-2 rounded-lg transition-colors ${isEditing ? "text-amber-600 bg-amber-100" : "text-zinc-400 active:text-amber-600 active:bg-amber-50"}`}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          {/* Delete chapter */}
                          <button
                            onClick={() => setConfirmDelete(chapter.id)}
                            onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); setConfirmDelete(chapter.id); }}
                            className="p-2 rounded-lg text-zinc-300 active:text-red-500 active:bg-red-50 transition-colors"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                              <path d="M10 11v6M14 11v6" />
                              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                            </svg>
                          </button>
                        </>
                      ) : (
                        <Link href={`/book/${book.id}/${chapter.id}`} className="text-zinc-300 hover:text-amber-500 transition-colors p-1">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                          </svg>
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Inline chapter edit form */}
                  {isEditing && (
                    <div className="mx-0 mb-2 rounded-xl border border-amber-200 bg-white p-4 space-y-3">
                      <input
                        autoFocus
                        className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-800 placeholder-zinc-300 focus:outline-none focus:border-amber-400"
                        placeholder="文章标题"
                        value={ecTitle}
                        onChange={(e) => setEcTitle(e.target.value)}
                      />
                      <textarea
                        className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-800 placeholder-zinc-300 focus:outline-none focus:border-amber-400 resize-none leading-relaxed"
                        rows={8}
                        placeholder="文章内容……"
                        value={ecText}
                        onChange={(e) => setEcText(e.target.value)}
                      />
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => editFileRef.current?.click()}
                          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-600 transition-colors"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                          </svg>
                          上传 .txt 替换内容
                        </button>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingChapterId(null)}
                            className="px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-700 transition-colors"
                          >
                            取消
                          </button>
                          <button
                            onClick={saveChapter}
                            disabled={!ecText.trim()}
                            className="px-4 py-1.5 text-xs font-semibold text-white rounded-lg disabled:opacity-40 transition-colors"
                            style={{ backgroundColor: coverColor }}
                          >
                            保存
                          </button>
                        </div>
                      </div>
                      <input ref={editFileRef} type="file" accept=".txt,.md" className="hidden" onChange={handleEditFileUpload} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Delete book button (edit mode only) */}
        {editMode && (
          <button
            onClick={() => setConfirmDelete("book")}
            onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); setConfirmDelete("book"); }}
            className="mt-6 w-full flex items-center justify-center gap-1.5 py-3 rounded-xl border border-red-200 text-sm font-medium text-red-400 active:bg-red-50 active:text-red-600 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
            删除整本书
          </button>
        )}

        {/* Add chapter inline form */}
        {addingChapter && (
          <div className="mt-4 rounded-xl border border-zinc-200 p-4 space-y-3 bg-white">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              第 {book.chapters.length + 1} 篇
            </p>
            <input
              autoFocus
              className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-800 placeholder-zinc-300 focus:outline-none focus:border-amber-400"
              placeholder={`文章标题（默认：第 ${book.chapters.length + 1} 篇）`}
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <textarea
              className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-800 placeholder-zinc-300 focus:outline-none focus:border-amber-400 resize-none leading-relaxed"
              rows={7}
              placeholder={"粘贴文章内容……\n\n用空行分隔段落"}
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
            />
            <div className="flex items-center justify-between">
              <button
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-600 transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                上传 .txt
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => { setAddingChapter(false); setNewTitle(""); setNewText(""); }}
                  className="px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-700 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleAddChapter}
                  disabled={!newText.trim()}
                  className="px-4 py-1.5 text-xs font-semibold text-white rounded-lg transition-colors disabled:opacity-40"
                  style={{ backgroundColor: coverColor }}
                >
                  添加
                </button>
              </div>
            </div>
            <input ref={fileRef} type="file" accept=".txt,.md" className="hidden" onChange={handleFileUpload} />
          </div>
        )}

        {/* Start reading */}
        {book.chapters.length > 0 && !editMode && (
          <button
            onClick={() => router.push(`/book/${book.id}/${book.chapters[0].id}`)}
            className="mt-8 flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 active:opacity-80"
            style={{ backgroundColor: coverColor }}
          >
            开始阅读
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      {/* Delete confirm */}
      {confirmDelete && (
        <>
          <div className="fixed inset-0 z-50 bg-black/40" onClick={() => setConfirmDelete(null)} />
          <div className="fixed z-50 inset-x-8 top-1/2 -translate-y-1/2 sm:inset-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-72 bg-white rounded-2xl border border-zinc-100 p-5 text-center shadow-2xl">
            <p className="text-sm text-zinc-800 font-medium mb-1">
              {confirmDelete === "book" ? "删除这本书？" : "删除这篇文章？"}
            </p>
            <p className="text-xs text-zinc-400 mb-4">此操作不可撤销</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2 rounded-lg text-sm text-zinc-500 border border-zinc-200 hover:bg-zinc-50 transition-colors">取消</button>
              <button
                onClick={() => confirmDelete === "book" ? handleDeleteBook() : handleDeleteChapter(confirmDelete)}
                className="flex-1 py-2 rounded-lg text-sm text-white font-medium bg-red-500 hover:bg-red-600 transition-colors"
              >删除</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
