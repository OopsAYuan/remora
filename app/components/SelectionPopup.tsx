"use client";

import { useState, useEffect } from "react";
import { translateText } from "@/lib/translate";

interface SelectionPopupProps {
  text: string;
  position: { x: number; y: number };
  onClose: () => void;
}

export default function SelectionPopup({ text, position, onClose }: SelectionPopupProps) {
  const [translation, setTranslation] = useState("");
  const [loading, setLoading] = useState(true);
  const [style, setStyle] = useState<React.CSSProperties>({ position: "fixed", left: -9999, top: -9999, zIndex: 50 });
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const isMobile = window.innerWidth < 640;
    setMobile(isMobile);
    if (isMobile) {
      setStyle({
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 50,
        borderRadius: "16px 16px 0 0",
        width: "100%",
      });
    } else {
      const width = 300;
      const left = Math.min(Math.max(position.x, 8), window.innerWidth - width - 8);
      setStyle({ position: "fixed", left, top: position.y + 8, zIndex: 50 });
    }
  }, [position.x, position.y]);

  useEffect(() => {
    setLoading(true);
    setTranslation("");
    translateText(text)
      .then((t) => setTranslation(t))
      .catch(() => setTranslation("翻译失败"))
      .finally(() => setLoading(false));
  }, [text]);

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
        onTouchStart={(e) => { e.stopPropagation(); e.nativeEvent.stopImmediatePropagation(); }}
        onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); e.nativeEvent.stopImmediatePropagation(); onClose(); }}
      />
      <div
        style={style}
        className="w-full sm:w-[300px] bg-white shadow-2xl border border-zinc-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => { e.stopPropagation(); e.nativeEvent.stopImmediatePropagation(); }}
        onTouchEnd={(e) => { e.stopPropagation(); e.nativeEvent.stopImmediatePropagation(); }}
      >
        {mobile && (
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-zinc-200" />
          </div>
        )}

        <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-zinc-100">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">翻译</span>
          <button
            onClick={onClose}
            onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); e.nativeEvent.stopImmediatePropagation(); onClose(); }}
            className="text-zinc-300 hover:text-zinc-600 active:text-zinc-600 transition-colors text-xl leading-none p-1 -m-1"
          >
            ×
          </button>
        </div>

        <div className="px-4 py-3 space-y-2 pb-safe">
          <p className="text-xs text-zinc-400 leading-snug line-clamp-3 italic">"{text}"</p>
          {loading ? (
            <p className="text-sm text-zinc-400">翻译中…</p>
          ) : (
            <p className="text-sm text-zinc-800 leading-relaxed">{translation}</p>
          )}
        </div>
      </div>
    </>
  );
}
