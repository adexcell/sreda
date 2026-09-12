# 🧪 Руководство по тестированию и проверке API

В этом руководстве собраны все способы проверки и тестирования эндпоинтов бэкенда: от простых команд в терминале до профессиональных HTTP-файлов прямо в редакторе.

---

## 🚀 Предварительный шаг: Запуск сервера

Перед тестированием запусти dev-сервер в терминале:

```bash
# Из корня проекта
npm run --workspace=@sreda/server-fastify dev
```

Сервер запустится по адресу: `http://localhost:3001`

---

## 🛠️ Способ 1: Тестирование через Терминал (`curl`)

`curl` — это стандартный инструмент командной строки, доступный на всех серверах и ОС.

### 1. GET-запросы

```bash
# Простой запрос к healthcheck
curl http://localhost:3001/health

# Запрос с заголовками ответа (HTTP-код, Content-Type) - флаг -i
curl -i http://localhost:3001/health

# Получение списка воркспейсов
curl -i http://localhost:3001/api/v1/workspaces
```

### 2. Красивое форматирование JSON (`jq` / `json_pp`)
Чтобы JSON в терминале не выводился одной строкой, а подсвечивался и форматировался:

```bash
# С использованием jq (если установлен):
curl -s http://localhost:3001/api/v1/workspaces | jq .

# С использованием стандартного json_pp:
curl -s http://localhost:3001/api/v1/workspaces | json_pp
```

### 3. POST-запросы (отправка данных на сервер)

```bash
# Создание воркспейса (передача JSON в теле):
curl -i -X POST http://localhost:3001/api/v1/workspaces \
  -H "Content-Type: application/json" \
  -d '{"name": "Моя новая команда", "slug": "my-team"}'
```

---

## 📝 Способ 2: Тестирование прямо из редактора (`.http` файл) — Самый удобный!

В VS Code и Antigravity IDE можно тестировать API прямо из файлов с расширением `.http` (расширение **REST Client**).

В проекте создан файл: `apps/server-fastify/api.http`.

### Как пользоваться:
1. Открой файл `apps/server-fastify/api.http`.
2. Над каждым запросом появится кликабельная кнопка **`Send Request`**.
3. Нажми ее — справа откроется панель с полным ответом сервера (HTTP статус, время ответа, заголовки и отформатированный JSON).

---

## 🌐 Способ 3: Через Браузер

### 1. Адресная строка (только для `GET`):
Просто введи в браузере:
- `http://localhost:3001/health`
- `http://localhost:3001/api/v1/workspaces`

> 💡 *Совет: Установи расширение для браузера JSON Viewer (или используй встроенный просмотрщик в Firefox), чтобы JSON отображался с подсветкой синтаксиса и сворачиваемыми блоками.*

### 2. Через Консоль разработчика (DevTools `F12`):
Открой `F12` → вкладка **Console** и выполни JavaScript-код:

```javascript
// GET запрос
fetch('http://localhost:3001/api/v1/workspaces')
  .then(res => res.json())
  .then(data => console.log(data));

// POST запрос
fetch('http://localhost:3001/api/v1/workspaces', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Новый воркспейс', slug: 'new-ws' })
})
  .then(res => res.json())
  .then(data => console.log(data));
```

---

## ⚡ Способ 4: Автоматизированные тесты через `app.inject()` (Fastify Supertest)

Поскольку мы используем фабрику `buildApp()` в `src/app.ts`, мы можем тестировать сервер без запуска реального порта:

```typescript
import { buildApp } from './app';

const app = buildApp();

// Симуляция HTTP-запроса без поднятия сокета:
const response = await app.inject({
  method: 'GET',
  url: '/health'
});

console.log(response.statusCode); // 200
console.log(response.json());       // { status: 'ok', ... }
```

---

## 📌 Шпаргалка по кодам ответа HTTP:
- **`200 OK`** — успешный запрос (GET, PATCH).
- **`201 Created`** — ресурс успешно создан (POST).
- **`400 Bad Request`** — ошибка валидации входных данных (неверный JSON, отсутствуют обязательные поля).
- **`401 Unauthorized`** — пользователь не авторизован (нет JWT токена).
- **`403 Forbidden`** — доступ запрещен (недостаточно прав в RBAC).
- **`404 Not Found`** — запрашиваемый ресурс не найден.
- **`500 Internal Server Error`** — необработанная ошибка на стороне сервера (баг).
