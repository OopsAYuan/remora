import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const word = req.nextUrl.searchParams.get("word")?.toLowerCase().trim();
  if (!word) return NextResponse.json({ error: "missing word" }, { status: 400 });

  try {
    const res = await fetch(
      `https://dict.youdao.com/jsonapi?q=${encodeURIComponent(word)}`,
      { next: { revalidate: 86400 } }
    );
    if (!res.ok) throw new Error("youdao failed");
    const data = await res.json();

    const ecWord = data?.ec?.word?.[0];

    // phonetic — prefer US
    const phonetic = ecWord?.usphone ?? ecWord?.ukphone ?? "";

    // audio
    const audio = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(word)}&type=2`;

    // definitions — each tr[0].l.i is an array of strings like ["adj. 短暂的；短命的"]
    const definitions: { pos: string; meaning: string; example?: string }[] = [];
    const trs: { tr: { l: { i: string[] } }[] }[] = ecWord?.trs ?? [];

    for (const tr of trs.slice(0, 4)) {
      const raw = tr?.tr?.[0]?.l?.i?.[0] ?? "";
      if (!raw) continue;
      // raw is like "adj. 短暂的；短命的" or "n. 短命植物"
      const match = raw.match(/^([a-z]+\.\s*)?(.+)$/);
      const pos = match?.[1]?.trim().replace(/\.$/, "") ?? "";
      const meaning = match?.[2]?.trim() ?? raw;
      definitions.push({ pos, meaning });
    }

    // example sentence from blng_sents_part
    const sentencePairs = data?.blng_sents_part?.["sentence-pair"] ?? [];
    if (sentencePairs.length > 0 && definitions.length > 0) {
      const s = sentencePairs[0];
      const eng = (s?.["sentence-eng"] ?? s?.sentence ?? "").replace(/<[^>]+>/g, "").trim();
      const zh = s?.["sentence-translation"] ?? "";
      if (eng) definitions[0].example = zh ? `${eng}　${zh}` : eng;
    }

    // Chinese translation summary from web_trans
    const webTrans = data?.web_trans?.["web-translation"]?.[0];
    const chineseTranslation = webTrans?.trans
      ?.slice(0, 3)
      .map((t: { value: string }) => t.value)
      .filter(Boolean)
      .join("、") ?? "";

    if (definitions.length === 0) {
      definitions.push({ pos: "—", meaning: "未找到释义" });
    }

    return NextResponse.json({
      word,
      phonetic: phonetic ? `/${phonetic}/` : "",
      audio,
      chineseTranslation,
      definitions,
    });
  } catch {
    return NextResponse.json({
      word,
      phonetic: "",
      audio: "",
      chineseTranslation: "",
      definitions: [{ pos: "—", meaning: "查询失败，请重试" }],
    });
  }
}
