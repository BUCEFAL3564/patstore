// Спецификация OpenAPI 3.0 для Swagger UI (/api/docs) и машиночитаемого /api/docs.json

const ref = (name) => ({ $ref: `#/components/schemas/${name}` });
const json = (schema, example) => ({ 'application/json': { schema, ...(example && { example }) } });
const response = (description, schema, example) => ({ description, ...(schema && { content: json(schema, example) }) });
const error = (description, example) => response(description, ref('Error'), example);

const errors = {
  400: error('Неверные данные (подробности в details)', {
    error: 'Validation failed',
    details: [{ field: 'price', message: 'price must be >= 0' }],
  }),
  401: error('Нет токена, токен неверный или истёк', { error: 'Authorization token is required' }),
  403: error('Недостаточно прав (нужна роль admin)', { error: 'Forbidden: insufficient role' }),
  404: (what) => error(`${what} не найден`, { error: `${what} not found` }),
  409: error('Конфликт с текущим состоянием (например, нет столько на складе)', {
    error: 'Not enough stock',
    details: [{ field: 'quantity', message: 'only 10 left in stock' }],
  }),
};

const idParam = (description) => ({
  name: 'id',
  in: 'path',
  required: true,
  description,
  schema: { type: 'integer', minimum: 1 },
});

const cartResponse = (description) => response(description, ref('Cart'));

