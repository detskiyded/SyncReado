import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { Room } from "../types/room";
import { request } from "../utils/api";

export function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const [room, setRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadRoom() {
      if (!roomId) return;
      setIsLoading(true);

      try{
        const roomData = await request(`/rooms/${roomId}`);
        setRoom(roomData);
      } catch(err: unknown) {
        const message =
          err instanceof Error ? err.message : "Не удалось загрузить комнату";
        setErrorMsg(message);
      } finally {
        setIsLoading(false);
      }
    }

    loadRoom();
  }, [roomId])

  if (isLoading) return <div className="loader">Загрузка комнаты...</div>;
  if (errorMsg)
    return (
      <div className="error-container">
        <p>⚠️ {errorMsg}</p>
      </div>
    );
  if (!room) return null;


  const inviteLink = `${room.inviteCode}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setErrorMsg('Не удалось скопировать');
    }
  }

  return (
    <div className="room-page">
      {/* Шапка комнаты */}
      <div className="room-page-header">
        <h1 className="room-page-title">🚪 {room.name}</h1>
        <p className="room-page-book">📖 {room.book?.title ?? "—"}</p>
      </div>

      {/* Блок инвайт-ссылки */}
      <div className="room-invite-block">
        <h2>Пригласи друзей</h2>
        <div className="invite-link-row">
          <input type="text" className="form-input" value={inviteLink} readOnly />
          <button className="btn-secondary" onClick={handleCopy}>
            {copied ? "✅ Скопировано!" : "📋 Копировать"}
          </button>
        </div>
      </div>

      {/* Участники */}
      <div className="room-members-block">
        <h2>Участники ({room.roomMembers?.length ?? 0})</h2>
        <div className="room-members-list">
          {room.roomMembers?.map((member) => (
            <span key={member.id} className="member-chip">
              👤 {member.user?.email ?? "—"}
            </span>
          ))}
        </div>
      </div>

      {/* Переход в ридер */}
      <button className="btn-primary">
        {/* TODO: читать вместе (navigate в ридер с ?room=) */}
        📖 Читать вместе
      </button>
    </div>
  );
}