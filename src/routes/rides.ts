/**
 * УДАЧА TAXI - Маршруты поездок
 */

import { Hono } from 'hono'
import type { Bindings, CreateRideRequest, Ride, User } from '../types'
import { estimateRide, calculateCommission } from '../utils/pricing'

const rides = new Hono<{ Bindings: Bindings }>()

/**
 * POST /api/rides/estimate - Расчёт стоимости поездки
 */
rides.post('/estimate', async (c) => {
  try {
    const body = await c.req.json()
    const { pickup_lat, pickup_lng, dropoff_lat, dropoff_lng } = body

    if (!pickup_lat || !pickup_lng || !dropoff_lat || !dropoff_lng) {
      return c.json({ 
        success: false, 
        error: 'Необходимо указать координаты начала и конца поездки' 
      }, 400)
    }

    const userId = c.get('userId')
    let isFirstRide = false

    // Проверяем, первая ли это поездка
    if (userId) {
      const ridesCount = await c.env.DB.prepare(
        'SELECT COUNT(*) as count FROM rides WHERE passenger_id = ? AND status = "completed"'
      ).bind(userId).first<{ count: number }>()
      
      isFirstRide = ridesCount ? ridesCount.count === 0 : true
    }

    const estimate = estimateRide(
      pickup_lat,
      pickup_lng,
      dropoff_lat,
      dropoff_lng,
      isFirstRide
    )

    return c.json({
      success: true,
      estimate
    })

  } catch (error) {
    console.error('Estimate error:', error)
    return c.json({ success: false, error: 'Ошибка расчёта стоимости' }, 500)
  }
})

/**
 * POST /api/rides/create - Создание новой поездки
 */
rides.post('/create', async (c) => {
  try {
    const userId = c.get('userId')
    if (!userId) {
      return c.json({ success: false, error: 'Требуется авторизация' }, 401)
    }

    const body: CreateRideRequest = await c.req.json()
    const {
      pickup_address,
      pickup_lat,
      pickup_lng,
      dropoff_address,
      dropoff_lat,
      dropoff_lng,
      payment_method,
      promo_code
    } = body

    // Валидация
    if (!pickup_address || !dropoff_address || !payment_method) {
      return c.json({ 
        success: false, 
        error: 'Заполните все обязательные поля' 
      }, 400)
    }

    // Получаем пользователя
    const user = await c.env.DB.prepare(
      'SELECT * FROM users WHERE id = ?'
    ).bind(userId).first<User>()

    if (!user) {
      return c.json({ success: false, error: 'Пользователь не найден' }, 404)
    }

    // Расчёт стоимости
    const ridesCount = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM rides WHERE passenger_id = ? AND status = "completed"'
    ).bind(userId).first<{ count: number }>()
    
    const isFirstRide = ridesCount ? ridesCount.count === 0 : true

    const estimate = estimateRide(
      pickup_lat,
      pickup_lng,
      dropoff_lat,
      dropoff_lng,
      isFirstRide,
      promo_code
    )

    const commission = calculateCommission(estimate.final_price)

    // Проверка баланса если оплата балансом
    if (payment_method === 'balance' && user.balance < estimate.final_price) {
      return c.json({ 
        success: false, 
        error: 'Недостаточно средств на балансе' 
      }, 400)
    }

    // Создание поездки
    const result = await c.env.DB.prepare(`
      INSERT INTO rides (
        passenger_id, status, pickup_address, pickup_lat, pickup_lng,
        dropoff_address, dropoff_lat, dropoff_lng, distance, duration,
        price, commission, payment_method, payment_status, discount, promo_code
      ) VALUES (?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)
    `).bind(
      userId,
      pickup_address, pickup_lat, pickup_lng,
      dropoff_address, dropoff_lat, dropoff_lng,
      estimate.distance, estimate.duration,
      estimate.final_price, commission,
      payment_method, estimate.discount, promo_code || null
    ).run()

    const rideId = result.meta.last_row_id

    // Получаем созданную поездку
    const ride = await c.env.DB.prepare(
      'SELECT * FROM rides WHERE id = ?'
    ).bind(rideId).first<Ride>()

    return c.json({
      success: true,
      ride
    }, 201)

  } catch (error) {
    console.error('Create ride error:', error)
    return c.json({ success: false, error: 'Ошибка создания поездки' }, 500)
  }
})

/**
 * GET /api/rides - Получение списка поездок
 */
