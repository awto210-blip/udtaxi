/**
 * УДАЧА TAXI - Маршруты аутентификации
 */

import { Hono } from 'hono'
import type { Bindings, RegisterRequest, LoginRequest, AuthResponse, User } from '../types'
import { hashPassword, verifyPassword, generateToken, generateReferralCode } from '../utils/auth'

const auth = new Hono<{ Bindings: Bindings }>()

/**
 * POST /api/auth/register - Регистрация нового пользователя
 */
auth.post('/register', async (c) => {
  try {
    const body: RegisterRequest = await c.req.json()
    const { email, phone, password, name, role, referral_code } = body

    // Валидация
    if (!email || !phone || !password || !name || !role) {
      return c.json<AuthResponse>({ 
        success: false, 
        error: 'Все поля обязательны' 
      }, 400)
    }

    if (!['passenger', 'driver'].includes(role)) {
      return c.json<AuthResponse>({ 
        success: false, 
        error: 'Неверная роль пользователя' 
      }, 400)
    }

    // Проверка существующего пользователя
    const existing = await c.env.DB.prepare(
      'SELECT id FROM users WHERE email = ? OR phone = ?'
    ).bind(email, phone).first()

    if (existing) {
      return c.json<AuthResponse>({ 
        success: false, 
        error: 'Пользователь с таким email или телефоном уже существует' 
      }, 409)
    }

    // Хеширование пароля
    const password_hash = await hashPassword(password)
    
    // Генерация реферального кода
    const user_referral_code = generateReferralCode(name)

    // Создание пользователя
    const result = await c.env.DB.prepare(`
      INSERT INTO users (email, phone, password_hash, name, role, referral_code, referred_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(email, phone, password_hash, name, role, user_referral_code, referral_code || null).run()

    const userId = result.meta.last_row_id

    // Если это водитель, создаём запись в drivers (заполнится позже)
    if (role === 'driver') {
      await c.env.DB.prepare(`
        INSERT INTO drivers (user_id, car_model, car_color, car_number, license_number)
        VALUES (?, ?, ?, ?, ?)
      `).bind(userId, 'Не указано', 'Не указано', 'Не указано', 'Не указано').run()
    }

    // Начисление реферального бонуса
    if (referral_code) {
      const referrer = await c.env.DB.prepare(
        'SELECT id, balance FROM users WHERE referral_code = ?'
      ).bind(referral_code).first<User>()

      if (referrer) {
        const bonusAmount = 100.0 // Из config
        
        // Начисляем бонус рефереру
        await c.env.DB.prepare(
          'UPDATE users SET balance = balance + ? WHERE id = ?'
        ).bind(bonusAmount, referrer.id).run()

        // Записываем реферальную связь
        await c.env.DB.prepare(`
          INSERT INTO referrals (referrer_id, referred_id, bonus_amount, is_paid, paid_at)
          VALUES (?, ?, ?, 1, datetime('now'))
        `).bind(referrer.id, userId, bonusAmount).run()

        // Транзакция для рефера
        await c.env.DB.prepare(`
          INSERT INTO transactions (user_id, type, amount, balance_before, balance_after, status, description)
          VALUES (?, 'referral_bonus', ?, ?, ?, 'completed', ?)
        `).bind(
          referrer.id,
          bonusAmount,
          referrer.balance,
          referrer.balance + bonusAmount,
          `Реферальный бонус за приглашение пользователя ${name}`
        ).run()
      }
    }

    // Получаем созданного пользователя
    const user = await c.env.DB.prepare(
      'SELECT * FROM users WHERE id = ?'
    ).bind(userId).first<User>()

    if (!user) {
      return c.json<AuthResponse>({ 
        success: false, 
        error: 'Ошибка создания пользователя' 
      }, 500)
    }

    // Генерация токена
    const token = await generateToken(user)

    // Убираем пароль из ответа
    const { password_hash: _, ...userWithoutPassword } = user

    return c.json<AuthResponse>({
      success: true,
      token,
      user: userWithoutPassword
    }, 201)

  } catch (error) {
    console.error('Registration error:', error)
    return c.json<AuthResponse>({ 
      success: false, 
      error: 'Ошибка регистрации' 
    }, 500)
  }
})

/**
 * POST /api/auth/login - Вход пользователя
 */
auth.post('/login', async (c) => {
  try {
    const body: LoginRequest = await c.req.json()
    const { email, password } = body

    if (!email || !password) {
      return c.json<AuthResponse>({ 
        success: false, 
        error: 'Email и пароль обязательны' 
      }, 400)
    }

    // Поиск пользователя
    const user = await c.env.DB.prepare(
      'SELECT * FROM users WHERE email = ?'
    ).bind(email).first<User>()

    if (!user) {
      return c.json<AuthResponse>({ 
        success: false, 
        error: 'Неверный email или пароль' 
      }, 401)
    }

    // Проверка пароля
    const isValidPassword = await verifyPassword(password, user.password_hash)
    
    if (!isValidPassword) {
      return c.json<AuthResponse>({ 
        success: false, 
        error: 'Неверный email или пароль' 
      }, 401)
    }

    // Проверка активности
    if (!user.is_active) {
      return c.json<AuthResponse>({ 
        success: false, 
        error: 'Аккаунт заблокирован' 
      }, 403)
    }

    // Генерация токена
    const token = await generateToken(user)

    // Убираем пароль из ответа
    const { password_hash: _, ...userWithoutPassword } = user

    return c.json<AuthResponse>({
      success: true,
      token,
      user: userWithoutPassword
    })

  } catch (error) {
    console.error('Login error:', error)
    return c.json<AuthResponse>({ 
      success: false, 
      error: 'Ошибка входа' 
    }, 500)
  }
})

/**
 * GET /api/auth/me - Получение текущего пользователя
 */
auth.get('/me', async (c) => {
  try {
    const userId = c.get('userId') // Устанавливается middleware
    
    if (!userId) {
      return c.json({ success: false, error: 'Не авторизован' }, 401)
    }

    const user = await c.env.DB.prepare(
      'SELECT * FROM users WHERE id = ?'
    ).bind(userId).first<User>()

    if (!user) {
      return c.json({ success: false, error: 'Пользователь не найден' }, 404)
    }

    const { password_hash: _, ...userWithoutPassword } = user

    return c.json({
      success: true,
      user: userWithoutPassword
    })

  } catch (error) {
    console.error('Get user error:', error)
    return c.json({ success: false, error: 'Ошибка получения данных' }, 500)
  }
})

export default auth
