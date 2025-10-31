/**
 * УДАЧА TAXI - Middleware для аутентификации
 */

import type { Context, Next } from 'hono'
import type { Bindings } from '../types'
import { verifyToken } from './auth'

/**
 * Middleware для проверки JWT токена
 */
export async function authMiddleware(
  c: Context<{ Bindings: Bindings }>,
  next: Next
) {
  const authHeader = c.req.header('Authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ success: false, error: 'Требуется авторизация' }, 401)
  }

  const token = authHeader.substring(7) // Убираем 'Bearer '
  const payload = await verifyToken(token)

  if (!payload) {
    return c.json({ success: false, error: 'Неверный или истёкший токен' }, 401)
  }

  // Устанавливаем данные пользователя в контекст
  c.set('userId', payload.id)
  c.set('userEmail', payload.email)
  c.set('userRole', payload.role)

  await next()
}

/**
 * Middleware для проверки роли администратора
 */
export async function adminMiddleware(
  c: Context<{ Bindings: Bindings }>,
  next: Next
) {
  const userRole = c.get('userRole')
  
  if (userRole !== 'admin') {
    return c.json({ success: false, error: 'Доступ запрещён' }, 403)
  }

  await next()
}

/**
 * Middleware для проверки роли водителя
 */
export async function driverMiddleware(
  c: Context<{ Bindings: Bindings }>,
  next: Next
) {
  const userRole = c.get('userRole')
  
  if (userRole !== 'driver') {
    return c.json({ success: false, error: 'Доступ только для водителей' }, 403)
  }

  await next()
}
