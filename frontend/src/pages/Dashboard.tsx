import { useNavigate } from "react-router-dom";
import type { Book } from "../types/book";
import { useEffect, useState } from "react";
import { request } from "../utils/api";
import { BookCard } from "../components/BookCard";

export function Dashboard() {
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setIsLoading(true);
        setErrorMsg(null);
        const data = await request("/books");
        setBooks(Array.isArray(data) ? data : data.books);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Не удалось загрузить книги";
        setErrorMsg(message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBooks();
  }, []);

  async function handleDelete(id: string) {
    if (!window.confirm("Удалить эту книгу?")) return;
    try {
      await request(`/books/${id}`, { method: "DELETE" });
      setBooks((prev) => prev.filter((book) => book.id !== id));
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Ошибка при удалении";
      setErrorMsg(message);
    }
  }

  return (
    <div className="dashboard-layout">
      {isLoading ? (
        <div className="loader">Загрузка книг...</div>
      ) : errorMsg ? (
        <div className="error-container">
          <p>⚠️ {errorMsg}</p>
          <button
            className="btn-secondary"
            onClick={() => window.location.reload()}
          >
            Попробовать снова
          </button>
        </div>
      ) : books.length === 0 ? (
        <div className="empty-state">
          <h2>У вас пока нет книг</h2>
          <p>Загрузите свою первую PDF-книгу, чтобы начать чтение!</p>
        </div>
      ) : (
        <div className="dashboard-grid">
          {books.map((book) => (
            <BookCard
              key={book.id}
              id={book.id}
              title={book.title}
              author={book.author}
              onRead={() => navigate(`/reader/${book.id}`)}
              onDelete={() => handleDelete(book.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
