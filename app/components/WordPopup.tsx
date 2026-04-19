"use client";

interface Definition {
  pos: string;
  meaning: string;
  example?: string;
}

interface WordEntry {
  word: string;
  phonetic: string;
  audio: string;
  chineseTranslation?: string;
  definitions: Definition[];
}

interface WordPopupProps {
  entry: WordEntry | null;
  loading: boolean;
  anchorPos: { anchorX: number; anchorBottom: number };
  onClose: () => void;
}

export const POPUP_WIDTH = 272;

function speakEntry(word: string) {
  if (!("speechSynthesis" in window)) return;
  const synth = window.speechSynthesis;
  if (synth.speaking || synth.pending) synth.cancel();
  const utt = new SpeechSynthesisUtterance(word);
  utt.lang = "en-US";
  utt.rate = 0.9;
  synth.speak(utt);
}

export default function WordPopup({ entry, loading, anchorPos, onClose }: WordPopupProps) {
  const { anchorX, anchorBottom } = anchorPos;
  const left = Math.min(Math.max(anchorX - POPUP_WIDTH / 2, 8), window.innerWidth - POPUP_WIDTH - 8);
  const top = anchorBottom + 10;
  const triangleLeft = Math.min(Math.max(anchorX - left - 6, 10), POPUP_WIDTH - 22);

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
        onTouchStart={(e) => { e.stopPropagation(); e.nativeEvent.stopImmediatePropagation(); }}
        onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); e.nativeEvent.stopImmediatePropagation(); onClose(); }}
      />
      <div
        style={{ position: "fixed", left, top, width: POPUP_WIDTH, zIndex: 50 }}
        className="bg-white rounded-xl shadow-2xl border border-zinc-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => { e.stopPropagation(); e.nativeEvent.stopImmediatePropagation(); }}
        onTouchEnd={(e) => { e.stopPropagation(); e.nativeEvent.stopImmediatePropagation(); }}
      >
        <div
          style={{ left: triangleLeft }}
          className="absolute -top-[6px] w-3 h-3 bg-white border-l border-t border-zinc-100 rotate-45"
        />

        <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-zinc-100">
          <div className="flex items-center gap-2 flex-wrap">
            {loading ? (
              <span className="text-sm text-zinc-400">查询中…</span>
            ) : (
              <>
                <span className="font-semibold text-zinc-900 text-base">{entry?.word}</span>
                {entry?.phonetic && (
                  <span className="text-xs text-zinc-400 font-mono">{entry.phonetic}</span>
                )}
                <button
                  onClick={() => entry?.word && speakEntry(entry.word)}
                  onTouchEnd={(e) => { e.stopPropagation(); e.nativeEvent.stopImmediatePropagation(); entry?.word && speakEntry(entry.word); }}
                  className="text-zinc-400 hover:text-zinc-700 active:text-zinc-700 transition-colors p-1 -m-1"
                  title="播放发音"
                >
                  <SpeakerIcon />
                </button>
              </>
            )}
          </div>
          <button
            onClick={onClose}
            onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); e.nativeEvent.stopImmediatePropagation(); onClose(); }}
            className="text-zinc-300 hover:text-zinc-600 active:text-zinc-600 transition-colors text-xl leading-none p-1 -m-1 ml-2"
          >
            ×
          </button>
        </div>

        {!loading && entry && (
          <div className="px-4 py-3 space-y-2">
            {entry.chineseTranslation && (
              <p className="text-sm font-medium text-zinc-800 leading-snug border-b border-zinc-50 pb-2">
                {entry.chineseTranslation}
              </p>
            )}
            {entry.definitions.map((def, i) => (
              <div key={i}>
                <div className="flex items-start gap-2">
                  {def.pos !== "—" && (
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-600 bg-amber-50 rounded px-1 py-0.5 mt-0.5 shrink-0">
                      {def.pos}
                    </span>
                  )}
                  <span className="text-sm text-zinc-700 leading-snug">{def.meaning}</span>
                </div>
                {def.example && (
                  <p className="text-xs text-zinc-400 italic mt-1 leading-snug">"{def.example}"</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function SpeakerIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  );
}
