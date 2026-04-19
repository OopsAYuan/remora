import { NextRequest, NextResponse } from "next/server";

async function googleTranslate(text: string): Promise<string> {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=zh-CN&dt=t&q=${encodeURIComponent(text)}`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error("google failed");
  const data = await res.json();
  // response is [[["translated", "original", ...], ...], ...]
  const translated = (data[0] as [string, string][])
    .map((item) => item[0])
    .filter(Boolean)
    .join("");
  return translated;
}

async function myMemoryTranslate(text: string): Promise<string> {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|zh`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error("mymemory failed");
  const data = await res.json();
  return data?.responseData?.translatedText ?? "";
}

export async function POST(req: NextRequest) {
  const { text } = await req.json();
  if (!text?.trim()) return NextResponse.json({ error: "missing text" }, { status: 400 });

  // try Google first, fall back to MyMemory
  try {
    const translation = await googleTranslate(text);
    return NextResponse.json({ translation });
  } catch {
    try {
      const translation = await myMemoryTranslate(text);
      return NextResponse.json({ translation });
    } catch {
      return NextResponse.json({ error: "translation failed" }, { status: 502 });
    }
  }
}
