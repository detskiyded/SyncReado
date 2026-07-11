import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { request } from "../utils/api";

export function UploadBook() {
  const [title, setTitle] = useState<string>("Unnamed");
  const [author, setAuthor] = useState<string>("Unknown");
  const [file, setFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const nav = useNavigate();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFile(e.target.files?.[0] || null);
  }

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file) {
      setErrorMsg("Select file!");
    } else {
      setIsLoading(true);

      try {
        const formData = new FormData();
        formData.append("title", title);
        formData.append("author", author);
        formData.append("pdf", file);

        await request("/books", { method: "POST", body: formData });
        nav("/dashboard");
      } catch (err: unknown) {
        if (err) setErrorMsg(err.toString());
      }
    }
  }

  return (
    <div className="upload-book-container">
      <h1>Загрузить книгу</h1>

      <form onSubmit={handleSubmit} className="upload-form">
        {/* Поле названия */}
        <div className="form-group">
          <label htmlFor="title">Название книги</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Введите название"
            required
            disabled={isLoading}
            className="form-input"
          />
        </div>

        {/* Поле автора */}
        <div className="form-group">
          <label htmlFor="author">Автор</label>
          <input
            id="author"
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Введите автора"
            required
            disabled={isLoading}
            className="form-input"
          />
        </div>

        {/* Поле файла */}
        <div className="form-group">
          <label htmlFor="pdf">PDF файл</label>
          <input
            id="pdf"
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            disabled={isLoading}
            className="form-input"
            required
          />
          {file && <p className="file-info">Выбран файл: {file.name}</p>}
        </div>

        {/* Сообщение об ошибке */}
        {errorMsg && <div className="error-message">{errorMsg}</div>}

        {/* Кнопка отправки */}
        <button type="submit" disabled={isLoading} className="submit-button">
          {isLoading ? "Загрузка..." : "Загрузить книгу"}
        </button>
      </form>
    </div>
  );
}
