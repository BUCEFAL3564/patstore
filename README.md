# KeyHub — интернет-магазин цифровых ключей

Серверная часть и REST API интернет-магазина KeyHub и клиентское приложение (вёрстка прошлого семестра).

**Вариант 1:** Node.js + Express + MySQL 8 + Prisma ORM + Memcached; облако — TiDB Cloud, Render (Docker), Cloudinary.

## Ссылки

| Что | Адрес |
|---|---|
| API на Render | _будет добавлено после деплоя_ |
| Swagger (интерактивная документация) | _будет добавлено после деплоя_ · локально: http://localhost:3000/api/docs |
| Спецификация OpenAPI (JSON) | локально: http://localhost:3000/api/docs.json |
| Фронтенд | _будет добавлено после деплоя_ |

## Возможности API

- **Авторизация (JWT):** регистрация с хешированием пароля (bcrypt), вход, роли `customer` и `admin`.
- **Каталог:** поиск по названию и описанию без учёта регистра, фильтры по цене и рейтингу, сортировка по цене и названию, пагинация. Всё выполняется средствами БД (`WHERE` / `ORDER BY` / `LIMIT` / `OFFSET`).
- **Кэш:** ответы каталога кэшируются в Memcached по query-строке (TTL 90 с); при создании, изменении и удалении товара кэш сбрасывается. Заголовок `X-Cache: HIT | MISS | BYPASS`.
- **Управление товарами (admin):** добавление, изменение, удаление (soft-delete — внешние ключи корзин не ломаются).
- **Корзина:** добавление, изменение количества, удаление позиций; проверка остатка на складе.
- **Промокод:** `SAVE10` — скидка 10% к итогу корзины.

## Быстрый старт (Docker)

