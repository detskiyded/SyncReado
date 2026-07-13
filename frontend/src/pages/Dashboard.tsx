import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { Book } from "../types/book";
import { useEffect, useState } from "react";
import { request } from "../utils/api";
import { BookCard } from "../components/BookCard";

export default function Dashboard() {
  const { logout } = useAuth();
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

        setBooks(data);
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

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  async function handleDelete(id: string) {
    if (!window.confirm("You sure you want to delete this book?")) return;

    try {
      await request(`/books/${id}`, { method: "DELETE" });
      setBooks((prev) => prev.filter((book) => book.id !== id));
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Не удалось загрузить книги";
      setErrorMsg(message);
    }
  }

    return (
    <div className="dashboard-layout">
      {/* 🟢 Хедер рендерится ВСЕГДА, независимо от состояния книг */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">SyncReado</h1>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => navigate("/upload")}>
            + Добавить книгу
          </button>
          <button className="logout-button" onClick={handleLogout}>
            Выйти
          </button>
        </div>
      </div>

      {/* 🔵 Контент меняется динамически внутри общего лейаута */}
      {isLoading ? (
        <div className="loader">Загрузка книг...</div>
      ) : errorMsg ? (
        <div className="error-container">
          <p> {errorMsg}</p>
          <button className="btn-secondary" onClick={() => window.location.reload()}>
            Попробовать снова
          </button>
        </div>
      ) : books.length === 0 ? (
        <div className="empty-state">
          <h2>У вас пока нет книг</h2>
          <p>Загрузите свою первую книгу, чтобы начать чтение!</p>
          {/* Кнопку добавления можно убрать отсюда, т.к. она уже есть в хедере */}
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
  )}