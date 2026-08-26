# 📖 SyncReado

**SyncReado** — это сервис для совместного чтения PDF-книг.

---

## 🚀 Текущий функционал

| Функция | Статус |
|---------|--------|
| Регистрация и авторизация (JWT) | ✅ Готово |
| Загрузка PDF-книг | ✅ Готово |
| Дашборд со списком книг | ✅ Готово |
| PDF-ридер с навигацией | ✅ Готово |
| Выбор конкретной страницы | ✅ Готово |
| Сохранение прогресса чтения | ✅ Готово |
| Восстановление последней страницы | ✅ Готово |
| Закладки (backend) | ✅ Готово |
| Закладки (frontend UI) | ✅ Готово |
| Система друзей | ✅ Готово |
| Real-time синхронизация (WebSocket) | ✅ Готово |
| Совместные режимы чтения | 🔵 В работе |
| Визуальные индикаторы закладок | ⚪ Запланировано |

---

## 🛠 Технологии

### Frontend
- **React 18** + **TypeScript**
- **Vite** — сборщик
- **react-pdf** — рендеринг PDF
- **react-router-dom** — маршрутизация
- **Context API** — управление состоянием авторизации

### Backend
- **Node.js** + **Express** + **TypeScript**
- **Prisma ORM** — работа с базой данных
- **PostgreSQL** — реляционная СУБД (запускается через Docker)
- **Multer** — загрузка файлов
- **bcrypt** — хэширование паролей
- **jsonwebtoken** — генерация и верификация JWT

### Инструменты
- **Docker** — контейнеризация PostgreSQL
- **Concurrently** — параллельный запуск frontend и backend
- **GitHub Issues + Projects** — трекинг задач

---

## ⚙️ Установка и запуск локально

### Предварительные требования

- [Node.js](https://nodejs.org/) >= 18
- [Docker](https://www.docker.com/)
- [Git](https://git-scm.com/)

### Шаги

```bash
# 1. Клонируй репозиторий
git clone https://github.com/detskiyded/syncreado.git
cd syncreado

# 2. Запусти PostgreSQL в Docker
docker run -d --name pg-syncreado \
  -e POSTGRES_USER=bookuser \
  -e POSTGRES_PASSWORD=bookpass123 \
  -e POSTGRES_DB=syncreado_db \
  -p 5432:5432 \
  -v pgdata:/var/lib/postgresql/data \
  postgres:16

# 3. Настрой backend
cd backend
npm install
cp .env.example .env
# Отредактируй .env: DATABASE_URL, JWT_SECRET
npx prisma migrate dev
npx prisma generate

# 4. Настрой frontend
cd ../frontend
npm install

# 5. Вернись в корень и запусти оба сервера
cd ..
npm install
npm run dev
