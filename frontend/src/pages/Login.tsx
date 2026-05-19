import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

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
    <>
      <form onSubmit={handleSubmit}>
        <input
          value={email}
          onChange={handleEmailChange}
          placeholder="Email"
          required
        ></input>
        <input
          value={password}
          onChange={handlePasswordChange}
          placeholder="Password"
          required
        ></input>

        {errorMsg && (
          <p style={{ color: "red", fontSize: "12px" }}>{errorMsg}</p>
        )}

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Loading..." : "Log in"}
        </button>
      </form>
    </>
  );
}
