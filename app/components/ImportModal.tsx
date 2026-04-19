"use client";

import { useState, useRef } from "react";
import {
  addUserBook,
  exportBooksAsJSON,
  importBooksFromJSON,
  COVER_PALETTE,
} from "@/lib/userContent";
import { CATEGORIES } from "@/lib/categories";

interface Props {
  onClose: () => void;
  onImported: () => void;
}

interface ChapterDraft {
  title: string;
  text: string;
}

const emptyChapter = (): ChapterDraft => ({ title: "", text: "" });

export default function AddBookModal({ onClose, onImported }: Props) {
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1: book metadata
  const [bookTitle, setBookTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [colorIndex, setColorIndex] = useState(0);
  const [category, setCategory] = useState("other");

  // Step 2: chapters
  const [chapters, setChapters] = useState<ChapterDraft[]>([emptyChapter()]);
  const [error, setError] = useState("");

  // Backup tab
  const [showBackup, setShowBackup] = useState(false);
  const [backupMsg, setBackupMsg] = useState("");

  // File upload: single hidden input, tracks which chapter to fill
  const fileRef = useRef<HTMLInputElement>(null);
  const jsonRef = useRef<HTMLInputElement>(null);
  const uploadTargetIdx = useRef<number>(0);

  // ── Step 1 ──────────────────────────────────────────────
  function goToStep2() {
    setError("");
    if (!bookTitle.trim()) { setError("请输入书名"); return; }
    setStep(2);
  }

  // ── Step 2 ──────────────────────────────────────────────
  function updateChapter(idx: number, field: keyof ChapterDraft, value: string) {
    setChapters((prev) => prev.map((c, i) => (i === idx ? { ...c, [field]: value } : c)));
  }

  function addChapter() {
    setChapters((prev) => [...prev, emptyChapter()]);
  }

  function removeChapter(idx: number) {
    setChapters((prev) => prev.filter((_, i) => i !== idx));
  }

  function openFilePicker(idx: number) {
    uploadTargetIdx.current = idx;
    fileRef.current?.click();
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const idx = uploadTargetIdx.current;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = (ev.target?.result as string) ?? "";
      setChapters((prev) =>
        prev.map((c, i) => {
          if (i !== idx) return c;
          return {
            title: c.title || file.name.replace(/\.[^.]+$/, ""),
            text,
          };
        })
      );
    };
    reader.readAsText(file, "utf-8");
    e.target.value = "";
  }

  function handleSubmit() {
    setError("");
    const validChapters = chapters.filter((c) => c.text.trim());
    if (validChapters.length === 0) { setError("请至少添加一篇文章内容"); return; }

    addUserBook({
      title: bookTitle.trim(),
      author: author.trim(),
      description: description.trim(),
      category,
      colorIndex,
      chapters: validChapters.map((c, i) => ({
        id: `ch_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 5)}`,
        title: c.title.trim() || `第 ${i + 1} 篇`,
        text: c.text.trim(),
      })),
    });
    onImported();
    onClose();
  }

  // ── Backup ───────────────────────────────────────────────
  function handleJSONImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBackupMsg("");
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const count = importBooksFromJSON(ev.target?.result as string);
        setBackupMsg(`成功导入 ${count} 本书`);
        onImported();
      } catch {
        setBackupMsg("JSON 格式错误，无法导入");
      }
    };
    reader.readAsText(file, "utf-8");
    e.target.value = "";
  }

  const { coverColor, accentColor } = COVER_PALETTE[colorIndex];

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed z-50 inset-x-3 top-4 bottom-4 sm:inset-auto sm:left-1/2 sm:-translate-x-1/2 sm:top-1/2 sm:-translate-y-1/2 sm:w-[540px] sm:max-h-[85vh] bg-[#1a1a24] rounded-2xl shadow-2xl border border-white/10 flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-white">
              {showBackup ? "备份管理" : step === 1 ? "新建书籍" : "添加文章"}
            </h2>
            {!showBackup && (
              <div className="flex items-center gap-1">
                <div className={`w-5 h-1 rounded-full ${step === 1 ? "bg-amber-400" : "bg-white/20"}`} />
                <div className={`w-5 h-1 rounded-full ${step === 2 ? "bg-amber-400" : "bg-white/20"}`} />
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setShowBackup((v) => !v); setBackupMsg(""); }}
              className="text-xs text-white/30 hover:text-white/60 transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
            >
              {showBackup ? "返回" : "备份"}
            </button>
            <button
              onClick={onClose}
              className="text-white/40 hover:text-white/80 text-xl leading-none p-1 -m-1 transition-colors"
            >
              ×
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          {showBackup ? (
            <div className="px-5 py-4 space-y-3">
              <div className="rounded-xl border border-white/10 p-4 space-y-2">
                <p className="text-sm font-medium text-white">导出备份</p>
                <p className="text-xs text-white/40">将所有用户书籍下载为 JSON 文件。</p>
                <button
                  onClick={exportBooksAsJSON}
                  className="w-full py-2.5 rounded-lg text-sm font-medium text-amber-400 border border-amber-400/30 hover:bg-amber-400/10 transition-colors"
                >
                  下载 JSON 备份
                </button>
              </div>
              <div className="rounded-xl border border-white/10 p-4 space-y-2">
                <p className="text-sm font-medium text-white">从备份恢复</p>
                <p className="text-xs text-white/40">选择之前导出的 JSON 文件，已有书籍不会重复导入。</p>
                {backupMsg && (
                  <p className={`text-xs ${backupMsg.includes("成功") ? "text-green-400" : "text-red-400"}`}>
                    {backupMsg}
                  </p>
                )}
                <button
                  onClick={() => jsonRef.current?.click()}
                  className="w-full py-2.5 rounded-lg text-sm text-white/60 border border-white/10 hover:bg-white/5 transition-colors"
                >
                  选择 JSON 文件
                </button>
                <input ref={jsonRef} type="file" accept=".json" className="hidden" onChange={handleJSONImport} />
              </div>
            </div>
          ) : step === 1 ? (
            // ── STEP 1: Book metadata ──
            <div className="px-5 py-4 space-y-4">
              {/* Color picker */}
              <div>
                <label className="block text-xs text-white/40 mb-2">封面颜色</label>
                <div className="flex gap-2">
                  {COVER_PALETTE.map((p, i) => (
                    <button
                      key={i}
                      onClick={() => setColorIndex(i)}
                      className="w-9 h-9 rounded-lg transition-transform hover:scale-110"
                      style={{
                        backgroundColor: p.coverColor,
                        outline: colorIndex === i ? `2px solid ${p.accentColor}` : "none",
                        outlineOffset: 2,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Category picker */}
              <div>
                <label className="block text-xs text-white/40 mb-2">分类</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      className="px-3 py-1 rounded-full text-xs font-medium transition-colors"
                      style={
                        category === cat.id
                          ? { backgroundColor: cat.color + "33", color: cat.color, outline: `1px solid ${cat.color}55` }
                          : { backgroundColor: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.35)" }
                      }
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div
                className="w-full h-16 rounded-xl flex items-center px-4 gap-3"
                style={{ backgroundColor: coverColor }}
              >
                <div className="absolute left-0 top-0 bottom-0 w-3 bg-black/20 rounded-l-xl" />
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
                <span className="text-white text-sm font-bold truncate" style={{ fontFamily: "'Georgia', serif" }}>
                  {bookTitle || "书名预览"}
                </span>
              </div>

              <div>
                <label className="block text-xs text-white/40 mb-1">书名 *</label>
                <input
                  autoFocus
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-amber-500/60"
                  placeholder="输入书名"
                  value={bookTitle}
                  onChange={(e) => setBookTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && goToStep2()}
                />
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs text-white/40 mb-1">作者（可选）</label>
                  <input
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-amber-500/60"
                    placeholder="作者"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-white/40 mb-1">简介（可选）</label>
                <textarea
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-amber-500/60 resize-none"
                  rows={2}
                  placeholder="一句话简介"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {error && <p className="text-xs text-red-400">{error}</p>}
            </div>
          ) : (
            // ── STEP 2: Chapters ──
            <div className="px-5 py-4 space-y-4">
              {chapters.map((ch, idx) => (
                <div key={idx} className="rounded-xl border border-white/10 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white/40 uppercase tracking-wide">
                      第 {idx + 1} 篇
                    </span>
                    {chapters.length > 1 && (
                      <button
                        onClick={() => removeChapter(idx)}
                        className="text-xs text-white/30 hover:text-red-400 transition-colors"
                      >
                        删除
                      </button>
                    )}
                  </div>

                  <input
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-amber-500/60"
                    placeholder={`文章标题（默认：第 ${idx + 1} 篇）`}
                    value={ch.title}
                    onChange={(e) => updateChapter(idx, "title", e.target.value)}
                  />

                  <textarea
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-amber-500/60 resize-none leading-relaxed"
                    rows={6}
                    placeholder={"粘贴文章内容……\n\n用空行分隔段落"}
                    value={ch.text}
                    onChange={(e) => updateChapter(idx, "text", e.target.value)}
                  />

                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => openFilePicker(idx)}
                      className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      上传 .txt 文件
                    </button>
                    {ch.text.trim() && (
                      <span className="text-xs text-white/20">
                        约 {ch.text.trim().split(/\s+/).length} 词
                      </span>
                    )}
                  </div>
                </div>
              ))}

              <button
                onClick={addChapter}
                className="w-full py-3 rounded-xl border border-dashed border-white/15 text-sm text-white/40 hover:text-white/60 hover:border-white/25 transition-colors flex items-center justify-center gap-2"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                添加更多文章
              </button>

              {error && <p className="text-xs text-red-400">{error}</p>}
            </div>
          )}
        </div>

        {/* Footer buttons */}
        {!showBackup && (
          <div className="px-5 pb-5 pt-3 border-t border-white/10 shrink-0 flex gap-2">
            {step === 1 ? (
              <button
                onClick={goToStep2}
                className="flex-1 py-3 rounded-xl text-sm font-semibold text-black bg-amber-400 hover:bg-amber-300 active:bg-amber-500 transition-colors"
              >
                下一步：添加文章
              </button>
            ) : (
              <>
                <button
                  onClick={() => { setStep(1); setError(""); }}
                  className="py-3 px-4 rounded-xl text-sm text-white/60 border border-white/10 hover:bg-white/5 transition-colors"
                >
                  上一步
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold text-black bg-amber-400 hover:bg-amber-300 active:bg-amber-500 transition-colors"
                >
                  完成，创建书籍
                </button>
              </>
            )}
          </div>
        )}

        {/* Shared hidden file input */}
        <input ref={fileRef} type="file" accept=".txt,.md" className="hidden" onChange={handleFileUpload} />
      </div>
    </>
  );
}
