# URL Checker Fullstack

Тестовое задание: асинхронная проверка списка URL через `HEAD` запросы.

## Стек

- Backend: Node.js, TypeScript, NestJS, in-memory storage
- Frontend: React, TypeScript, Zustand, Vite
- Docker: Dockerfile + docker-compose

## Запуск через Docker

```bash
docker compose up --build
```

После запуска:

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api/jobs

## Локальный запуск без Docker

Backend:

```bash
cd backend
npm install
npm run start:dev
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

## API

### Создать задание

```http
POST /api/jobs
Content-Type: application/json

{
  "urls": ["https://example.com"]
}
```

Ответ:

```json
{ "jobId": "..." }
```

### Получить список заданий

```http
GET /api/jobs
```

### Получить детали задания

```http
GET /api/jobs/:id
```

### Отменить задание

```http
DELETE /api/jobs/:id
```

## Реализовано

- Уникальный `jobId`
- Статусы заданий: `pending`, `in_progress`, `completed`, `cancelled`, `failed`
- Статусы URL: `pending`, `in_progress`, `success`, `error`, `cancelled`
- `HEAD` запрос для каждого URL
- Случайная задержка 0–10 секунд перед сохранением результата
- Не более 5 одновременных `HEAD` запросов в рамках одного задания
- Одновременная обработка нескольких заданий
- Отмена задания: не начатые URL получают статус `cancelled`
- React UI: создание задания, список заданий, детали активного задания, polling, отмена
