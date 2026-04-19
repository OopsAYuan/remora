import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const word = req.nextUrl.searchParams.get("word");
  if (!word) return NextResponse.json({ error: "missing word" }, { status: 400 });

  const url = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(word)}&type=2`;
  try {
    const upstream = await fetch(url);
    if (!upstream.ok) throw new Error("upstream failed");
    const buffer = await upstream.arrayBuffer();
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return NextResponse.json({ error: "audio fetch failed" }, { status: 502 });
  }
}
