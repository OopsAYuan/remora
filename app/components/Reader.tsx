"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import WordPopup from "./WordPopup";
import SelectionPopup from "./SelectionPopup";

interface ReaderProps {
  bookId: string;
  chapterId: string;
  bookTitle: string;
  chapterTitle: string;
  paragraphs: string[];
  prevChapter?: { id: string; title: string } | null;
  nextChapter?: { id: string; title: string } | null;
}

interface WordEntry {
  word: string;
  phonetic: string;
  audio: string;
  chineseTranslation?: string;
  definitions: { pos: string; meaning: string; example?: string }[];
}

interface WordPopupState {
  entry: WordEntry | null;
  loading: boolean;
  anchorEl: HTMLElement;
  anchorPos: { anchorX: number; anchorBottom: number };
  word: string;
}

interface SelectionPopupState {
  text: string;
  position: { x: number; y: number };
}

const LONG_PRESS_MS = 450;
const EDGE_ZONE = 80;
const SCROLL_SPEED = 6;

// Module-level cache: persists for the lifetime of the browser session
const wordCache = new Map<string, WordEntry>();

function speakWord(word: string) {
  const clean = word.replace(/[^a-zA-Z'-]/g, "");
  if (!clean) return;
  if (!("speechSynthesis" in window)) return;
  const synth = window.speechSynthesis;
  if (synth.speaking || synth.pending) synth.cancel();
  const utt = new SpeechSynthesisUtterance(clean);
  utt.lang = "en-US";
  utt.rate = 0.9;
  synth.speak(utt);
}

function getAllWordSpans(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>("[data-key]"));
}

export default function Reader({
  bookId,
  chapterId,
  bookTitle,
  chapterTitle,
  paragraphs,
  prevChapter,
  nextChapter,
}: ReaderProps) {
  const router = useRouter();
  const [wordPopup, setWordPopup] = useState<WordPopupState | null>(null);
  const [selectionPopup, setSelectionPopup] = useState<SelectionPopupState | null>(null);
  const [dragSelected, setDragSelected] = useState<Set<string>>(new Set());

  const phase = useRef<"idle" | "pressing" | "select">("idle");
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartPos = useRef({ x: 0, y: 0 });
  const dragStartKey = useRef("");
  const dragWords = useRef<string[]>([]);
  const dragKeys = useRef<string[]>([]);
  const scrollRaf = useRef<number | null>(null);
  const isMobile = useRef(false);
  const wordAnchorEl = useRef<HTMLElement | null>(null);
  const popupJustOpened = useRef(false);

  useEffect(() => {
    isMobile.current = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  }, []);

  // Keep word popup anchored to its word element when the page scrolls
  useEffect(() => {
    const onScroll = () => {
      if (!wordPopup || !wordAnchorEl.current) return;
      const rect = wordAnchorEl.current.getBoundingClientRect();
      setWordPopup((prev) =>
        prev ? { ...prev, anchorPos: { anchorX: rect.left + rect.width / 2, anchorBottom: rect.bottom } } : prev
      );
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [wordPopup]);

  const stopAutoScroll = useCallback(() => {
    if (scrollRaf.current) { cancelAnimationFrame(scrollRaf.current); scrollRaf.current = null; }
  }, []);

  const resetDrag = useCallback(() => {
    phase.current = "idle";
    if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; }
    dragWords.current = [];
    dragKeys.current = [];
    stopAutoScroll();
  }, [stopAutoScroll]);

  const closeAll = useCallback(() => {
    if (popupJustOpened.current) return;
    setWordPopup(null);
    setSelectionPopup(null);
    setDragSelected(new Set());
    resetDrag();
  }, [resetDrag]);

  const lookupWord = useCallback(async (word: string, el: HTMLElement) => {
    const clean = word.replace(/[^a-zA-Z'-]/g, "").toLowerCase();
    if (!clean) return;
    setSelectionPopup(null);
    wordAnchorEl.current = el;
    const rect = el.getBoundingClientRect();
    const anchorPos = { anchorX: rect.left + rect.width / 2, anchorBottom: rect.bottom };

    popupJustOpened.current = true;
    setTimeout(() => { popupJustOpened.current = false; }, 400);

    // Return cached result immediately (no loading state)
    if (wordCache.has(clean)) {
      setWordPopup({ entry: wordCache.get(clean)!, loading: false, anchorEl: el, anchorPos, word: clean });
      return;
    }

    setWordPopup({ entry: null, loading: true, anchorEl: el, anchorPos, word: clean });
    const res = await fetch(`/api/lookup?word=${encodeURIComponent(clean)}`);
    const data = await res.json();
    wordCache.set(clean, data);
    setWordPopup((prev) =>
      prev?.word === clean ? { ...prev, entry: data, loading: false } : prev
    );
  }, []);

  const handleMouseUp = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;
    const text = selection.toString().trim();
    if (text.length < 2 || !text.includes(" ")) return;
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    setWordPopup(null);
    setSelectionPopup({ text, position: { x: rect.left, y: rect.bottom } });
  }, []);

  const updateDragSelection = useCallback((touchX: number, touchY: number) => {
    const el = document.elementFromPoint(touchX, touchY) as HTMLElement | null;
    const wordEl = el?.dataset.key ? el : (el?.closest("[data-key]") as HTMLElement | null);
    if (!wordEl?.dataset.key) return;
    const spans = getAllWordSpans();
    const startIdx = spans.findIndex(s => s.dataset.key === dragStartKey.current);
    const curIdx = spans.findIndex(s => s.dataset.key === wordEl.dataset.key);
    if (startIdx === -1 || curIdx === -1) return;
    const from = Math.min(startIdx, curIdx);
    const to = Math.max(startIdx, curIdx);
    const selected = new Set<string>();
    const words: string[] = [];
    const keys: string[] = [];
    for (let j = from; j <= to; j++) {
      const k = spans[j].dataset.key;
      const w = spans[j].dataset.word;
      if (k && w) { selected.add(k); words.push(w); keys.push(k); }
    }
    dragWords.current = words;
    dragKeys.current = keys;
    setDragSelected(selected);
  }, []);

  // document-level listeners for drag (need passive:false for touchmove)
  useEffect(() => {
    const onMove = (e: TouchEvent) => {
      if (phase.current !== "select") return;
      e.preventDefault();
      const t = e.touches[0];
      updateDragSelection(t.clientX, t.clientY);
      stopAutoScroll();
      const vh = window.innerHeight;
      if (t.clientY < EDGE_ZONE || t.clientY > vh - EDGE_ZONE) {
        const dir = t.clientY < EDGE_ZONE ? -1 : 1;
        const scroll = () => {
          window.scrollBy(0, dir * SCROLL_SPEED);
          updateDragSelection(t.clientX, t.clientY);
          scrollRaf.current = requestAnimationFrame(scroll);
        };
        scrollRaf.current = requestAnimationFrame(scroll);
      }
    };

    const onEnd = (e: TouchEvent) => {
      if (phase.current !== "select") return;
      e.preventDefault();
      stopAutoScroll();
      const words = [...dragWords.current];
      const keys = [...dragKeys.current];
      resetDrag();
      setDragSelected(new Set());

      if (words.length === 1) {
        const el = document.querySelector<HTMLElement>(`[data-key="${keys[0]}"]`);
        if (el) lookupWord(words[0], el);
      } else if (words.length > 1) {
        const text = words.join(" ").trim();
        const t = e.changedTouches[0];
        setWordPopup(null);
        popupJustOpened.current = true;
        setTimeout(() => { popupJustOpened.current = false; }, 400);
        setSelectionPopup({ text, position: { x: t.clientX, y: t.clientY } });
      }
    };

    document.addEventListener("touchmove", onMove, { passive: false });
    document.addEventListener("touchend", onEnd, { capture: true });
    return () => {
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("touchend", onEnd, { capture: true });
    };
  }, [updateDragSelection, stopAutoScroll, resetDrag, lookupWord]);

  const renderParagraph = (text: string, paraIndex: number) => {
    const tokens = text.split(/(\s+)/);
    return tokens.map((token, i) => {
      const isWord = /[a-zA-Z]/.test(token);
      if (!isWord) return <span key={`${paraIndex}-${i}`} style={{ WebkitUserSelect: "none", userSelect: "none" }}>{token}</span>;
      const key = `${paraIndex}-${i}`;
      const isHighlighted = dragSelected.has(key);

      return (
        <span
          key={key}
          data-word={token}
          data-key={key}
          style={{ WebkitUserSelect: "none", userSelect: "none", touchAction: "pan-y" }}
          className={`cursor-pointer rounded transition-colors duration-75 px-0.5 -mx-0.5 ${
            isHighlighted
              ? "bg-amber-300 text-amber-900"
              : "hover:bg-amber-100 hover:text-amber-900 active:bg-amber-200"
          }`}
          onTouchStart={(e) => {
            e.stopPropagation();
            // close popup on first touch of a new word
            if (wordPopup || selectionPopup) {
              closeAll();
              return;
            }
            resetDrag();
            phase.current = "pressing";
            touchStartPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };

            longPressTimer.current = setTimeout(() => {
              if (phase.current !== "pressing") return;
              phase.current = "select";
              dragStartKey.current = key;
              dragWords.current = [token];
              dragKeys.current = [key];
              setDragSelected(new Set([key]));
              if (navigator.vibrate) navigator.vibrate(40);
            }, LONG_PRESS_MS);
          }}
          onTouchMove={(e) => {
            if (phase.current !== "pressing") return;
            const dx = Math.abs(e.touches[0].clientX - touchStartPos.current.x);
            const dy = Math.abs(e.touches[0].clientY - touchStartPos.current.y);
            if (dx > 6 || dy > 6) {
              if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; }
              phase.current = "idle";
            }
          }}
          onTouchEnd={(e) => {
            if (phase.current === "select") return;
            e.preventDefault();
            if (phase.current === "pressing") {
              resetDrag();
              speakWord(token);
            } else {
              resetDrag();
            }
          }}
          onClick={(e) => {
            if (isMobile.current) return; // mobile uses touch handlers only
            e.stopPropagation();
            lookupWord(token, e.currentTarget as HTMLElement);
          }}
        >
          {token}
        </span>
      );
    });
  };

  return (
    <div
      className="min-h-screen bg-[#f8f4ef] flex justify-center px-4 py-12 sm:py-16"
      onClick={(e) => {
        if ((e.nativeEvent as PointerEvent).pointerType === "touch") return;
        closeAll();
      }}
      onMouseUp={handleMouseUp}
      onTouchStart={(e) => {
        const target = e.target as HTMLElement;
        if (!target.closest("[data-key]") && !target.closest("[data-popup]")) {
          // record start position so touchend can decide if this was a tap or scroll
          touchStartPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
      }}
      onTouchEnd={(e) => {
        const target = e.target as HTMLElement;
        if (target.closest("[data-key]") || target.closest("[data-popup]")) return;
        // only close on a tap (< 8px travel), not on a scroll gesture
        const dx = Math.abs(e.changedTouches[0].clientX - touchStartPos.current.x);
        const dy = Math.abs(e.changedTouches[0].clientY - touchStartPos.current.y);
        if (dx < 8 && dy < 8) closeAll();
      }}
    >
      <article className="w-full max-w-[640px]" style={{ WebkitUserSelect: "none", userSelect: "none", WebkitTouchCallout: "none" } as React.CSSProperties}>
        {/* Nav bar */}
        <div className="flex items-center justify-between mb-8 sm:mb-10">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-700 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            {bookTitle}
          </button>
          <p className="text-xs text-zinc-300">{chapterTitle}</p>
        </div>

        <header className="mb-8 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 leading-tight tracking-tight mb-4"
            style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
            {chapterTitle}
          </h1>
          <div className="h-px bg-zinc-200" />
        </header>

        <div className="space-y-5 sm:space-y-6">
          {paragraphs.map((para, i) => (
            <p key={i} className="text-[16px] sm:text-[17px] leading-[1.9] text-zinc-700"
              style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
              {renderParagraph(para, i)}
            </p>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-zinc-200">
          <p className="text-xs text-zinc-400 text-center mb-6">
            <span className="hidden sm:inline">点击查词 · 划选翻译</span>
            <span className="sm:hidden">轻触发音 · 长按划选翻译 · 长按单词查词</span>
          </p>

          {/* Chapter navigation */}
          <div className="flex items-center justify-between gap-4">
            {prevChapter ? (
              <button
                onClick={() => router.push(`/book/${bookId}/${prevChapter.id}`)}
                className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
                <span className="line-clamp-1">{prevChapter.title}</span>
              </button>
            ) : <div />}
            {nextChapter ? (
              <button
                onClick={() => router.push(`/book/${bookId}/${nextChapter.id}`)}
                className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 transition-colors ml-auto"
              >
                <span className="line-clamp-1">{nextChapter.title}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            ) : <div />}
          </div>
        </div>

      </article>

      {wordPopup && (
        <div data-popup="true">
          <WordPopup entry={wordPopup.entry} loading={wordPopup.loading} anchorPos={wordPopup.anchorPos} onClose={closeAll} />
        </div>
      )}
      {selectionPopup && (
        <div data-popup="true">
          <SelectionPopup text={selectionPopup.text} position={selectionPopup.position} onClose={closeAll} />
        </div>
      )}
    </div>
  );
}
