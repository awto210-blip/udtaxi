/**
 * УДАЧА TAXI - Утилиты расчёта стоимости
 */

import { config } from '../../config'
import type { RideEstimate } from '../types'

/**
 * Расчёт расстояния между двумя точками (формула Хаверсина)
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371 // Радиус Земли в км
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c // Расстояние в км
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * Приблизительный расчёт времени поездки
 * Средняя скорость в городе: 30 км/ч
 */
export function estimateDuration(distance: number): number {
  const averageSpeed = 30 // км/ч
  return Math.ceil((distance / averageSpeed) * 60) // минуты
}

/**
 * Расчёт стоимости поездки
 */
export function calculatePrice(distance: number, duration: number): number {
  const { baseFare, pricePerKm, pricePerMinute } = config.app.pricing
  
  const distancePrice = distance * pricePerKm
  const timePrice = duration * pricePerMinute
  
  return Math.ceil(baseFare + distancePrice + timePrice)
}

/**
 * Применение скидки
 */
export function applyDiscount(price: number, discountPercent: number): number {
  if (discountPercent <= 0) return 0
  return Math.floor(price * (discountPercent / 100))
}

/**
 * Расчёт комиссии
 */
export function calculateCommission(price: number): number {
  return Math.floor(price * config.app.pricing.commissionRate)
}

/**
 * Полный расчёт поездки
 */
export function estimateRide(
  pickup_lat: number,
  pickup_lng: number,
  dropoff_lat: number,
  dropoff_lng: number,
  isFirstRide: boolean = false,
  promoCode?: string
): RideEstimate {
  const distance = calculateDistance(pickup_lat, pickup_lng, dropoff_lat, dropoff_lng)
  const duration = estimateDuration(distance)
  const price = calculatePrice(distance, duration)
  
  // Применение скидок
  let discountPercent = 0
  if (isFirstRide) {
    discountPercent = config.app.referral.firstRideDiscount
  }
  // TODO: добавить проверку промокодов
  
  const discount = applyDiscount(price, discountPercent)
  const final_price = price - discount
  
  return {
    distance: Math.round(distance * 10) / 10, // округление до 0.1 км
    duration,
    price,
    discount,
    final_price
  }
}
