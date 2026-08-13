import type { Bookmark } from "../types/bookmark";

interface BookmarkSidebarProps {
  bookmarks: Bookmark[];
  isOpen: boolean;
  onClose: () => void;
  onBookmarkClick: (pageNumber: number) => void;
  onBookmarkDelete: (bookmarkId: string) => void;
  currentPage: number;
}

export function BookmarkSidebar({
  bookmarks,
  isOpen,
  currentPage,
  onClose,
  onBookmarkClick,
  onBookmarkDelete,
}: BookmarkSidebarProps) {
  // Форматирование даты в читаемый вид
  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className={`bookmark-sidebar ${isOpen ? "open" : ""}`}>
      {/* Шапка сайдбара */}
      <div className="bookmark-sidebar-header">
        <h2 className="bookmark-sidebar-title">🔖 Закладки</h2>
        <button className="bookmark-close-btn" onClick={onClose}>
          ✕
        </button>
      </div>

      {/* Контент */}
      {bookmarks.length === 0 ? (
        <div className="bookmark-empty">
          <p>Пока нет закладок</p>
          <p className="bookmark-empty-hint">
            Нажми «+» в шапке, чтобы сохранить текущую страницу
          </p>
        </div>
      ) : (
        <div className="bookmark-list">
          {bookmarks.map((bookmark) => (
            <div
              key={bookmark.id}
              className={`bookmark-item ${
                bookmark.pageNumber === currentPage ? "active" : ""
              }`}
              onClick={() => onBookmarkClick(bookmark.pageNumber)}
            >
              <div className="bookmark-item-content">
                <span className="bookmark-page">
                  📄 Страница {bookmark.pageNumber}
                </span>
                {bookmark.note && (
                  <span className="bookmark-note line-clamp-3">{bookmark.note}</span>
                )}
                <span className="bookmark-date">
                  {formatDate(bookmark.createdAt)}
                </span>
              </div>
              <button
                className="bookmark-delete-btn"
                onClick={(e) => {
                  e.stopPropagation(); // чтобы клик не всплывал до родителя
                  onBookmarkDelete(bookmark.id);
                }}
              >
                🗑
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
