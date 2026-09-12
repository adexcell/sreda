# 📖 Дневник менторства и конспекты: Проект «Среда»

> 📌 **Правила взаимодействия и роли участников зафиксированы в [RULES.md](file:///home/abakar/pets/sreda/RULES.md).**

Здесь сохраняются все теоретические разборы, архитектурные решения, задания, код-ревью и рекомендации ментора.

---

## 📅 Запись 1: Старт обучения и концепт проекта

### 🌟 Концепт проекта «Среда» (Sreda)
Платформа для совместной работы команд (Digital HQ), объединяющая лучшее из Linear, Notion и Trello:
1. **Интерактивные Kanban-доски и задачи** (Drag-and-Drop, виртуализация, горячие клавиши `Cmd+K`).
2. **Блочный текстовый редактор заметок** (Notion-style).
3. **Совместная работа в реальном времени (WebSockets)**: живые курсоры, мгновенная синхронизация, онлайн-статусы.
4. **Бэкенд на Node.js**: REST API + WebSockets, PostgreSQL + Drizzle ORM, Zod, JWT (Access + Refresh в HttpOnly cookie), RBAC.
5. **Фронтенд на Vue 3**: Composition API, `<script setup lang="ts">`, Feature-Sliced Design (FSD), Pinia, TanStack Query.

---

## 📅 Запись 2: Шаг 0.1 — Архитектура Monorepo и Workspaces

### 📚 Теория: Зачем нужен Monorepo и Workspaces?
- **Проблема без монорепо:** Рассинхронизация контрактов между фронтендом и бэкендом (например, переименование полей в API приводит к рантайм-ошибкам на фронте). Приходится копировать типы вручную.
- **Решение с Workspaces:** Единый источник правды — пакет `@sreda/shared`. Изменения типов в DTO мгновенно подсвечивают ошибки компиляции и на бэкенде, и на фронтенде ещё до запуска.

### 🎯 Практическое задание 0.1 (Выполняет студент)
1. **Создать структуру папок**:
   - `apps/server` (Node.js бэкенд)
   - `apps/client` (Vue 3 фронтенд)
   - `packages/shared` (общие типы и Zod-схемы)

2. **Создать корневой `package.json`**:
   - `"name": "sreda"`
   - `"private": true`
   - `"workspaces": ["apps/*", "packages/*"]`
   - `"type": "module"`

3. **Создать корневой `.gitignore`**:
   - `node_modules`, `dist`, `build`, `.output`, `.env`, `.env.*`, логи, `.DS_Store`.

---

## 📅 Запись 3: Code Review Шага 0.1 (Конфигурация Monorepo)

### 🔍 Результаты ревью
1. **Спецификация `package.json`**:
   - `npm` не знает поля `"project-name"` и `"entry-point"`. Стандартные поля: `"name"` и `"main"` (или `"exports"`).
2. **Именование папок и glob в Workspaces**:
   - Создана папка `app/` (в единственном числе), а в корневом `package.json` указан glob `"apps/*"`. В монорепозиториях принято множественное число: `apps/`.
3. **Файл `.gitignore`**:
   - Хороший базовый набор. Рекомендуется добавить маску `.env.*` (для `.env.production`, `.env.test`) и `coverage/`.

---

## 📅 Запись 4: Шаг 0.2 — TypeScript: Настройка компилятора и Доменные типы

### 📚 Теория: Ключевые архитектурные концепции TypeScript

1. **TypeScript в Monorepo**:
   - Создается базовый `tsconfig.base.json` в корне с общими строгими правилами (`strict: true`, `target: "ES2022"`, `moduleResolution: "bundler"`).
   - В каждом пакете (`packages/shared`, `apps/server`, `apps/client`) `tsconfig.json` наследуется через `"extends": "../../tsconfig.base.json"`.

2. **Union Types vs Enums (Архитектурный выбор)**:
   - В современном TypeScript часто избегают числовых `enum` (они создают лишний JS-код при компиляции и имеют неочевидное поведение).
   - Предпочтительный паттерн — **String Literal Unions** или **`const` объекты**:
     ```typescript
     export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'in_review' | 'done' | 'canceled';
     ```

3. **Discriminated Unions (Размеченные объединения)**:
   - Паттерн для безопасной обработки результатов API или состояний UI. Наличие общего поля-дискриминатора (например, `success: true | false`) позволяет TypeScript автоматически сужать тип данных:
     ```typescript
     export type ApiResponse<T> = 
       | { success: true; data: T }
       | { success: false; error: { message: string; code: string } };
     ```

---

## 📅 Запись 5: Разбор Discriminated Unions + Generics & Code Review

### 🔍 Замечания по конфигам:
1. **Опечатка в `tsconfig.base.json`**: `"moduleResoution"` -> `"moduleResolution"` (пропущена буква `l`).
2. В `apps/client/tsconfig.json`: свойство `rootDir` должно быть внутри `"compilerOptions": { "rootDir": "./src" }`.

### 📚 Теория: Что такое Discriminated Union и почему здесь нужен `type`, а не `interface`?
- `interface` в TypeScript может описывать только **форму одного объекта**. Он не может быть объединением (`|`).
- Объединения (`Union`) всегда описываются через ключевое слово **`type`**.

#### Анатомия Discriminated Union:
1. **Общий маркер-дискриминатор**: Поле, которое есть во всех ветках, но имеет строгий литеральный тип (`success: true` vs `success: false`).
2. **Дженерик `<T>`**: Переменная типа, которая подставляется внутрь успешного ответа.

### 📚 Глубокий разбор конструкции: `export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;`

1. **Разбор по частям**:
   - `type` — оператор создания типа (в отличие от `interface`, умеет объединять типы через `|`).
   - `<T>` — Дженерик (Generic, параметр типа). Переменная, в которую подставляется конкретный тип данных при использовании (`ApiResponse<User>`, `ApiResponse<Task[]>`).
   - `|` — Union (логическое «ИЛИ»). Ответ сервера находится ровно в одном из двух состояний.

2. **Сравнение подходов**:
   - **Наивный подход (плохо)**:
     ```typescript
     interface BadResponse<T> {
       success: boolean;
       data?: T;
       error?: string;
     }
     ```
     *Проблема:* Разрешает недопустимые состояния (например, `success: true`, но `data: undefined` и `error: "Ошибка"`). Вынуждает использовать `?` и операторы `!` (non-null assertion).
---

## 📅 Запись 6: Шаг 0.3 — Utility Types и DTO (Data Transfer Objects)

### 📚 Теория: Что такое DTO и почему важно использовать Utility Types?
- **DTO (Data Transfer Object)** — объект, передаваемый по сети (между клиентом и сервером).
- **Проблема дублирования**: Если для создания задачи вручную объявить новый интерфейс, то при изменении `Task` придется менять два места.
- **Встроенные Utility Types**:
  - `Omit<Type, Keys>` — удаляет ключи `Keys` из `Type`.
    *Пример:* `Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'creatorId'>`
  - `Pick<Type, Keys>` — оставляет только выбранные ключи.
  - `Partial<Type>` — делает все свойства типа опциональными (с `?`). Идеально для `PATCH`-запросов обновления.
  - `Required<Type>` — убирает опциональность со всех полей.
  - `Readonly<Type>` — запрещает мутацию полей.

---

## 📅 Запись 7: Комбинирование Utility Types и Intersection Types (`&`)

### 📚 Теория: Как сделать часть полей опциональными, а часть обязательными?

Когда мы создаем задачу, `workspaceId` и `title` — строго обязательны, а `status`, `priority` и `order` могут быть опциональными (бэкенд сам подставит дефолты: `status: 'todo'`, `priority: 'no_priority'`).

#### 1. Оператор пересечения `&` (Intersection):
В TypeScript знак `&` объединяет свойства двух типов в один:
```typescript
type Combined = { a: string } & { b: number }; // { a: string; b: number }
```

#### 2. Паттерн `Omit` + `Partial<Pick>`:
1. Вырезаем из `Task` системные поля и поля, которые хотим сделать опциональными:
   `Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'creatorId' | 'status' | 'priority' | 'order'>`
2. Берем эти поля через `Pick` и оборачиваем в `Partial`:
   `Partial<Pick<Task, 'status' | 'priority' | 'order'>>`
3. Склеиваем их через `&`:
   ```typescript
   export type CreateTaskDto = 
     Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'creatorId' | 'status' | 'priority' | 'order'> & 
     Partial<Pick<Task, 'status' | 'priority' | 'order'>>;
   ```

#### 3. Создание своего переиспользуемого Utility Type (Senior-уровень):
```typescript
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

### 🔍 Результаты Code Review Шага 0.3:
- Кастомный generic `Optional<T, K extends keyof T>` реализован безупречно.
- `CreateTaskDto`, `CreateWorkspaceDto`, `UpdateTaskDto` и схемы аутентификации сформированы строго по принципам DRY.
- Компилятор TypeScript (`tsc --noEmit`) отработал без единой ошибки.
- Все базовые контракты пакета `@sreda/shared` готовы к использованию на бэкенде и фронтенде.

---

## 🛠️ Шпаргалка: Как проверять ошибки TypeScript самостоятельно

1. **Прямой запуск компилятора без генерации файлов**:
   ```bash
   npx tsc --project packages/shared/tsconfig.json --noEmit
   ```
   - `npx` — запускает локально установленный бинарник `tsc`.
   - `--project <путь>` — указывает, какой `tsconfig.json` использовать.
   - `--noEmit` — флаг «только проверь типы, не создавай `.js` файлы на диске».

2. **Настройка npm-скриптов для удобства (Best Practice)**:
   - В `packages/shared/package.json`:
     `"typecheck": "tsc --noEmit"`
   - В корневом `package.json`:
     `"typecheck": "npm run --workspaces --if-present typecheck"`
---

## 📅 Запись 8: Шаг 1.1 — Инициализация Fastify Backend & Связка с `@sreda/shared`

### 📚 Теория: Архитектура сервера на Node.js + Fastify

1. **Почему Fastify, а не Express?**
   - Нативная поддержка `async/await` (не крашится при необработанных промисах).
   - Встроенный высокопроизводительный JSON-логгер (`pino`).
   - В 2-3 раза выше пропускная способность (RPS) благодаря оптимизированному роутеру (Radix Tree).
   - Чистая типизация запросов и ответов в TypeScript.

2. **Запуск TypeScript в Node.js без медленной компиляции**:
   - Мы используем **`tsx`** (TypeScript Execute на базе `esbuild`). Он мгновенно запускает TS-файлы и поддерживает авто-перезагрузку через `tsx watch`.

3. **Связка пакетов в Monorepo**:
   - В `apps/server/package.json` мы объявляем зависимость: `"@sreda/shared": "*"` (или `"@sreda/shared": "workspace:*"`).
   - Это позволяет сразу делать `import type { ApiResponse, Workspace } from '@sreda/shared'`.

### 🎯 Практическое задание 1.1 (Выполняет студент)
1. **Создать `apps/server/package.json`**:
   - `"name": "@sreda/server"`, `"type": "module"`.
   - Зависимости: `fastify`, `@sreda/shared`.
   - Скрипты: `"dev": "tsx watch src/index.ts"`, `"typecheck": "tsc --noEmit"`.
2. **Создать `apps/server/tsconfig.json`**:
   - `"extends": "../../tsconfig.base.json"`.
   - `"include": ["src/**/*"]`.
3. **Установить зависимости**:
   - Выполнить `npm install` из корня.
---

## 📅 Запись 9: Code Review Шага 1.1 — Промышленная архитектура бэкенда

### 🔍 Результаты Code Review
1. **Слоистая архитектура (Layered Architecture)**:
   - Создана чистая модульная структура `apps/server-fastify/src/modules/`.
   - `WorkspacesService`: инкапсулирует бизнес-логику и подготовку данных.
   - `WorkspacesController`: обрабатывает входящие HTTP-запросы и оборачивает ответы в контракт `ApiResponse<Workspace[]>`.
   - `WorkspacesRoutes`: Fastify Plugin для изоляции маршрутов модуля с префиксом `/api/v1`.
2. **Фабрика приложения (`app.ts`)**:
   - Реализована функция `buildApp(): FastifyInstance`, что позволяет запускать тесты без поднятия сетевых сокетов (`app.inject()`).
3. **Graceful Shutdown (`index.ts`)**:
   - Настроена корректная обработка системных сигналов `SIGINT` и `SIGTERM` через `await app.close()`.
4. **Проверка работоспособности**:
   - Сервер успешно запускается через `tsx watch src/index.ts` на порту `3001`.
   - Эндпоинты `GET /health` и `GET /api/v1/workspaces` возвращают корректный JSON со статусом 200 OK.
   - Проверка типов (`tsc --noEmit`) проходит без единой ошибки.

---

## 📅 Запись 10: Шаг 1.2 — Валидация Zod, Обработка ошибок (AppError) и POST/GET по ID

### 📚 Теория: Сквозная валидация схем и управление ошибками

1. **Зачем нужен Zod в пакете `@sreda/shared`?**
   - TypeScript проверяет типы только во время компиляции. В рантайме типы стираются.
   - `Zod` валидирует данные в рантайме (проверяет длину строк, регулярные выражения, формат UUID/slug).
   - Принцип **Single Source of Truth**: Zod-схема компилирует и TypeScript-тип (`z.infer<typeof schema>`), и валидатор для бэкенда, и валидатор форм на фронтенде.

2. **Иерархия ошибок приложения (`AppError`)**:
   - Базовый класс `AppError extends Error` с полями `statusCode`, `code`, `details`.
   - Специализированные классы:
     - `NotFoundError` (HTTP 404, `NOT_FOUND`)
     - `ValidationError` (HTTP 400, `VALIDATION_ERROR`)
     - `ConflictError` (HTTP 409, `CONFLICT`)
     - `UnauthorizedError` (HTTP 401, `UNAUTHORIZED`)
     - `ForbiddenError` (HTTP 403, `FORBIDDEN`)

3. **Централизованный `setErrorHandler` в Fastify**:
   - Любое исключение, выброшенное в `Service` или `Controller`, перехватывается глобальным обработчиком в `app.ts`.
   - Ответ всегда гарантированно соответствует единому формату `ApiErrorResponse`:
     ```json
     {
       "success": false,
       "error": {
         "code": "NOT_FOUND",
         "message": "Воркспейс с id 'ws-999' не найден"
       }
     }
     ```











