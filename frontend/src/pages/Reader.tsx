import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { request } from "../utils/api";
import { useParams } from "react-router-dom";
import type { Book } from "../types/book";
import { Document, Page } from "react-pdf";
import { pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import type { OnItemClickArgs } from "react-pdf/src/shared/types.js";
import type { Bookmark } from "../types/bookmark";
import { BookmarkSidebar } from "../components/BookmarkSidebar";
import { Modal } from "../components/Modal";
import { connectSocket, disconnectSocket, getSocket } from "../utils/socket";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

type ReaderWithPage = {
  userId: string;
  email: string;
  currentPage?: number;
};

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

  const [searchParams] = useSearchParams();
  const roomId = searchParams.get("room");
  const [activeReadersWithPages, setActiveReadersWithPages] = useState<
    ReaderWithPage[]
  >([]);
  const [isReadersPanelOpen, setIsReadersPanelOpen] = useState<boolean>(false);


  useEffect(() => {
    connectSocket();
    return () => disconnectSocket();
  }, []);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !roomId) return;

    // Сервер прислал готовый список - добавляем каждому поле currentPage
    const handleRoomUsers = (users: { userId: string; email: string }[]) =>
      setActiveReadersWithPages(
        users.map((u) => ({ ...u, currentPage: undefined })),
      );

    // Кто-то зашёл - добавляем с неизвестной страницей
    const handleUserJoined = (user: { userId: string; email: string }) =>
      setActiveReadersWithPages((prev) =>
        prev.some((u) => u.userId === user.userId)
          ? prev
          : [...prev, { ...user, currentPage: undefined }],
      );

    // Кто-то вышел - убираем из списка
    const handleUserLeft = (user: { userId: string; email: string }) =>
      setActiveReadersWithPages((prev) =>
        prev.filter((u) => u.userId !== user.userId),
      );

    // Друг перелистнул страницу - обновляем ТОЛЬКО его запись
    const handlePageChange = (data: {
      user: { userId: string; email: string };
      pageNumber: number;
    }) => {
      setActiveReadersWithPages((prev) =>
        prev.map((u) =>
          u.userId === data.user.userId
            ? { ...u, currentPage: data.pageNumber }
            : u,
        )
      );
    }

    socket.on("room-users", handleRoomUsers);
    socket.on("user-joined", handleUserJoined);
    socket.on("user-left", handleUserLeft);
    socket.on("page-change", handlePageChange);

    // Заходим в комнату
    socket.emit("join-room", roomId);

    return () => {
      socket.off("room-users", handleRoomUsers);
      socket.off("user-joined", handleUserJoined);
      socket.off("user-left", handleUserLeft);
      socket.off("page-change", handlePageChange);
      socket.emit("leave-room", roomId);
    };
  }, [roomId]);

  // Адаптивная ширина страницы
  const [pageWidth, setPageWidth] = useState<number>(600);
  const pdfWrapperRef = useRef<HTMLDivElement | null>(null);

  const navigate = useNavigate();
  const { bookId } = useParams<{ bookId: string }>();

  const timeRef = useRef<number | null>(null);

  // Пересчёт ширины при монтировании и при ресайзе окна
  useEffect(() => {
    function updatePageWidth() {
      const wrapper = pdfWrapperRef.current;
      if (!wrapper) return;

      // Берём ФАКТИЧЕСКИЕ горизонтальные паддинги обёртки
      const styles = window.getComputedStyle(wrapper);
      const horizontalPadding =
        parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight);

      const available = wrapper.clientWidth - horizontalPadding;
      setPageWidth(Math.max(280, Math.min(available, 900)));
    }

    updatePageWidth();
    window.addEventListener("resize", updatePageWidth);
    return () => window.removeEventListener("resize", updatePageWidth);
  }, []);

  // Загрузка данных книги + прогресса
  useEffect(() => {
    const fetchBookData = async () => {
      try {
        const book = (await request(`/books/${bookId}`)) as Book;
        if (book?.pdfUrl) {
          setBookTitle(book.title);
          setFileUrl(`http://localhost:3000/${book.pdfUrl}`);

          const { currentPage } = await request(`/books/${bookId}/progress`);
          setPageNumber(currentPage);
          setInputPage(String(currentPage));
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
        const data = (await request(
          `/books/${bookId}/bookmarks`,
        )) as Bookmark[];
        if (data) {
          setBookmarks(data);
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Не удалось загрузить закладки";
        console.error(message);
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
        console.error("Не удалось сохранить прогресс:", err);
      }
    }, 2000);
  }

  function sendPageChangeNotification(newPage: number) {
    const socket = getSocket();
    if (socket && roomId !== null)
      socket.emit("page-change", { roomId, pageNumber: newPage });
  }

  function handlePageInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setInputPage(value);

    const pageNum = parseInt(value, 10);

    if (!isNaN(pageNum) && numPages && pageNum >= 1 && pageNum <= numPages) {
      setPageNumber(pageNum);
      saveProgressDelayed(pageNum);
      sendPageChangeNotification(pageNum);
    }
  }

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  function onDocumentLoadError(error: Error) {
    setErrorMsg("Ошибка загрузки PDF: " + error.message);
    console.error("PDF Error:", error);
  }

  function handlePrevPage() {
    if (pageNumber > 1) {
      setPageNumber((prev) => prev - 1);
      setInputPage((pageNumber - 1).toString());
      saveProgressDelayed(pageNumber - 1);
      sendPageChangeNotification(pageNumber - 1);
    }
  }

  function handleNextPage() {
    if (numPages && pageNumber < numPages) {
      setPageNumber((prev) => prev + 1);
      setInputPage((pageNumber + 1).toString());
      saveProgressDelayed(pageNumber + 1);
      sendPageChangeNotification(pageNumber + 1);
    }
  }

  function onDocumentClick(onDocProps: OnItemClickArgs) {
    setPageNumber(onDocProps.pageNumber);
    setInputPage(onDocProps.pageNumber.toString());
    sendPageChangeNotification(onDocProps.pageNumber);
  }

  async function handleAddBookmark() {
    const existingBookmark = bookmarks.find((b) => b.pageNumber === pageNumber);
    if (existingBookmark) {
      alert("На этой странице уже есть закладка");
      return;
    }

    setIsAddingBookmark(true);

    try {
      const newBookmark = await request(`/books/${bookId}/bookmarks`, {
        method: "POST",
        body: {
          pageNumber: pageNumber,
          note: noteDraft || null,
        },
      });

      setBookmarks((prev) => [newBookmark, ...prev]);
      setIsNoteModalOpen(false);
      setNoteDraft("");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Не удалось добавить закладку";
      alert(message);
    } finally {
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
        ← <span className="btn-label">Назад</span>
      </button>

      <button
        className="btn-secondary"
        onClick={() => setIsSidebarOpen((prev) => !prev)}
      >
        🔖 <span className="btn-label">Закладки</span>
      </button>

      <button
        className="btn-secondary"
        onClick={() => setIsNoteModalOpen(true)}
      >
        + 🔖
      </button>

      <div className="reader-title">{bookTitle}</div>

      <div className="reader-controls">
        <button
          className="btn-secondary"
          onClick={handlePrevPage}
          disabled={pageNumber <= 1 || isLoading}
        >
          ← <span className="btn-label">Пред.</span>
        </button>

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
          <span className="btn-label">След.</span> →
        </button>
      </div>
    </div>

    {/* ref для измерения ширины */}
    <div className="pdf-wrapper" ref={pdfWrapperRef}>
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
            width={pageWidth}
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
      onBookmarkDelete={(id) => {
        setBookmarks((prev) => prev.filter((b) => b.id !== id));
      }}
    />

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
          maxLength={250}
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

    {/* Плавающий пузырь: кто сейчас читает */}
    {roomId && (
      <button
        className="readers-bubble"
        onClick={() => setIsReadersPanelOpen((prev) => !prev)}
        title="Кто сейчас читает"
      >
        <div className="bubble-avatars">
          <span className="presence-avatar me">Я</span>
          {activeReadersWithPages.slice(0, 2).map((reader) => (
            <span key={reader.userId} className="presence-avatar">
              {reader.email[0].toUpperCase()}
            </span>
          ))}
        </div>
        <span className="bubble-count">
          👥 {activeReadersWithPages.length + 1}
        </span>
      </button>
    )}

    {/* Подложка: клик вне панели закрывает её */}
    {isReadersPanelOpen && (
      <div
        className="readers-panel-overlay"
        onClick={() => setIsReadersPanelOpen(false)}
      />
    )}

    {/* Боковая панель читателей */}
    {roomId && (
      <div className={`readers-panel ${isReadersPanelOpen ? "open" : ""}`}>
        <div className="readers-panel-header">
          <h3>👥 Читают сейчас</h3>
          <button
            className="panel-close"
            onClick={() => setIsReadersPanelOpen(false)}
          >
            ✕
          </button>
        </div>

        {/* Список читателей */}
        <div className="readers-panel-list">
          {/* Ты сам */}
          <div className="reader-row me">
            <span className="presence-avatar me">Я</span>
            <div className="reader-row-info">
              <span className="reader-row-email">Ты</span>
              <span className="reader-row-page">стр. {pageNumber}</span>
            </div>
          </div>

          {/* Остальные в комнате */}
          {activeReadersWithPages.map((reader) => (
            <div key={reader.userId} className="reader-row">
              <span className="presence-avatar">
                {reader.email[0].toUpperCase()}
              </span>
              <div className="reader-row-info">
                <span className="reader-row-email">{reader.email}</span>
                <span className="reader-row-page">
                  {reader.currentPage
                    ? `стр. ${reader.currentPage}`
                    : "страница неизвестна"}
                </span>
              </div>
              {reader.currentPage && (
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setPageNumber(reader.currentPage!);
                    setInputPage(String(reader.currentPage));
                  }}
                >
                  Перейти
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);
}
