export const CATEGORIES = [
  { id: "literature", label: "文学", color: "#c9956a" },
  { id: "vocabulary", label: "词汇", color: "#6a9fc9" },
  { id: "travel",     label: "游记", color: "#6ac995" },
  { id: "science",    label: "科技", color: "#956ac9" },
  { id: "news",       label: "新闻", color: "#c96a6a" },
  { id: "business",   label: "商业", color: "#c9b86a" },
  { id: "other",      label: "其他", color: "#808080" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export function getCategory(id: string) {
  return CATEGORIES.find((c) => c.id === id);
}
