import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function Layout() {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <div className="app-layout">
      {/* Шапка видна всегда */}
      <header className="app-header">
        <NavLink to="/dashboard" className="app-logo" onClick={closeMenu}>
          SyncReado
        </NavLink>

        {/* Навигация на десктопе */}
        <nav className="app-nav">
          <NavLink
            to="/dashboard"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            📚 Книги
          </NavLink>
          <NavLink
            to="/friends"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            👥 Друзья
          </NavLink>
          <NavLink
            to="/rooms"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            🚪 Комнаты
          </NavLink>
        </nav>

        <div className="header-actions">
          <button className="btn-primary" onClick={() => navigate("/upload")}>
            + Добавить книгу
          </button>
          <button className="logout-button" onClick={handleLogout}>
            Выйти
          </button>
          {/* Бургер виден только на мобильных */}
          <button
            className="burger-button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-label="Меню"
          >
            {isMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </header>

      {/* Мобильное меню */}
      {isMenuOpen && (
        <div className="mobile-menu-overlay" onClick={closeMenu}>
          <nav className="mobile-menu" onClick={(e) => e.stopPropagation()}>
            <NavLink to="/dashboard" className="nav-link" onClick={closeMenu}>
              📚 Книги
            </NavLink>
            <NavLink to="/friends" className="nav-link" onClick={closeMenu}>
              👥 Друзья
            </NavLink>
            <NavLink to="/rooms" className="nav-link" onClick={closeMenu}>
              🚪 Комнаты
            </NavLink>
            <button
              className="btn-primary"
              onClick={() => {
                closeMenu();
                navigate("/upload");
              }}
            >
              + Добавить книгу
            </button>
            <button className="logout-button" onClick={handleLogout}>
              Выйти
            </button>
          </nav>
        </div>
      )}

      {/* Контент текущей страницы */}
      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
}
