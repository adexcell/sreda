# sreda



1. **Glob-паттерн в корневом `package.json`:**
   У нас в корне прописано:
   ```json
   "workspaces": [
     "apps/*",
     "packages/*"
   ]
   ```
   Знак `*` означает, что `npm` автоматически подхватит любую папку внутри `apps/` (`client-vue`, `client-react`, `server-fastify`, `server-rust` и т.д.), если внутри нее лежит свой `package.json` (или `Cargo.toml` для Rust, `composer.json` для PHP).

2. **Относительные пути в `tsconfig.json`:**
   Уровень вложенности останется тем же (`../../tsconfig.base.json`), поэтому пути к базовому конфигу TS не изменятся.

3. **Что нужно будет учесть:**
   В `apps/server-fastify/package.json` можно дать соответствующее имя пакету:
   `"name": "@sreda/server-fastify"` (а в `client-vue` — `"name": "@sreda/client-vue"`).

---

### 2. Реализация на других стеках (React, Angular, Rust, PHP, Python, Go)

Это потрясающая идея! В индустрии такой подход называют **Polyglot Monorepo** (или концепцией вроде *RealWorld / Conduit*, когда одно и то же полноценное приложение пишется на разных стеках по единой спецификации).

Вот как идеально будет выглядеть структура такого репозитория:

```text
sreda/
├── apps/
│   │   # 🎨 Фронтенд-клиенты (работают с ЛЮБЫМ бэкендом):
│   ├── client-vue/          # Vue 3 + Composition API + Pinia
│   ├── client-react/        # React 19 + TanStack Query + Zustand
│   ├── client-angular/      # Angular + Signals + RxJS
│   │
│   │   # ⚙️ Бэкенд-серверы (реализуют один и тот же API-контракт):
│   ├── server-fastify/      # Node.js + Fastify + TypeScript
│   ├── server-rust/         # Rust + Axum / Actix-web + SQLx
│   ├── server-go/           # Go + Gin / Chi + sqlc
│   ├── server-fastapi/      # Python + FastAPI + SQLAlchemy 2.0
│   ├── server-django/       # Python + Django Ninja
│   └── server-laravel/      # PHP 8.3 + Laravel 11 / Symfony
│
└── packages/
    └── shared/              # Единый источник правды (типы, DTO, схемы)
```

---

### 🎯 Как мы это организуем:

1. **Единый контракт (Single Source of Truth):**
   Все бэкенды реализуют строго одинаковые маршруты и форматы ответов:
   - `GET /health`
   - `GET /api/v1/workspaces`
   - `POST /api/v1/tasks`
   - `POST /api/v1/auth/login`
2. **Взаимозаменяемость клиентов и серверов:**
   Ты сможешь запустить, например, **Vue-клиент с Rust-бэкендом**, или **React-клиент с Fastify**, или **Angular с Go** — и всё будет работать бесшовно!
3. **План изучения:**
   Мы начнем с **`server-fastify`** и **`client-vue`**, чтобы заложить базовую бизнес-логику и отработать работу с PostgreSQL и WebSockets. А затем по аналогии реализуем остальные клиенты и серверы, сравнивая подходы, архитектуру и производительность.

---

Готов переименовать папки и пересоздать `apps/server-fastify`? Дай знать, как только будешь готов продолжить! 🚀


