import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

export function Login() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { login, isLoading } = useAuth();
  const nav = useNavigate();

  function handleEmailChange(e: React.ChangeEvent<HTMLInputElement>) {
    setEmail(e.target.value);
  }

  function handlePasswordChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPassword(e.target.value);
  }

  async function handleSubmit(e: React.ChangeEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg(null);

    try {
      await login(email, password);
      nav("/dashboard");
    } catch (e: unknown) {
      if (typeof e === "string") setErrorMsg(e);
      else if (e instanceof Error) setErrorMsg(e.message);
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h1 className="auth-title">Вход</h1>
        {errorMsg && <div className="error-message">{errorMsg}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              value={email}
              onChange={handleEmailChange}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Пароль</label>
            <input
              className="form-input"
              type="password"
              value={password}
              onChange={handlePasswordChange}
              required
            />
          </div>
          <button className="form-button" type="submit" disabled={isLoading}>
            {isLoading ? "Загрузка..." : "Войти"}
          </button>
        </form>
        <div className="auth-footer">
          Нет аккаунта?{" "}
          <Link to="/register" className="auth-link">
            Зарегистрироваться
          </Link>
        </div>
      </div>
    </div>
  );
}
