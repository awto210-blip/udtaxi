# 📡 УДАЧА TAXI - API Документация

## Базовый URL
```
http://localhost:3000/api
```

## 🔐 Аутентификация

Для защищённых эндпоинтов используйте заголовок:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 📝 Auth API

### POST /api/auth/register
Регистрация нового пользователя

**Запрос:**
```json
{
  "email": "user@example.com",
  "phone": "+79001234567",
  "password": "password123",
  "name": "Иван Иванов",
  "role": "passenger", // или "driver"
  "referral_code": "IVAN2025" // опционально
}
```

**Ответ:**
```json
{
  "success": true,
  "token": "eyJhbGci...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "Иван Иванов",
    "role": "passenger",
    "balance": 0,
    "referral_code": "ИВАНAB12"
  }
}
```

### POST /api/auth/login
Вход в систему

**Запрос:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Ответ:**
```json
{
  "success": true,
  "token": "eyJhbGci...",
  "user": { ... }
}
```

### GET /api/auth/me
Получить текущего пользователя (требуется токен)

**Ответ:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "balance": 500
  }
}
```

---

## 🚗 Rides API

### POST /api/rides/estimate
Расчёт стоимости поездки

**Запрос:**
```json
{
  "pickup_lat": 56.8519,
  "pickup_lng": 53.2048,
  "dropoff_lat": 56.8619,
  "dropoff_lng": 53.2148
}
```

**Ответ:**
```json
{
  "success": true,
  "estimate": {
    "distance": 5.2,
    "duration": 15,
    "price": 175,
    "discount": 0,
    "final_price": 175
  }
}
```

### POST /api/rides/create
Создать новую поездку (требуется токен)

**Запрос:**
```json
{
  "pickup_address": "Ижевск, ул. Пушкинская, 268",
  "pickup_lat": 56.8519,
  "pickup_lng": 53.2048,
  "dropoff_address": "Ижевск, ул. Советская, 32",
  "dropoff_lat": 56.8619,
  "dropoff_lng": 53.2148,
  "payment_method": "card", // "cash", "card", "balance"
  "promo_code": "FIRST50" // опционально
}
```

**Ответ:**
```json
{
  "success": true,
  "ride": {
    "id": 1,
    "status": "pending",
    "price": 175,
    "distance": 5.2
  }
}
```

### GET /api/rides
Получить список поездок (требуется токен)

**Ответ:**
```json
{
  "success": true,
  "rides": [
    {
      "id": 1,
      "status": "completed",
      "pickup_address": "...",
      "dropoff_address": "...",
      "price": 175,
      "created_at": "2025-10-31T18:00:00"
    }
  ]
}
```

### GET /api/rides/pending
Получить доступные заказы (только для водителей)

**Ответ:**
```json
{
  "success": true,
  "rides": [
    {
      "id": 5,
      "passenger_name": "Анна Пассажирова",
      "pickup_address": "...",
      "dropoff_address": "...",
      "price": 175,
      "distance": 5.2,
      "duration": 15
    }
  ]
}
```

### POST /api/rides/:id/accept
Принять заказ (только для водителей)

**Ответ:**
```json
{
  "success": true,
  "message": "Заказ принят"
}
```

### POST /api/rides/:id/start
Начать поездку (только для водителей)

**Ответ:**
```json
{
  "success": true,
  "message": "Поездка начата"
}
```

### POST /api/rides/:id/complete
Завершить поездку (только для водителей)

**Ответ:**
```json
{
  "success": true,
  "message": "Поездка завершена"
}
```

### POST /api/rides/:id/cancel
Отменить поездку

**Ответ:**
```json
{
  "success": true,
  "message": "Поездка отменена"
}
```

### POST /api/rides/:id/rate
Оценить поездку (только для пассажиров после завершения)

**Запрос:**
```json
{
  "rating": 5, // 1-5
  "comment": "Отличная поездка!"
}
```

**Ответ:**
```json
{
  "success": true,
  "message": "Спасибо за оценку!"
}
```

---

## 👨‍💼 Admin API

### POST /api/admin/init-db
Инициализировать базу данных (один раз при первом запуске)

**Ответ:**
```json
{
  "success": true,
  "message": "База данных успешно инициализирована"
}
```

### GET /api/admin/stats
Получить статистику (для админ-панели)

**Ответ:**
```json
{
  "success": true,
  "stats": {
    "total_users": 150,
    "total_drivers": 50,
    "total_passengers": 100,
    "total_rides": 500,
    "completed_rides": 480,
    "total_revenue": 85000,
    "commission_earned": 12750,
    "pending_withdrawals": 5,
    "pending_withdrawals_amount": 15000
  }
}
```

---

## 🌐 Public API

### GET /api/info
Информация о приложении (без авторизации)

**Ответ:**
```json
{
  "name": "УДАЧА TAXI",
  "version": "1.0.0",
  "slogan": "Твоя удачная дорога по Удмуртии!"
}
```

---

## ⚠️ Коды ошибок

| Код | Описание |
|-----|----------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request (неверные данные) |
| 401 | Unauthorized (требуется авторизация) |
| 403 | Forbidden (недостаточно прав) |
| 404 | Not Found |
| 409 | Conflict (пользователь уже существует) |
| 500 | Internal Server Error |

---

## 💡 Примеры использования

### Полный флоу пассажира

```bash
# 1. Регистрация
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "passenger@test.ru",
    "phone": "+79001111111",
    "password": "password123",
    "name": "Анна Пассажирова",
    "role": "passenger"
  }'

# 2. Расчёт стоимости
curl -X POST http://localhost:3000/api/rides/estimate \
  -H "Content-Type: application/json" \
  -d '{
    "pickup_lat": 56.8519,
    "pickup_lng": 53.2048,
    "dropoff_lat": 56.8619,
    "dropoff_lng": 53.2148
  }'

# 3. Создание заказа
curl -X POST http://localhost:3000/api/rides/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "pickup_address": "Ижевск, ул. Пушкинская, 268",
    "pickup_lat": 56.8519,
    "pickup_lng": 53.2048,
    "dropoff_address": "Ижевск, ул. Советская, 32",
    "dropoff_lat": 56.8619,
    "dropoff_lng": 53.2148,
    "payment_method": "card"
  }'
```

### Полный флоу водителя

```bash
# 1. Регистрация
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "driver@test.ru",
    "phone": "+79002222222",
    "password": "password123",
    "name": "Иван Водителев",
    "role": "driver"
  }'

# 2. Получить доступные заказы
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/rides/pending

# 3. Принять заказ
curl -X POST http://localhost:3000/api/rides/1/accept \
  -H "Authorization: Bearer YOUR_TOKEN"

# 4. Начать поездку
curl -X POST http://localhost:3000/api/rides/1/start \
  -H "Authorization: Bearer YOUR_TOKEN"

# 5. Завершить поездку
curl -X POST http://localhost:3000/api/rides/1/complete \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

**Версия API**: 1.0.0  
**Последнее обновление**: 2025-10-31
