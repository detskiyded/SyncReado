import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Dashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="dashboard-layout">
      <div className="dashboard-header">
        <h1 className="dashboard-title">SyncReado</h1>
        <button className="logout-button" onClick={handleLogout}>
          Выйти
        </button>
      </div>

      <div className="dashboard-grid">
        <div className="empty-state">
          <p style={{ fontSize: "18px", marginBottom: "8px" }}>
            📚 Пока нет книг
          </p>
          <p style={{ opacity: 0.6 }}>
            Загрузка PDF и управление библиотекой появятся на следующем этапе
          </p>
        </div>
      </div>
    </div>
  );
}