Нужен только [Docker Desktop](https://www.docker.com/products/docker-desktop/).

1. Клонировать репозиторий и перейти в папку бэкенда:
   ```bash
   git clone https://github.com/BUCEFAL3564/patstore.git
   cd patstore/server
   ```
2. Создать файл с переменными окружения из шаблона и задать в нём пароли и `JWT_SECRET`:
   ```bash
   cp .env.example .env
   ```
3. Собрать и запустить контейнеры `app`, `mysql` и `memcached`:
   ```bash
   docker compose up --build
   ```
   При первом запуске контейнер `app` сам применит миграции и наполнит пустую базу тестовыми данными: 15 игр, промокод SAVE10 и два пользователя.
4. Открыть http://localhost:3000/api/health — ответ `{"status":"ok","db":"ok"}` значит, что всё работает.
   Документация: http://localhost:3000/api/docs

Остановить: `docker compose down`. Данные БД хранятся в именованном volume `mysql_data` и переживают перезапуск. Удалить их вместе с контейнерами: `docker compose down -v`.

### Тестовые пользователи

Создаются при первом запуске (значения берутся из `.env`):

| Роль | Email | Пароль |
|---|---|---|
| admin | `admin@keyhub.local` | `Admin12345` |
| customer | `customer@keyhub.local` | `Customer12345` |

## Локальный запуск без Docker

Нужны Node.js 24 (LTS), MySQL 8 (или MariaDB 10.4+ из XAMPP) и, по желанию, Memcached.

```bash
cd server
cp .env.example .env        # указать DATABASE_URL своей БД и JWT_SECRET
npm install
npx prisma migrate deploy   # создать таблицы
npm run db:seed             # тестовые данные
npm run dev                 # сервер с автоперезапуском: http://localhost:3000
```

Memcached проще всего запустить в Docker: `docker run -d -p 11211:11211 memcached:1.6-alpine`. Без него API работает напрямую с БД (`X-Cache: BYPASS`).

## Переменные окружения

Все переменные — в `server/.env` (в репозиторий не попадает), шаблон — [`server/.env.example`](server/.env.example).

| Переменная | Обязательна | Описание | Пример |
|---|---|---|---|
| `PORT` | нет | Порт сервера (по умолчанию 3000) | `3000` |
| `DATABASE_URL` | да | Строка подключения к MySQL. В Docker Compose собирается автоматически из `MYSQL_*` | `mysql://user:pass@localhost:3306/keyhub` |
| `JWT_SECRET` | да | Секрет подписи токенов — длинная случайная строка. Без него сервер не запустится | — |
| `JWT_EXPIRES_IN` | нет | Срок жизни токена (по умолчанию `1d`) | `1d` |
| `CORS_ORIGIN` | нет | Адреса фронтенда через запятую. Пусто — разрешены все (только для разработки) | `https://keyhub.example.com` |
| `MEMCACHED_SERVERS` | нет | Адрес Memcached `host:port`. Пусто — кэш выключен. В Docker Compose задаётся автоматически | `localhost:11211` |
| `CACHE_TTL_SECONDS` | нет | Время жизни кэша каталога в секундах (по умолчанию 90) | `90` |
| `PRISMA_LOG` | нет | `query` — печатать SQL-запросы в лог (видно, что фильтры выполняются в БД) | `query` |
| `SEED_ADMIN_EMAIL` | да* | Email администратора для наполнения БД | `admin@keyhub.local` |
| `SEED_ADMIN_PASSWORD` | да* | Пароль администратора | — |
| `SEED_CUSTOMER_EMAIL` | да* | Email тестового покупателя | `customer@keyhub.local` |
| `SEED_CUSTOMER_PASSWORD` | да* | Пароль тестового покупателя | — |
| `MYSQL_ROOT_PASSWORD` | для Docker | Пароль root контейнера MySQL | — |
| `MYSQL_DATABASE` | для Docker | Имя базы в контейнере MySQL | `keyhub` |
| `MYSQL_USER` | для Docker | Пользователь БД в контейнере MySQL | `keyhub` |
| `MYSQL_PASSWORD` | для Docker | Его пароль (только буквы и цифры: подставляется в `DATABASE_URL`) | — |
| `APP_PORT` | нет | Порт API на хосте при запуске через Docker Compose | `3000` |

\* нужны для наполнения БД (`npm run db:seed` и первый запуск контейнера).

## Эндпоинты

Подробно, с примерами и возможностью отправить запрос — в Swagger (`/api/docs`).

| Метод | Путь | Доступ | Описание |
|---|---|---|---|
| GET | `/api/health` | все | Состояние сервиса и БД |
| POST | `/api/auth/register` | все | Регистрация |
| POST | `/api/auth/login` | все | Вход, выдаёт JWT |
| GET | `/api/auth/me` | токен | Текущий пользователь |
| GET | `/api/products` | все | Каталог: `page`, `limit`, `search`, `min_price`, `max_price`, `min_rating`, `sort_by` (`price`/`title`), `order` (`asc`/`desc`) |
| GET | `/api/products/:id` | все | Один товар |
| POST | `/api/products` | admin | Добавить товар |
| PATCH | `/api/products/:id` | admin | Изменить товар |
| DELETE | `/api/products/:id` | admin | Удалить товар (soft-delete) |
| GET | `/api/cart` | токен | Моя корзина |
| POST | `/api/cart/items` | токен | Добавить товар в корзину |
| PATCH | `/api/cart/items/:id` | токен | Изменить количество |
| DELETE | `/api/cart/items/:id` | токен | Убрать позицию |
| POST | `/api/cart/apply-promo` | токен | Применить промокод (`SAVE10`) |
| DELETE | `/api/cart/promo` | токен | Убрать промокод |

Токен передаётся в заголовке `Authorization: Bearer <token>`.

Пример ответа каталога:

```json
{
  "items": [{ "id": 1, "title": "Cyberpunk 2077", "price": 29.99, "rating": 4.5, "images": ["…", "…", "…"] }],
  "meta": { "total_items": 15, "total_pages": 2, "current_page": 1, "limit": 12 }
}
```

## Структура проекта

```
.
├── index.html, product.html, cart.html, …   клиентское приложение (HTML/CSS/JS)
├── css/, js/, assets/
└── server/                                    бэкенд
    ├── Dockerfile                             multi-stage сборка, запуск от USER node
    ├── docker-compose.yml                     app + mysql + memcached
    ├── .env.example                           шаблон переменных окружения
    ├── prisma/
    │   ├── schema.prisma                      модели User, Product, Cart, CartItem, PromoCode
    │   ├── migrations/                        миграции БД
    │   ├── seed.js                            тестовые данные
    │   └── data/products.json
    └── src/
        ├── index.js, app.js, start.js         запуск сервера и приложение Express
        ├── routes/, controllers/              эндпоинты
        ├── middleware/                        JWT, роли, валидация, ошибки
        ├── validators/                        схемы проверки входных данных (zod)
        ├── services/catalogCache.js           кэш каталога в Memcached
        └── docs/openapi.js                    спецификация OpenAPI (Swagger)
```

## Git

Git Flow: рабочая ветка `main`, разработка — в `develop` через ветки фич (`feature/auth`, `feature/products-cache`, `feature/cart` и др.), слияние через Pull Request. Сообщения коммитов — в формате [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `chore:`, `refactor:`).