rides.get('/', async (c) => {
  try {
    const userId = c.get('userId')
    const userRole = c.get('userRole')
    
    if (!userId || !userRole) {
      return c.json({ success: false, error: 'Требуется авторизация' }, 401)
    }

    let query = ''
    if (userRole === 'passenger') {
      query = 'SELECT * FROM rides WHERE passenger_id = ? ORDER BY created_at DESC'
    } else if (userRole === 'driver') {
      query = 'SELECT * FROM rides WHERE driver_id = ? ORDER BY created_at DESC'
    } else if (userRole === 'admin') {
      query = 'SELECT * FROM rides ORDER BY created_at DESC LIMIT 100'
    }

    const rides = userRole === 'admin' 
      ? await c.env.DB.prepare(query).all<Ride>()
      : await c.env.DB.prepare(query).bind(userId).all<Ride>()

    return c.json({
      success: true,
      rides: rides.results
    })

  } catch (error) {
    console.error('Get rides error:', error)
    return c.json({ success: false, error: 'Ошибка получения поездок' }, 500)
  }
})

/**
 * GET /api/rides/pending - Получение доступных заказов (для водителей)
 */
rides.get('/pending', async (c) => {
  try {
    const userId = c.get('userId')
    const userRole = c.get('userRole')
    
    if (!userId || userRole !== 'driver') {
      return c.json({ success: false, error: 'Доступно только для водителей' }, 403)
    }

    const pendingRides = await c.env.DB.prepare(`
      SELECT r.*, u.name as passenger_name, u.phone as passenger_phone, u.rating as passenger_rating
      FROM rides r
      JOIN users u ON r.passenger_id = u.id
      WHERE r.status = 'pending'
      ORDER BY r.created_at DESC
    `).all()

    return c.json({
      success: true,
      rides: pendingRides.results
    })

  } catch (error) {
    console.error('Get pending rides error:', error)
    return c.json({ success: false, error: 'Ошибка получения заказов' }, 500)
  }
})

/**
 * POST /api/rides/:id/accept - Принятие заказа водителем
 */
rides.post('/:id/accept', async (c) => {
  try {
    const userId = c.get('userId')
    const userRole = c.get('userRole')
    
    if (!userId || userRole !== 'driver') {
      return c.json({ success: false, error: 'Доступно только для водителей' }, 403)
    }

    const rideId = c.req.param('id')

    // Проверка что заказ существует и доступен
    const ride = await c.env.DB.prepare(
      'SELECT * FROM rides WHERE id = ? AND status = "pending"'
    ).bind(rideId).first<Ride>()

    if (!ride) {
      return c.json({ 
        success: false, 
        error: 'Заказ не найден или уже принят' 
      }, 404)
    }

    // Обновление статуса
    await c.env.DB.prepare(`
      UPDATE rides 
      SET driver_id = ?, status = 'accepted', accepted_at = datetime('now')
      WHERE id = ?
    `).bind(userId, rideId).run()

    // Обновление статистики водителя
    await c.env.DB.prepare(
      'UPDATE drivers SET total_rides = total_rides + 1 WHERE user_id = ?'
    ).bind(userId).run()

    return c.json({
      success: true,
      message: 'Заказ принят'
    })

  } catch (error) {
    console.error('Accept ride error:', error)
    return c.json({ success: false, error: 'Ошибка принятия заказа' }, 500)
  }
})

/**
 * POST /api/rides/:id/start - Начало поездки
 */
rides.post('/:id/start', async (c) => {
  try {
    const userId = c.get('userId')
    const rideId = c.req.param('id')

    const ride = await c.env.DB.prepare(
      'SELECT * FROM rides WHERE id = ? AND driver_id = ? AND status = "accepted"'
    ).bind(rideId, userId).first<Ride>()

    if (!ride) {
      return c.json({ success: false, error: 'Заказ не найден' }, 404)
    }

    await c.env.DB.prepare(`
      UPDATE rides 
      SET status = 'in_progress', started_at = datetime('now')
      WHERE id = ?
    `).bind(rideId).run()

    return c.json({ success: true, message: 'Поездка начата' })

  } catch (error) {
    console.error('Start ride error:', error)
    return c.json({ success: false, error: 'Ошибка начала поездки' }, 500)
  }
})

/**
 * POST /api/rides/:id/complete - Завершение поездки
 */
