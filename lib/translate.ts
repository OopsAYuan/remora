/**
 * Client-side translation — calls APIs directly from the browser.
 * Google Translate (gtx) and MyMemory both support CORS.
 */
export async function translateText(text: string): Promise<string> {
  // Primary: Google Translate unofficial gtx endpoint (CORS: *)
  try {
    const url =
      `https://translate.googleapis.com/translate_a/single` +
      `?client=gtx&sl=en&tl=zh-CN&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("gtx failed");
    const data = await res.json();
    const translated = (data[0] as [string, string][])
      .map((item) => item[0])
      .filter(Boolean)
      .join("");
    if (translated) return translated;
    throw new Error("empty");
  } catch {
    // Fallback: MyMemory (also CORS-friendly)
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|zh`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("mymemory failed");
    const data = await res.json();
    const result = data?.responseData?.translatedText;
    if (result && result !== "NO QUERY SPECIFIED") return result;
    throw new Error("mymemory empty");
  }
}
