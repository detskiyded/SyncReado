interface BookCardProps {
  id: string;
  title: string;
  author: string;
  onRead: () => void;
  onDelete: () => void;
}

export function BookCard({ title, author, onRead, onDelete }: BookCardProps) {
  return (
    <>
      {" "}
      <div className="book-card">
        <h3>{title}</h3>
        <p>{author}</p>
        <button onClick={onRead} className="btn-primary">
          Читать
        </button>
        <button onClick={onDelete} className="btn-danger">
          Удалить
        </button>
      </div>
    </>
  );
}