rides.post('/:id/complete', async (c) => {
  try {
    const userId = c.get('userId')
    const rideId = c.req.param('id')

    const ride = await c.env.DB.prepare(
      'SELECT * FROM rides WHERE id = ? AND driver_id = ? AND status = "in_progress"'
    ).bind(rideId, userId).first<Ride>()

    if (!ride) {
      return c.json({ success: false, error: 'Поездка не найдена' }, 404)
    }

    // Обновление статуса поездки
    await c.env.DB.prepare(`
      UPDATE rides 
      SET status = 'completed', completed_at = datetime('now'), payment_status = 'paid'
      WHERE id = ?
    `).bind(rideId).run()

    // Начисление заработка водителю
    const driverEarning = ride.price - ride.commission
    const driver = await c.env.DB.prepare(
      'SELECT * FROM users WHERE id = ?'
    ).bind(userId).first<User>()

    if (driver) {
      await c.env.DB.prepare(
        'UPDATE users SET balance = balance + ? WHERE id = ?'
      ).bind(driverEarning, userId).run()

      await c.env.DB.prepare(
        'UPDATE drivers SET earnings_total = earnings_total + ?, completed_rides = completed_rides + 1 WHERE user_id = ?'
      ).bind(driverEarning, userId).run()

      // Транзакция водителя
      await c.env.DB.prepare(`
        INSERT INTO transactions (user_id, type, amount, balance_before, balance_after, ride_id, status, description)
        VALUES (?, 'ride_earning', ?, ?, ?, ?, 'completed', ?)
      `).bind(
        userId,
        driverEarning,
        driver.balance,
        driver.balance + driverEarning,
        rideId,
        `Заработок за поездку #${rideId}`
      ).run()
    }

    // Списание у пассажира (если оплата балансом)
    if (ride.payment_method === 'balance') {
      const passenger = await c.env.DB.prepare(
        'SELECT * FROM users WHERE id = ?'
      ).bind(ride.passenger_id).first<User>()

      if (passenger) {
        await c.env.DB.prepare(
          'UPDATE users SET balance = balance - ? WHERE id = ?'
        ).bind(ride.price, ride.passenger_id).run()

        await c.env.DB.prepare(`
          INSERT INTO transactions (user_id, type, amount, balance_before, balance_after, ride_id, status, description)
          VALUES (?, 'ride_payment', ?, ?, ?, ?, 'completed', ?)
        `).bind(
          ride.passenger_id,
          -ride.price,
          passenger.balance,
          passenger.balance - ride.price,
          rideId,
          `Оплата поездки #${rideId}`
        ).run()
      }
    }

    return c.json({ success: true, message: 'Поездка завершена' })

  } catch (error) {
    console.error('Complete ride error:', error)
    return c.json({ success: false, error: 'Ошибка завершения поездки' }, 500)
  }
})

/**
 * POST /api/rides/:id/cancel - Отмена поездки
 */
rides.post('/:id/cancel', async (c) => {
  try {
    const userId = c.get('userId')
    const rideId = c.req.param('id')

    const ride = await c.env.DB.prepare(
      'SELECT * FROM rides WHERE id = ? AND (passenger_id = ? OR driver_id = ?)'
    ).bind(rideId, userId, userId).first<Ride>()

    if (!ride) {
      return c.json({ success: false, error: 'Поездка не найдена' }, 404)
    }

    if (ride.status === 'completed') {
      return c.json({ success: false, error: 'Нельзя отменить завершённую поездку' }, 400)
    }

    await c.env.DB.prepare(`
      UPDATE rides 
      SET status = 'canceled', canceled_at = datetime('now')
      WHERE id = ?
    `).bind(rideId).run()

    // Обновление статистики водителя (если был водитель)
    if (ride.driver_id) {
      await c.env.DB.prepare(
        'UPDATE drivers SET canceled_rides = canceled_rides + 1 WHERE user_id = ?'
      ).bind(ride.driver_id).run()
    }

    return c.json({ success: true, message: 'Поездка отменена' })

  } catch (error) {
    console.error('Cancel ride error:', error)
    return c.json({ success: false, error: 'Ошибка отмены поездки' }, 500)
  }
})

/**
 * POST /api/rides/:id/rate - Оценка поездки
 */
rides.post('/:id/rate', async (c) => {
  try {
    const userId = c.get('userId')
    const rideId = c.req.param('id')
    const { rating, comment } = await c.req.json()

    if (!rating || rating < 1 || rating > 5) {
      return c.json({ success: false, error: 'Оценка должна быть от 1 до 5' }, 400)
    }

    const ride = await c.env.DB.prepare(
      'SELECT * FROM rides WHERE id = ? AND passenger_id = ? AND status = "completed"'
    ).bind(rideId, userId).first<Ride>()

    if (!ride) {
      return c.json({ success: false, error: 'Поездка не найдена' }, 404)
    }

    if (ride.rating) {
      return c.json({ success: false, error: 'Поездка уже оценена' }, 400)
    }

    // Сохранение оценки
    await c.env.DB.prepare(
      'UPDATE rides SET rating = ?, comment = ? WHERE id = ?'
    ).bind(rating, comment || null, rideId).run()

    // Обновление рейтинга водителя
    if (ride.driver_id) {
      const driverRides = await c.env.DB.prepare(
        'SELECT AVG(rating) as avg_rating FROM rides WHERE driver_id = ? AND rating IS NOT NULL'
      ).bind(ride.driver_id).first<{ avg_rating: number }>()

      if (driverRides && driverRides.avg_rating) {
        await c.env.DB.prepare(
          'UPDATE users SET rating = ? WHERE id = ?'
        ).bind(driverRides.avg_rating, ride.driver_id).run()
      }
    }

    return c.json({ success: true, message: 'Спасибо за оценку!' })

  } catch (error) {
    console.error('Rate ride error:', error)
    return c.json({ success: false, error: 'Ошибка оценки поездки' }, 500)
  }
})

export default rides
