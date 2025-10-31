# 🚀 Деплой УДАЧА TAXI на Cloudflare Pages

## Предварительные требования

- Аккаунт на Cloudflare (бесплатный)
- Cloudflare API Token (для wrangler)
- Проект в GitHub (опционально, но рекомендуется)

---

## 📦 Метод 1: Быстрый деплой через wrangler

### Шаг 1: Настройка Cloudflare API

```bash
# Настройте API токен (выполните эту команду ПЕРЕД деплоем)
# Инструмент setup_cloudflare_api_key настроит окружение автоматически
```

Если у вас нет API токена:
1. Перейдите на https://dash.cloudflare.com/profile/api-tokens
2. Создайте новый токен с разрешениями для Cloudflare Pages
3. Скопируйте токен

### Шаг 2: Создание D1 базы данных (продакшен)

```bash
# Создайте продакшен базу данных
npx wrangler d1 create udacha-taxi-db
```

Скопируйте `database_id` из вывода команды и вставьте в `wrangler.jsonc`:

```jsonc
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "udacha-taxi-db",
      "database_id": "ваш-database-id-здесь"
    }
  ]
}
```

### Шаг 3: Применение миграций к продакшен БД

**ВАЖНО**: После деплоя приложения, инициализируйте БД через API:

```bash
# После первого деплоя выполните:
curl -X POST https://udacha-taxi.pages.dev/api/admin/init-db
```

### Шаг 4: Настройка секретов (опционально для ЮKassa и Яндекс.Карт)

```bash
# Добавьте секреты для продакшена
npx wrangler pages secret put YANDEX_MAPS_API_KEY --project-name udacha-taxi
npx wrangler pages secret put YUKASSA_SHOP_ID --project-name udacha-taxi
npx wrangler pages secret put YUKASSA_SECRET_KEY --project-name udacha-taxi
npx wrangler pages secret put JWT_SECRET --project-name udacha-taxi
```

### Шаг 5: Создание проекта и деплой

```bash
# Сборка проекта
npm run build

# Создайте проект на Cloudflare Pages
npx wrangler pages project create udacha-taxi --production-branch main

# Деплой
npx wrangler pages deploy dist --project-name udacha-taxi
```

После деплоя вы получите URL:
- **Production**: https://udacha-taxi.pages.dev
- **Branch**: https://main.udacha-taxi.pages.dev

### Шаг 6: Инициализация БД в продакшене

```bash
# ОБЯЗАТЕЛЬНО выполните после первого деплоя:
curl -X POST https://udacha-taxi.pages.dev/api/admin/init-db
```

---

## 🔄 Метод 2: Деплой через GitHub (CI/CD)

### Шаг 1: Пуш в GitHub

```bash
# Настройте GitHub окружение
# (используйте setup_github_environment перед push)

# Добавьте remote
git remote add origin https://github.com/ваш-username/udacha-taxi.git

# Пуш в main
git push -u origin main
```

### Шаг 2: Подключите GitHub к Cloudflare Pages

1. Перейдите на https://dash.cloudflare.com
2. Pages → Create a project → Connect to Git
3. Выберите ваш репозиторий `udacha-taxi`
4. Настройте билд:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/`

### Шаг 3: Настройте переменные окружения

В настройках проекта Cloudflare Pages добавьте:
- `YANDEX_MAPS_API_KEY` (из Яндекс.Карты)
- `YUKASSA_SHOP_ID` (из ЮKassa)
- `YUKASSA_SECRET_KEY` (из ЮKassa)
- `JWT_SECRET` (сгенерируйте случайную строку)

### Шаг 4: Добавьте D1 биндинг

В настройках проекта:
1. Settings → Functions → D1 database bindings
2. Добавьте биндинг:
   - **Variable name**: `DB`
   - **D1 database**: `udacha-taxi-db`

### Шаг 5: Инициализация

После успешного деплоя:
```bash
curl -X POST https://ваш-проект.pages.dev/api/admin/init-db
```

---

## 🌐 Настройка пользовательского домена (опционально)

### Шаг 1: Добавьте домен в Cloudflare

```bash
npx wrangler pages domain add taxi.удмуртия.рф --project-name udacha-taxi
```

Или через дашборд:
1. Pages → udacha-taxi → Custom domains
2. Set up a custom domain
3. Введите ваш домен
4. Следуйте инструкциям по настройке DNS

### Шаг 2: Настройка DNS

Добавьте CNAME запись:
```
taxi.удмуртия.рф CNAME udacha-taxi.pages.dev
```

---

## 🔍 Проверка деплоя

### 1. Проверьте статус
```bash
npx wrangler pages deployment list --project-name udacha-taxi
```

### 2. Проверьте работу API
```bash
curl https://udacha-taxi.pages.dev/api/info
```

Должно вернуть:
```json
{
  "name": "УДАЧА TAXI",
  "version": "1.0.0",
  "slogan": "Твоя удачная дорога по Удмуртии!"
}
```

### 3. Проверьте статистику
```bash
curl https://udacha-taxi.pages.dev/api/admin/stats
```

### 4. Откройте в браузере
```
https://udacha-taxi.pages.dev
```

---

## 🐛 Решение проблем

### Ошибка: "database not found"

Убедитесь что:
1. `database_id` правильно указан в `wrangler.jsonc`
2. D1 биндинг добавлен в настройках проекта
3. БД инициализирована через `/api/admin/init-db`

### Ошибка: "unauthorized"

1. Проверьте что API токен имеет нужные права
2. Выполните `npx wrangler whoami` для проверки аутентификации

### Ошибка при билде

```bash
# Очистите кеш и пересоберите
rm -rf dist node_modules .wrangler
npm install
npm run build
```

### База данных пустая после деплоя

```bash
# Инициализируйте БД через API
curl -X POST https://ваш-url.pages.dev/api/admin/init-db
```

---

## 📊 Мониторинг

### Просмотр логов
```bash
npx wrangler pages deployment tail --project-name udacha-taxi
```

### Просмотр метрик
1. Cloudflare Dashboard → Pages → udacha-taxi
2. Analytics → View details

---

## 🔄 Обновление приложения

### Через wrangler (ручной деплой)
```bash
git pull origin main
npm run build
npx wrangler pages deploy dist --project-name udacha-taxi
```

### Через GitHub (автоматический деплой)
```bash
git add .
git commit -m "feat: новая функция"
git push origin main
# Деплой запустится автоматически
```

---

## 💰 Стоимость

**Cloudflare Pages Free Plan:**
- ✅ Unlimited requests
- ✅ Unlimited bandwidth
- ✅ 500 builds per month
- ✅ D1 Database: 5GB storage, 5M reads/day
- ✅ Custom domains

**Для большинства проектов бесплатный план более чем достаточен!**

---

## 📞 Поддержка

- Документация Cloudflare: https://developers.cloudflare.com/pages
- Cloudflare Community: https://community.cloudflare.com
- GitHub Issues: https://github.com/ваш-username/udacha-taxi/issues

---

**Создано для УДАЧА TAXI**  
**Версия**: 1.0.0  
**Дата**: 2025-10-31
