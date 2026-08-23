import { useEffect, useState } from "react";
import type { FriendUser, FriendRequest } from "../types/friend";
import { request } from "../utils/api";

export function Friends() {
  const [activeTab, setActiveTab] = useState<"friends" | "incoming" | "outgoing" | "search">("friends");
  const [friends, setFriends] = useState<FriendUser[]>([]);
  const [incoming, setIncoming] = useState<FriendRequest[]>([]);
  const [outgoing, setOutgoing] = useState<FriendRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<FriendUser[]>([]);
  const [sentIds, setSentIds] = useState<string[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function loadFriendsData(){
    try {
	    const [friendsData, incomingData, outgoingData] = await Promise.all([
				request('/friends'),
				request('/friends/requests/incoming'),
				request('/friends/requests/outgoing')]);
			
		  setFriends(friendsData);
			setIncoming(incomingData);
			setOutgoing(outgoingData);
    } catch(err: unknown){
      const message =
        err instanceof Error ? err.message : "Не удалось загрузить данные друзей";
			setErrorMsg(message);
    } finally{
			setIsLoading(false);
		}
  }

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		loadFriendsData();
	}, []);

	async function acceptFriendRequest(id: string){
		try {
			await request(`/friends/${id}/accept`, {method: 'POST'});
			await loadFriendsData();
		} catch(err: unknown) {
				const message =
        	err instanceof Error ? err.message : "Не удалось загрузить данные друзей";
				setErrorMsg(message);
		}
	}

	async function rejectFriendRequest(id: string){
		try {
			await request(`/friends/${id}/reject`, {method: 'POST'});
			await loadFriendsData();
		} catch(err: unknown) {
			const message =
        err instanceof Error ? err.message : "Не удалось загрузить данные друзей";
			setErrorMsg(message);
		}
	}

	async function handleSearch(q: string){
    if (q.trim().length < 3) return;
		try {
      const users = await request(`/users/search?q=${encodeURIComponent(q)}`);
      setSearchResults(Array.isArray(users) ? users : []);
    } catch(err: unknown) {
      const message = err instanceof Error ? err.message : 'Не удалось выполнить поиск';
      setErrorMsg(message);
    }
	}

  async function handleAddFriend(userId: string){
    try {
      await request('/friends/request', {body: {addresseeId: userId}, method: 'POST'});
      
      setSentIds(prev => [...prev, userId]);

      await loadFriendsData();
    } catch(err: unknown){
      const message = err instanceof Error ? err.message : 'Не удалось добавить в друзья';
      setErrorMsg(message);
    }
  }

  return (
    
    <div className="friends-layout">
      {/* БЛОК ОТОБРАЖЕНИЯ ОШИБОК И ЗАГРУЗКИ */}
      {isLoading && (
        <div className="loader" style={{ padding: "20px", textAlign: "center" }}>
          Загрузка...
        </div>
      )}
      {errorMsg && (
        <div className="error-toast">
          <span>⚠️ {errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="btn-secondary">Скрыть</button>
        </div>
      )}

      {/* Заголовок */}
      <div className="friends-header">
        <h1 className="friends-title">👥 Друзья</h1>
      </div>

      {/* Вкладки */}
      <div className="friends-tabs">
        <button className={`friends-tab ${activeTab === "friends" ? "active" : ""}`} onClick={() => setActiveTab('friends')}>
          Друзья
          {friends.length > 0 && <span className="tab-badge">{friends.length}</span>}
        </button>
        <button className={`friends-tab ${activeTab === "incoming" ? "active" : ""}`} onClick={() => setActiveTab('incoming')}>
          Входящие
          {incoming.length > 0 && <span className="tab-badge">{incoming.length}</span>}
        </button>
        <button className={`friends-tab ${activeTab === "outgoing" ? "active" : ""}`} onClick={() => setActiveTab('outgoing')}>
          Исходящие
        </button>
        <button className={`friends-tab ${activeTab === "search" ? "active" : ""}`} onClick={() => setActiveTab('search')}>
          Поиск
        </button>
      </div>

      {/* Контент вкладок */}
      <div className="friends-content">
        {/* Вкладка: Друзья */}
        {activeTab === "friends" &&
          (friends.length === 0 ? (
            <div className="empty-state">
              <h2>Пока нет друзей</h2>
              <p>Найди единомышленников во вкладке «Поиск», чтобы читать вместе!</p>
            </div>
          ) : (
            <div className="friends-list">
              {friends.map((friend) => (
                <div key={friend.id} className="friend-card">
                  <div className="friend-info">
                    <span className="friend-avatar">📖</span>
                    <span className="friend-email">{friend.email}</span>
                  </div>
                </div>
              ))}
            </div>
          ))}

        {/* Вкладка: Входящие */}
        {activeTab === "incoming" &&
          (incoming.length === 0 ? (
            <div className="empty-state">
              <h2>Нет входящих запросов</h2>
              <p>Когда кто-то добавит тебя в друзья, запрос появится здесь.</p>
            </div>
          ) : (
            <div className="friends-list">
              {incoming.map((request) => (
                <div key={request.id} className="friend-card">
                  <div className="friend-info">
                    <span className="friend-avatar">📨</span>
                    <span className="friend-email">{request.requester.email}</span>
                  </div>
                  <div className="friend-actions">
                    <button className="btn-primary" onClick={() => acceptFriendRequest(request.id)}>{/* принять */} Принять</button>
                    <button className="btn-danger" onClick={() => rejectFriendRequest(request.id)}>{/* отклонить */} Отклонить</button>
                  </div>
                </div>
              ))}
            </div>
          ))}

        {/* Вкладка: Исходящие */}
        {activeTab === "outgoing" &&
          (outgoing.length === 0 ? (
            <div className="empty-state">
              <h2>Нет исходящих запросов</h2>
              <p>Ты ещё не отправлял заявок в друзья.</p>
            </div>
          ) : (
            <div className="friends-list">
              {outgoing.map((request) => (
                <div key={request.id} className="friend-card">
                  <div className="friend-info">
                    <span className="friend-avatar">⏳</span>
                    <span className="friend-email">{request.addressee.email}</span>
                  </div>
                  <span className="request-status">Ожидает ответа</span>
                </div>
              ))}
            </div>
          ))}

        {/* Вкладка: Поиск */}
        {activeTab === "search" && (
          <div className="friends-search">
            <form className="search-form" onSubmit={(e) => {
              e.preventDefault();
              handleSearch(searchQuery); 
              }}>
              <input
                type="text"
                className="form-input"
                placeholder="Введи email для поиска..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="btn-secondary">
                🔍 Найти
              </button>
            </form>

            {searchResults.length === 0 ? (
              <div className="empty-state">
                <p>Введи часть email, чтобы найти друзей для совместного чтения.</p>
              </div>
            ) : (
              <div className="friends-list">
                {searchResults.map((user) => (
                  <div key={user.id} className="friend-card">
                    <div className="friend-info">
                      <span className="friend-avatar">🔍</span>
                      <span className="friend-email">{user.email}</span>
                    </div>
                    <button className="btn-primary" onClick={() => handleAddFriend(user.id)}> + В друзья</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}