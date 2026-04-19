export interface UserChapter {
  id: string;
  title: string;
  text: string;
}

export interface UserBook {
  id: string;
  title: string;
  author: string;
  description: string;
  category: string;
  colorIndex: number;
  chapters: UserChapter[];
  createdAt: number;
}

export const COVER_PALETTE = [
  { coverColor: "#3d2b1f", accentColor: "#c9956a" },
  { coverColor: "#1a2d3d", accentColor: "#6a9fc9" },
  { coverColor: "#1f3d2b", accentColor: "#6ac995" },
  { coverColor: "#3d1f2b", accentColor: "#c96a95" },
  { coverColor: "#2b1f3d", accentColor: "#956ac9" },
  { coverColor: "#2d2a1a", accentColor: "#c9b86a" },
];

const KEY = "remora_user_books";

function save(books: UserBook[]) {
  localStorage.setItem(KEY, JSON.stringify(books));
}

export function getUserBooks(): UserBook[] {
  if (typeof window === "undefined") return [];
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw: any[] = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    // Migrate old single-text format → new chapters format
    return raw.map((b) => {
      if (!Array.isArray(b.chapters)) {
        return {
          id: b.id,
          title: b.title ?? "",
          author: b.author ?? "",
          description: b.description ?? "",
          category: b.category ?? "other",
          colorIndex: b.colorIndex ?? 0,
          createdAt: b.createdAt ?? Date.now(),
          chapters: b.text
            ? [{ id: `ch_legacy_${b.id}`, title: b.title ?? "正文", text: b.text }]
            : [],
        } satisfies UserBook;
      }
      return { ...b, colorIndex: b.colorIndex ?? 0, category: b.category ?? "other" } as UserBook;
    });
  } catch {
    return [];
  }
}

export function getUserBook(id: string): UserBook | undefined {
  return getUserBooks().find((b) => b.id === id);
}

export function addUserBook(data: Omit<UserBook, "id" | "createdAt">): UserBook {
  const book: UserBook = {
    id: `u_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    ...data,
    createdAt: Date.now(),
  };
  const books = getUserBooks();
  books.unshift(book);
  save(books);
  return book;
}

export function addChapterToBook(
  bookId: string,
  chapter: Omit<UserChapter, "id">
): UserChapter {
  const books = getUserBooks();
  const book = books.find((b) => b.id === bookId);
  if (!book) throw new Error("book not found");
  const ch: UserChapter = {
    id: `ch_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
    ...chapter,
  };
  book.chapters.push(ch);
  save(books);
  return ch;
}

export function removeChapterFromBook(bookId: string, chapterId: string): void {
  const books = getUserBooks();
  const book = books.find((b) => b.id === bookId);
  if (!book) return;
  book.chapters = book.chapters.filter((c) => c.id !== chapterId);
  save(books);
}

export function removeUserBook(id: string): void {
  save(getUserBooks().filter((b) => b.id !== id));
}

export function updateUserBook(
  id: string,
  data: Partial<Pick<UserBook, "title" | "author" | "description" | "category" | "colorIndex">>
): void {
  const books = getUserBooks();
  const book = books.find((b) => b.id === id);
  if (!book) return;
  Object.assign(book, data);
  save(books);
}

export function updateChapter(
  bookId: string,
  chapterId: string,
  data: Partial<Pick<UserChapter, "title" | "text">>
): void {
  const books = getUserBooks();
  const book = books.find((b) => b.id === bookId);
  if (!book) return;
  const ch = book.chapters.find((c) => c.id === chapterId);
  if (!ch) return;
  Object.assign(ch, data);
  save(books);
}

export function moveChapter(bookId: string, fromIndex: number, toIndex: number): void {
  const books = getUserBooks();
  const book = books.find((b) => b.id === bookId);
  if (!book) return;
  const chs = [...book.chapters];
  const [moved] = chs.splice(fromIndex, 1);
  chs.splice(toIndex, 0, moved);
  book.chapters = chs;
  save(books);
}

export function parseTextToParagraphs(text: string): string[] {
  return text
    .split(/\n\n+/)
    .map((p) => p.replace(/\n/g, " ").trim())
    .filter((p) => p.length > 0);
}

export function coverColorForBook(book: { colorIndex?: number }) {
  return COVER_PALETTE[(book.colorIndex ?? 0) % COVER_PALETTE.length];
}

export function exportBooksAsJSON(): void {
  const books = getUserBooks();
  const blob = new Blob([JSON.stringify(books, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `remora-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importBooksFromJSON(json: string): number {
  const data = JSON.parse(json) as UserBook[];
  if (!Array.isArray(data)) throw new Error("格式错误");
  const existing = getUserBooks();
  const existingIds = new Set(existing.map((b) => b.id));
  const toAdd = data.filter((b) => b.id && !existingIds.has(b.id));
  save([...toAdd, ...existing]);
  return toAdd.length;
}
