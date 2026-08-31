import type { Book } from "../types/book";
import type { Room } from "../types/room";
import { useEffect, useState } from "react";
import { request } from "../utils/api";
import { Modal } from "../components/Modal";
import { useNavigate } from "react-router-dom";

export function Rooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [roomName, setRoomName] = useState<string>("");
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<string>("");
  const [isJoinModalOpen, setIsJoinModalOpen] = useState<boolean>(false);
  const [inviteCode, setInviteCode] = useState<string>("");
  const nav = useNavigate();

  async function loadData() {
    setIsLoading(true);
    try {
      const [booksData, roomsData] = await Promise.all([
        request("/books"),
        request("/rooms"),
      ]);

      setRooms(roomsData);
      setBooks(booksData);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Не удалось загрузить данные друзей";
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, []);

  async function handleCreate() {
    try {
      await request("/rooms", {
        method: "POST",
        body: { name: roomName, bookId: selectedBookId },
      });
      setIsCreateModalOpen(false);
      await loadData();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Не удалось загрузить комнату";
      setErrorMsg(message);
    }
  }

  async function handleJoin() {
    try {
      const room = await request("/rooms/join", {
        method: "POST",
        body: { inviteCode: inviteCode },
      });
      setIsJoinModalOpen(false);
      await loadData();
      nav(`/room/${room.id}`);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Не удалось загрузить комнату";
      setErrorMsg(message);
    }
  }

  return (
    <div className="rooms-layout">
      {/* Тост ошибки: живёт отдельно и НЕ скрывает контент */}
      {errorMsg && (
        <div className="error-toast">
          <p>⚠️ {errorMsg}</p>
        </div>
      )}

      {/* Шапка */}
      <div className="rooms-header">
        <h1 className="rooms-title">🚪 Комнаты</h1>
        <div className="rooms-actions">
          <button
            className="btn-primary"
            onClick={() => setIsJoinModalOpen(true)}
          >
            🔑 Вступить
          </button>
          <button
            className="btn-primary"
            onClick={() => setIsCreateModalOpen(true)}
          >
            + Создать комнату
          </button>
        </div>
      </div>

      {/* Контент: только загрузка / пусто / список */}
      <div className="rooms-content">
        {isLoading ? (
          <div className="loader">Загрузка комнат...</div>
        ) : rooms.length === 0 ? (
          <div className="empty-state">
            <h2>Пока нет комнат</h2>
            <p>Создай первую комнату и пригласи друзей читать вместе!</p>
            <button
              className="btn-primary"
              onClick={() => setIsCreateModalOpen(true)}
            >
              + Создать комнату
            </button>
          </div>
        ) : (
          <div className="rooms-grid">
            {rooms.map((room) => (
              <div key={room.id} className="room-card">
                <div className="room-card-header">
                  <span className="room-icon">🚪</span>
                  <h3 className="room-name">{room.name}</h3>
                </div>
                <p className="room-book">📖 {room.book?.title ?? "—"}</p>
                <div className="room-meta">
                  <span className="room-members-count">
                    👥 {room._count?.roomMembers ?? 1}
                  </span>
                </div>
                <button
                  className="btn-secondary"
                  onClick={() => nav(`/room/${room.id}`)}
                >
                  Открыть
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Модалка создания */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Создать комнату"
      >
        <div className="form-group">
          <label htmlFor="room-name">Название комнаты</label>
          <input
            id="room-name"
            type="text"
            className="form-input"
            placeholder="Например: Читаем главу 3"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            maxLength={60}
          />
        </div>

        <div className="form-group">
          <label htmlFor="room-book">Книга</label>
          <select
            id="room-book"
            className="form-input"
            value={selectedBookId}
            onChange={(e) => setSelectedBookId(e.target.value)}
          >
            <option value="">Выбери книгу...</option>
            {books.map((book) => (
              <option key={book.id} value={book.id}>
                {book.title}
              </option>
            ))}
          </select>
        </div>

        <div
          style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}
        >
          <button
            className="btn-secondary"
            onClick={() => setIsCreateModalOpen(false)}
          >
            Отмена
          </button>
          <button className="btn-primary" onClick={handleCreate}>
            Создать
          </button>
        </div>
      </Modal>

      {/* Модалка присоединения к комнате */}
      <Modal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        title="Войти в комнату"
      >
        <div className="form-group">
          <label htmlFor="room-id">Код приглашения</label>
          <input
            id="room-id"
            type="text"
            className="form-input"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
          />
        </div>

        <div
          style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}
        >
          <button
            className="btn-secondary"
            onClick={() => setIsJoinModalOpen(false)}
          >
            Отмена
          </button>
          <button className="btn-primary" onClick={handleJoin}>
            Присоединиться
          </button>
        </div>
      </Modal>
    </div>
  );
}
