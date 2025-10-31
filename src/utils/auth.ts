/**
 * УДАЧА TAXI - Утилиты аутентификации
 */

import type { User } from '../types'
import { config } from '../../config'

/**
 * Простой хеш пароля (в продакшене используйте bcrypt)
 */
export async function hashPassword(password: string): Promise<string> {
  // В продакшене замените на bcrypt или аналог
  const encoder = new TextEncoder()
  const data = encoder.encode(password + config.jwt.secret)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Проверка пароля
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password)
  return passwordHash === hash
}

/**
 * Генерация JWT токена
 */
export async function generateToken(user: User): Promise<string> {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  }

  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 дней
  }

  const encoder = new TextEncoder()
  const headerB64 = btoa(JSON.stringify(header))
  const payloadB64 = btoa(JSON.stringify(payload))
  const signature = await crypto.subtle.sign(
    'HMAC',
    await crypto.subtle.importKey(
      'raw',
      encoder.encode(config.jwt.secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    ),
    encoder.encode(`${headerB64}.${payloadB64}`)
  )

  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
  return `${headerB64}.${payloadB64}.${signatureB64}`
}

/**
 * Проверка JWT токена
 */
export async function verifyToken(token: string): Promise<any> {
  try {
    const [headerB64, payloadB64, signatureB64] = token.split('.')
    if (!headerB64 || !payloadB64 || !signatureB64) {
      return null
    }

    const payload = JSON.parse(atob(payloadB64))
    
    // Проверка срока действия
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null
    }

    return payload
  } catch (error) {
    return null
  }
}

/**
 * Генерация реферального кода
 */
export function generateReferralCode(name: string): string {
  const sanitized = name.toUpperCase().replace(/[^A-ZА-Я0-9]/g, '')
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${sanitized.substring(0, 4)}${random}`
}
