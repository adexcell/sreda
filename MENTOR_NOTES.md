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

4. **Инициализировать `packages/shared`**:
   - Создать `packages/shared/package.json` (`"name": "@sreda/shared"`, `"version": "0.0.1"`, `"type": "module"`, `"main": "./src/index.ts"`).
