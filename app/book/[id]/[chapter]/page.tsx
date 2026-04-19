import { getChapter, BOOKS } from "@/lib/content";
import Reader from "@/app/components/Reader";
import UserChapterPage from "@/app/components/UserChapterPage";

interface Props {
  params: Promise<{ id: string; chapter: string }>;
}

export function generateStaticParams() {
  const paths: { id: string; chapter: string }[] = [];
  for (const book of BOOKS) {
    for (const chapter of book.chapters) {
      paths.push({ id: book.id, chapter: chapter.id });
    }
  }
  return paths;
}

export default async function ChapterPage({ params }: Props) {
  const { id, chapter: chapterId } = await params;
  const result = getChapter(id, chapterId);
  if (!result) return <UserChapterPage bookId={id} chapterId={chapterId} />;

  const { book, chapter, index } = result;
  const prevChapter = index > 0 ? book.chapters[index - 1] : null;
  const nextChapter = index < book.chapters.length - 1 ? book.chapters[index + 1] : null;

  return (
    <Reader
      bookId={book.id}
      chapterId={chapter.id}
      bookTitle={book.title}
      chapterTitle={chapter.title}
      paragraphs={chapter.paragraphs}
      prevChapter={prevChapter ? { id: prevChapter.id, title: prevChapter.title } : null}
      nextChapter={nextChapter ? { id: nextChapter.id, title: nextChapter.title } : null}
    />
  );
}
