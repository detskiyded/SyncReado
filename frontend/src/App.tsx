import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";
import { Login } from "./pages/Login"; // если у тебя default — замени на `import Login from ...`
import { Register } from "./pages/Register"; // то же самое
import { Dashboard } from "./pages/Dashboard";
import { UploadBook } from "./pages/UploadBook";
import { Reader } from "./pages/Reader";
import { Friends } from "./pages/Friends";
import { Rooms } from "./pages/Rooms";
import { RoomPage } from "./pages/RoomPage";

export default function App() {
  return (
    <Routes>
      {/* Публичные */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Защищённые с общей навигацией */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/upload" element={<UploadBook />} />
        <Route path="/friends" element={<Friends />} />
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/room/:roomId" element={<RoomPage/>} />
      </Route>

      {/* Ридер - иммерсивный */}
      <Route
        path="/reader/:bookId"
        element={
          <ProtectedRoute>
            <Reader />
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
