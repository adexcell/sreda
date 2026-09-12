Принцип: **«Production-Ready с первого дня — никаких учебных компромиссов и монолитных god-файлов»**.

Раз мы сразу учимся взрослому проектированию, давай разложим бэкенд на **модульную слоистую архитектуру (Layered Architecture)**, как это делается в реальных продакшен-командах (Linear, Stripe, Vercel).

---

### 🏛️ Промышленная архитектура `apps/server`

В профессиональном Fastify-бэкенде код делят на 3 ключевые части:

```text
apps/server/src/
├── app.ts                  # Фабрика приложения (buildApp): сборка роутов, плагинов и middleware
├── index.ts                # Entry point: чтение env, запуск сетевого порта, Graceful Shutdown
└── modules/                # Модули фичей (Feature-based / Domain-driven)
    ├── health/
    │   └── health.routes.ts          # Healthcheck эндпоинт (GET /health)
    └── workspaces/
        ├── workspaces.routes.ts      # Fastify Plugin: регистрация эндпоинтов (GET /api/v1/workspaces)
        ├── workspaces.controller.ts  # Обработчик запроса (HTTP: статус, тело, заголовки)
        └── workspaces.service.ts     # Чистая бизнес-логика (не знает про HTTP, возвращает данные)
```

---

### 🔍 Почему именно так? (Архитектурные причины)

1. **Фабрика `buildApp()` в `app.ts` вместо мгновенного запуска:**
   - Позволяет писать **интеграционные тесты** (`supertest` / `app.inject()`) без необходимости занимать реальный сетевой порт.
2. **Разделение Controller и Service (Single Responsibility):**
   - `Controller` отвечает **только за HTTP** (распарсить параметры, вернуть JSON с кодом 200/400).
   - `Service` отвечает **только за бизнес-логику**. Если мы завтра перейдем на WebSockets или gRPC — сервис останется без изменений!
3. **Graceful Shutdown в `index.ts`:**
   - Когда сервер перезагружается (например, в Kubernetes или при деплое), он должен не аварийно падать, а корректно дождаться завершения текущих клиентских запросов (`SIGTERM` / `SIGINT`).

---

### 🛠️ План реализации (Шаг за шагом)

Давай реализуем эти слои один за другим:

#### Шаг 1: Сервис и Контроллер для `workspaces`
1. Создать [apps/server/src/modules/workspaces/workspaces.service.ts](file:///home/abakar/pets/sreda/apps/server/src/modules/workspaces/workspaces.service.ts):
   ```typescript
   import type { Workspace } from '@sreda/shared';

   export class WorkspacesService {
     async getAll(): Promise<Workspace[]> {
       // Пока возвращаем мок, в Фазе 2 подключим Drizzle ORM + PostgreSQL
       return [
         {
           id: 'ws-1',
           name: 'Основной воркспейс',
           slug: 'main-workspace',
           ownerId: 'user-1',
           createdAt: new Date().toISOString(),
         },
       ];
     }
   }

   export const workspacesService = new WorkspacesService();
   ```

2. Создать [apps/server/src/modules/workspaces/workspaces.controller.ts](file:///home/abakar/pets/sreda/apps/server/src/modules/workspaces/workspaces.controller.ts):
   ```typescript
   import type { FastifyReply, FastifyRequest } from 'fastify';
   import type { ApiResponse, Workspace } from '@sreda/shared';
   import { workspacesService } from './workspaces.service';

   export class WorkspacesController {
     async getWorkspaces(
       _request: FastifyRequest,
       _reply: FastifyReply
     ): Promise<ApiResponse<Workspace[]>> {
       const workspaces = await workspacesService.getAll();
       return {
         success: true,
         data: workspaces,
       };
     }
   }

   export const workspacesController = new WorkspacesController();
   ```

3. Создать [apps/server/src/modules/workspaces/workspaces.routes.ts](file:///home/abakar/pets/sreda/apps/server/src/modules/workspaces/workspaces.routes.ts):
   ```typescript
   import type { FastifyPluginAsync } from 'fastify';
   import { workspacesController } from './workspaces.controller';

   export const workspacesRoutes: FastifyPluginAsync = async (fastify) => {
     fastify.get('/workspaces', workspacesController.getWorkspaces);
   };
   ```

---

#### Шаг 2: Модуль `health`
Создать [apps/server/src/modules/health/health.routes.ts](file:///home/abakar/pets/sreda/apps/server/src/modules/health/health.routes.ts):
```typescript
import type { FastifyPluginAsync } from 'fastify';

export const healthRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/health', async () => {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  });
};
```

---

#### Шаг 3: Фабрика `app.ts`
Создать [apps/server/src/app.ts](file:///home/abakar/pets/sreda/apps/server/src/app.ts):
```typescript
import Fastify from 'fastify';
import { healthRoutes } from './modules/health/health.routes';
import { workspacesRoutes } from './modules/workspaces/workspaces.routes';

export function buildApp() {
  const app = Fastify({
    logger: true,
  });

  // Регистрация модулей с префиксами
  app.register(healthRoutes);
  app.register(workspacesRoutes, { prefix: '/api/v1' });

  return app;
}
```

---

#### Шаг 4: Точка входа с Graceful Shutdown в `index.ts`
В [apps/server/src/index.ts](file:///home/abakar/pets/sreda/apps/server/src/index.ts):
```typescript
import { buildApp } from './app';

const app = buildApp();
const PORT = 3001;
const HOST = '0.0.0.0';

const start = async () => {
  try {
    await app.listen({ port: PORT, host: HOST });
    app.log.info(`Server listening on http://localhost:${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

// Graceful Shutdown (закрытие соединений при перезапуске/остановке)
const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
for (const signal of signals) {
  process.on(signal, async () => {
    app.log.info(`Received ${signal}, closing server...`);
    await app.close();
    process.exit(0);
  });
}

start();
```

---

Создай эти файлы руками, запусти сборку/проверку типов и напиши, как будешь готов! Если возникнут вопросы по архитектурным нюансам — сразу разберем.