module.exports = {
  openapi: '3.0.3',
  info: {
    title: 'KeyHub API',
    version: '1.0.0',
    description: [
      'REST API интернет-магазина цифровых ключей KeyHub.',
      '',
      '**Стек (вариант 1):** Node.js, Express, MySQL 8, Prisma ORM, Memcached.',
      '',
      '**Авторизация:** получите токен через `POST /api/auth/login`, нажмите **Authorize** и вставьте его.',
      'Тестовые пользователи (из сида): `admin@keyhub.local` / `Admin12345`, `customer@keyhub.local` / `Customer12345`.',
      '',
      '**Ошибки** возвращаются в формате `{ "error": "...", "details": [...] }`, где `details` есть у ошибок валидации.',
    ].join('\n'),
  },
  servers: [{ url: '/', description: 'Текущий сервер' }],
  tags: [
    { name: 'Health', description: 'Состояние сервиса' },
    { name: 'Auth', description: 'Регистрация, вход, текущий пользователь (JWT)' },
    { name: 'Products', description: 'Каталог: поиск, фильтры, сортировка и пагинация в БД; кэш Memcached' },
    { name: 'Products (admin)', description: 'Управление товарами — только роль admin' },
    { name: 'Cart', description: 'Личная корзина и промокод — нужен токен' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    headers: {
      XCache: {
        description: 'Откуда взят ответ: HIT — из Memcached, MISS — из БД (и положен в кэш), BYPASS — кэш недоступен',
        schema: { type: 'string', enum: ['HIT', 'MISS', 'BYPASS'] },
      },
    },
    schemas: {
      Error: {
        type: 'object',
        required: ['error'],
        properties: {
          error: { type: 'string', example: 'Validation failed' },
          details: {
            type: 'array',
            items: {
              type: 'object',
              properties: { field: { type: 'string' }, message: { type: 'string' } },
            },
          },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 2 },
          email: { type: 'string', format: 'email', example: 'customer@keyhub.local' },
          role: { type: 'string', enum: ['customer', 'admin'] },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      Credentials: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'customer@keyhub.local' },
          password: { type: 'string', minLength: 8, maxLength: 72, example: 'Customer12345' },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          token: { type: 'string', description: 'JWT, передаётся в заголовке Authorization: Bearer <token>' },
          user: ref('User'),
        },
      },
      Product: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          title: { type: 'string', example: 'Cyberpunk 2077' },
          description: { type: 'string', example: 'Cyberpunk 2077 — ролевая игра с открытым миром…' },
          price: { type: 'number', example: 29.99 },
          rating: { type: 'number', minimum: 0, maximum: 5, example: 4.5 },
          images: {
            type: 'array',
            minItems: 3,
            items: { type: 'string', format: 'uri' },
            example: ['https://example.com/1.webp', 'https://example.com/2.webp', 'https://example.com/3.webp'],
          },
          category: { type: 'string', nullable: true, example: 'Экшены' },
          platform: { type: 'string', nullable: true, example: 'Steam' },
          stock_quantity: { type: 'integer', example: 50 },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      ProductInput: {
        type: 'object',
        description: 'Поля id, created_at и deleted_at задать нельзя — они игнорируются',
        properties: {
          title: { type: 'string', minLength: 1, maxLength: 255, example: 'New Game' },
          description: { type: 'string', maxLength: 5000, default: '' },
          price: { type: 'number', minimum: 0, description: 'Не больше 2 знаков после запятой', example: 19.99 },
          rating: { type: 'number', minimum: 0, maximum: 5, default: 0, description: 'Не больше 1 знака после запятой' },
          images: {
            type: 'array',
            minItems: 3,
            maxItems: 10,
            items: { type: 'string', format: 'uri', description: 'Только http(s)' },
            example: ['https://example.com/1.webp', 'https://example.com/2.webp', 'https://example.com/3.webp'],
          },
          category: { type: 'string', nullable: true, maxLength: 100, description: 'Пустая строка = null' },
          platform: { type: 'string', nullable: true, maxLength: 50 },
          stock_quantity: { type: 'integer', minimum: 0, default: 0 },
        },
      },
      ProductList: {
        type: 'object',
        properties: {
          items: { type: 'array', items: ref('Product') },
          meta: {
            type: 'object',
            properties: {
              total_items: { type: 'integer', example: 15 },
              total_pages: { type: 'integer', example: 2 },
              current_page: { type: 'integer', example: 1 },
              limit: { type: 'integer', example: 12 },
            },
          },
        },
      },
      CartItem: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'id позиции — используется в PATCH/DELETE /api/cart/items/{id}' },
          product_id: { type: 'integer' },
          quantity: { type: 'integer', minimum: 1, maximum: 99 },
          line_total: { type: 'number', example: 59.98 },
          is_available: {
            type: 'boolean',
            description: 'false — товар удалён админом; позиция не входит в сумму, её можно только удалить',
          },
          product: ref('Product'),
        },
      },
      Cart: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          items: { type: 'array', items: ref('CartItem') },
          total_quantity: { type: 'integer', example: 3 },
          subtotal: { type: 'number', example: 79.97 },
          promo: {
            type: 'object',
            nullable: true,
            properties: {
              code: { type: 'string', example: 'SAVE10' },
              discount_percentage: { type: 'integer', example: 10 },
            },
          },
          discount: { type: 'number', example: 8 },
          total: { type: 'number', example: 71.97 },
        },
      },
    },
  },
  paths: {
    '/api/health': {
      get: {
        tags: ['Health'],
        summary: 'Проверка сервиса и подключения к БД',
        responses: {
          200: response('Сервис и БД работают', { type: 'object' }, { status: 'ok', db: 'ok' }),
          503: response('БД недоступна', { type: 'object' }, { status: 'error', db: 'unavailable' }),
        },
      },
    },

    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Регистрация',
        description: 'Пароль хешируется bcrypt. Роль всегда customer (поле role в запросе игнорируется).',
        requestBody: { required: true, content: json(ref('Credentials')) },
        responses: {
          201: response('Пользователь создан, выдан токен', ref('AuthResponse')),
          400: errors[400],
          409: error('Email уже зарегистрирован', { error: 'Email is already registered' }),
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Вход — выдаёт JWT',
        requestBody: { required: true, content: json(ref('Credentials')) },
        responses: {
          200: response('Успешный вход', ref('AuthResponse')),
          400: errors[400],
          401: error('Неверный email или пароль', { error: 'Invalid email or password' }),
        },
      },
    },
    '/api/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Текущий пользователь по токену',
        security: [{ bearerAuth: [] }],
        responses: {
          200: response('Пользователь', { type: 'object', properties: { user: ref('User') } }),
          401: errors[401],
        },
      },
    },

    '/api/products': {
      get: {
        tags: ['Products'],
        summary: 'Каталог с поиском, фильтрами, сортировкой и пагинацией',
        description:
          'Все операции выполняются в БД (WHERE / ORDER BY / LIMIT / OFFSET). Ответ кэшируется в Memcached ' +
          'по query-строке на 90 секунд; кэш сбрасывается при любом изменении товаров. Токен не нужен.',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 12 } },
          {
            name: 'search',
            in: 'query',
            description: 'Подстрока в названии или описании, без учёта регистра',
            schema: { type: 'string', maxLength: 100 },
          },
          { name: 'min_price', in: 'query', schema: { type: 'number', minimum: 0 } },
          { name: 'max_price', in: 'query', schema: { type: 'number', minimum: 0 } },
          { name: 'min_rating', in: 'query', schema: { type: 'number', minimum: 0, maximum: 5 } },
          { name: 'sort_by', in: 'query', schema: { type: 'string', enum: ['price', 'title'] } },
          { name: 'order', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'asc' } },
        ],
        responses: {
          200: {
            ...response('Страница каталога', ref('ProductList')),
            headers: { 'X-Cache': { $ref: '#/components/headers/XCache' } },
          },
          400: errors[400],
        },
      },
      post: {
        tags: ['Products (admin)'],
        summary: 'Добавить товар',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: json({ allOf: [ref('ProductInput')], required: ['title', 'price', 'images'] }),
        },
        responses: {
          201: {
            ...response('Товар создан; кэш каталога сброшен', ref('Product')),
            headers: { Location: { description: 'Адрес нового товара', schema: { type: 'string' } } },
          },
          400: errors[400],
          401: errors[401],
          403: errors[403],
        },
      },
    },
    '/api/products/{id}': {
      parameters: [idParam('id товара')],
      get: {
        tags: ['Products'],
        summary: 'Один товар',
        responses: { 200: response('Товар', ref('Product')), 400: errors[400], 404: errors[404]('Product') },
      },
      patch: {
        tags: ['Products (admin)'],
        summary: 'Изменить товар (любые поля)',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: json(ref('ProductInput')) },
        responses: {
          200: response('Обновлённый товар; кэш каталога сброшен', ref('Product')),
          400: errors[400],
          401: errors[401],
          403: errors[403],
          404: errors[404]('Product'),
        },
      },
      delete: {
        tags: ['Products (admin)'],
        summary: 'Удалить товар (soft-delete)',
        description:
          'Строка остаётся в БД с deleted_at, поэтому внешние ключи корзин не ломаются. ' +
          'Товар пропадает из каталога, кэш каталога сбрасывается.',
        security: [{ bearerAuth: [] }],
        responses: {
          204: { description: 'Удалён' },
          400: errors[400],
          401: errors[401],
          403: errors[403],
          404: errors[404]('Product'),
        },
      },
    },

    '/api/cart': {
      get: {
        tags: ['Cart'],
        summary: 'Моя корзина',
        description: 'Корзина создаётся при первом обращении. Деньги считаются в центах.',
        security: [{ bearerAuth: [] }],
        responses: { 200: cartResponse('Корзина'), 401: errors[401] },
      },
    },
    '/api/cart/items': {
      post: {
        tags: ['Cart'],
        summary: 'Добавить товар в корзину',
        description: 'Повторное добавление того же товара увеличивает количество.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: json({
            type: 'object',
            required: ['product_id'],
            properties: {
              product_id: { type: 'integer', example: 1 },
              quantity: { type: 'integer', minimum: 1, maximum: 99, default: 1, example: 2 },
            },
          }),
        },
        responses: {
          201: cartResponse('Товар добавлен новой позицией'),
          200: cartResponse('Количество существующей позиции увеличено'),
          400: errors[400],
          401: errors[401],
          404: errors[404]('Product'),
          409: errors[409],
        },
      },
    },
    '/api/cart/items/{id}': {
      parameters: [idParam('id позиции корзины (CartItem.id)')],
      patch: {
        tags: ['Cart'],
        summary: 'Изменить количество',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: json({
            type: 'object',
            required: ['quantity'],
            properties: { quantity: { type: 'integer', minimum: 1, maximum: 99, example: 3 } },
          }),
        },
        responses: {
          200: cartResponse('Корзина после изменения'),
          400: errors[400],
          401: errors[401],
          404: errors[404]('Cart item'),
          409: errors[409],
        },
      },
      delete: {
        tags: ['Cart'],
        summary: 'Убрать позицию из корзины',
        security: [{ bearerAuth: [] }],
        responses: {
          200: cartResponse('Корзина после удаления'),
          400: errors[400],
          401: errors[401],
          404: errors[404]('Cart item'),
        },
      },
    },
    '/api/cart/apply-promo': {
      post: {
        tags: ['Cart'],
        summary: 'Применить промокод',
        description:
          'Проверяет промокод (регистр не важен) и считает итог со скидкой. Промокод сохраняется в корзине, ' +
          'и скидка пересчитывается при изменении корзины.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: json({
            type: 'object',
            required: ['code'],
            properties: { code: { type: 'string', maxLength: 50, example: 'SAVE10' } },
          }),
        },
        responses: {
          200: cartResponse('Корзина с subtotal, discount и total'),
          400: error('Неверный формат или промокод выключен', { error: 'Promo code is not active' }),
          401: errors[401],
          404: errors[404]('Promo code'),
        },
      },
    },
    '/api/cart/promo': {
      delete: {
        tags: ['Cart'],
        summary: 'Убрать промокод',
        security: [{ bearerAuth: [] }],
        responses: { 200: cartResponse('Корзина без скидки'), 401: errors[401] },
      },
    },
  },
};
