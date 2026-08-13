import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { request } from "../utils/api";
import { useParams } from "react-router-dom";
import type { Book } from "../types/book";
import { Document, Page } from "react-pdf";
import { pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { useRef } from "react";
import type { OnItemClickArgs } from "react-pdf/src/shared/types.js";
import type { Bookmark } from "../types/bookmark";
import { BookmarkSidebar } from "../components/BookmarkSidebar";
import { Modal } from "../components/Modal";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export function Reader() {
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [bookTitle, setBookTitle] = useState<string>("Загрузка...");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [inputPage, setInputPage] = useState<string>("1");

  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isAddingBookmark, setIsAddingBookmark] = useState<boolean>(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState<boolean>(false);
  const [noteDraft, setNoteDraft] = useState<string>("");

  const navigate = useNavigate();
  const { bookId } = useParams<{ bookId: string }>(); // Деструктуризация

  const timeRef = useRef<number | null>(null);

  // Загрузка данных книги
  useEffect(() => {
    const fetchBookData = async () => {
      try {
        const book = (await request(`/books/${bookId}`)) as Book;
        if (book?.pdfUrl) {
          setBookTitle(book.title);
          setFileUrl(`http://localhost:3000/${book.pdfUrl}`);

          // Подгрузка прогресса
          const { currentPage } = await request(`/books/${bookId}/progress`);
          setPageNumber(currentPage);
          setInputPage(currentPage);
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Не удалось загрузить книгу";
        setErrorMsg(message);
      } finally {
        setIsLoading(false);
      }
    };

    if (bookId) fetchBookData();

    return () => {
      if (timeRef.current) {
        clearTimeout(timeRef.current);
      }
    };
  }, [bookId]);

  // Загрузка закладок книги
  useEffect(() => {
    const fetchBookmarkData = async () => {
      try {
        const bookmarks = (await request(
          `/books/${bookId}/bookmarks`,
        )) as Bookmark[];
        if (bookmarks) {
          setBookmarks(bookmarks);
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Не удалось загрузить закладки";
        setErrorMsg(message);
      }
    };
    if (bookId) fetchBookmarkData();
  }, [bookId]);

  async function saveProgressDelayed(newPageNumber: number) {
    if (timeRef.current) {
      clearTimeout(timeRef.current);
    }

    timeRef.current = setTimeout(async () => {
      try {
        await request(`/books/${bookId}/progress`, {
          method: "POST",
          body: { currentPage: newPageNumber },
        });
      } catch (err) {
        // Ошибку просто логируем, чтобы не ломать чтение
        console.error("Не удалось сохранить прогресс:", err);
      }
    }, 2000); // 2 секунды задержка
  }

  function handlePageInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setInputPage(value);

    const pageNum = parseInt(value, 10);

    // Проверяем, что число валидно и в пределах диапазона
    if (!isNaN(pageNum) && numPages && pageNum >= 1 && pageNum <= numPages) {
      setPageNumber(pageNum);
    }

    saveProgressDelayed(pageNum);
  }

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  function onDocumentLoadError(error: Error) {
    setErrorMsg("Ошибка загрузки PDF: " + error.message);
    console.error("PDF Error:", error);
  }

  function handlePrevPage() {
    if (pageNumber > 1) setPageNumber((prev) => prev - 1);
    setInputPage((pageNumber - 1).toString());
    saveProgressDelayed(pageNumber - 1);
  }

  function handleNextPage() {
    if (numPages && pageNumber < numPages) setPageNumber((prev) => prev + 1);
    setInputPage((pageNumber + 1).toString());
    saveProgressDelayed(pageNumber + 1);
  }

  function onDocumentClick(onDocProps: OnItemClickArgs) {
    setPageNumber(onDocProps.pageNumber);
    setInputPage(onDocProps.pageNumber.toString());
  }

  async function handleAddBookmark() {
    // 1. Защита от дублей: проверяем, есть ли уже закладка на текущей странице
    const existingBookmark = bookmarks.find((b) => b.pageNumber === pageNumber);
    if (existingBookmark) {
      alert("На этой странице уже есть закладка");
      return;
    }

    // 2. Блокируем кнопку во время запроса
    setIsAddingBookmark(true);

    try {
      // 3. Отправляем POST запрос на бэкенд
      const newBookmark = await request(`/books/${bookId}/bookmarks`, {
        method: "POST",
        body: {
          pageNumber: pageNumber,
          note: noteDraft || null, // если заметка пустая, отправляем null
        },
      });

      // 4. При успехе: добавляем закладку в стейт
      setBookmarks((prev) => [newBookmark, ...prev]);

      // 5. Закрываем модалку и очищаем поле заметки
      setIsNoteModalOpen(false);
      setNoteDraft("");
    } catch (err: unknown) {
      // 6. При ошибке: показываем сообщение
      const message =
        err instanceof Error ? err.message : "Не удалось добавить закладку";
      alert(message);
    } finally {
      // 7. Разблокируем кнопку в любом случае
      setIsAddingBookmark(false);
    }
  }

  return (
    <div className="reader-container">
      <div className="reader-header">
        <button
          className="btn-secondary"
          onClick={() => navigate("/dashboard")}
        >
          ← Назад
        </button>

        <button
          className="btn-secondary"
          onClick={() => setIsSidebarOpen((prev) => !prev)}
        >
          🔖 Закладки
        </button>

        <button
          className="btn-secondary"
          onClick={() => setIsNoteModalOpen(true)}
        >
          Добавить 🔖
        </button>

        <div className="reader-title">{bookTitle}</div>

        <div className="reader-controls">
          <button
            className="btn-secondary"
            onClick={handlePrevPage}
            disabled={pageNumber <= 1 || isLoading}
          >
            ← Пред.
          </button>

          {/* Поле ввода страницы */}
          <div className="page-input-wrapper">
            <input
              type="number"
              min={1}
              max={numPages || 999}
              value={inputPage}
              onChange={handlePageInputChange}
              className="page-number-input"
              disabled={!numPages}
            />
            <span className="page-separator">/</span>
            <span className="total-pages">{numPages || "?"}</span>
          </div>

          <button
            className="btn-secondary"
            onClick={handleNextPage}
            disabled={!numPages || pageNumber >= numPages || isLoading}
          >
            След. →
          </button>
        </div>
      </div>
      {/* Контент — условный рендеринг внутри одного блока */}
      <div className="pdf-wrapper">
        {isLoading ? (
          <div className="loader">Загружаем книгу...</div>
        ) : errorMsg ? (
          <div className="error-container">
            <p>⚠️ {errorMsg}</p>
            <button
              className="btn-primary"
              onClick={() => navigate("/dashboard")}
            >
              Вернуться к книгам
            </button>
          </div>
        ) : fileUrl ? (
          <Document
            file={fileUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            onItemClick={onDocumentClick}
          >
            <Page
              pageNumber={pageNumber}
              width={Math.min(600, window.innerWidth - 40)}
              height={window.innerHeight}
              renderTextLayer={true}
            />
          </Document>
        ) : (
          <div className="error-container">
            <p>Ссылка на файл не найдена</p>
          </div>
        )}
      </div>
      <BookmarkSidebar
        bookmarks={bookmarks}
        isOpen={isSidebarOpen}
        currentPage={pageNumber}
        onClose={() => setIsSidebarOpen(false)}
        onBookmarkClick={(page) => {
          setPageNumber(page);
          setInputPage(page.toString());
          setIsSidebarOpen(false);
        }}
        onBookmarkDelete={async (id) => {
          // TODO: здесь будет логика удаления (DELETE запрос)
          setBookmarks((prev) => prev.filter((b) => b.id !== id));

          await request(`/books/${bookId}/bookmarks/${id}`, {
            method: "DELETE",
          });
        }}
      />

      {/* Модальное окно для добавления закладки */}
      <Modal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        title="Добавить закладку"
      >
        <div className="form-group">
          <label htmlFor="bookmark-note">Заметка (опционально)</label>
          <textarea
            id="bookmark-note"
            className="form-input"
            value={noteDraft}
            onChange={(e) => setNoteDraft(e.target.value)}
            placeholder="Например: самый интересный момент в главе"
            rows={3}
            maxLength={100}
            style={{ resize: "vertical" }}
          />
        </div>

        <p
          style={{
            color: "var(--color-text-light, #718096)",
            fontSize: "0.9rem",
            marginBottom: "20px",
          }}
        >
          Страница: <strong>{pageNumber}</strong>
        </p>

        <div
          style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}
        >
          <button
            className="btn-secondary"
            onClick={() => setIsNoteModalOpen(false)}
          >
            Отмена
          </button>
          <button
            className="btn-primary"
            onClick={handleAddBookmark}
            disabled={isAddingBookmark}
          >
            {isAddingBookmark ? "Сохранение..." : "Сохранить"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
