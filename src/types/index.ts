/**
 * УДАЧА TAXI - TypeScript типы
 */

// Типы для Cloudflare Bindings
export type Bindings = {
  DB: D1Database
  YANDEX_MAPS_API_KEY?: string
  YUKASSA_SHOP_ID?: string
  YUKASSA_SECRET_KEY?: string
  JWT_SECRET?: string
}

// Типы пользователей
export type UserRole = 'passenger' | 'driver' | 'admin'

export interface User {
  id: number
  email: string
  phone: string
  password_hash: string
  name: string
  role: UserRole
  avatar_url?: string
  rating: number
  balance: number
  referral_code: string
  referred_by?: string
  premium_until?: string
  is_active: number
  created_at: string
  updated_at: string
}

export interface Driver {
  id: number
  user_id: number
  car_model: string
  car_color: string
  car_number: string
  license_number: string
  license_photo_url?: string
  car_photo_url?: string
  is_verified: number
  is_online: number
  current_lat?: number
  current_lng?: number
  total_rides: number
  completed_rides: number
  canceled_rides: number
  earnings_total: number
  created_at: string
}

// Типы поездок
export type RideStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'canceled'
export type PaymentMethod = 'cash' | 'card' | 'balance'
export type PaymentStatus = 'pending' | 'paid' | 'refunded'

export interface Ride {
  id: number
  passenger_id: number
  driver_id?: number
  status: RideStatus
  pickup_address: string
  pickup_lat: number
  pickup_lng: number
  dropoff_address: string
  dropoff_lat: number
  dropoff_lng: number
  distance?: number
  duration?: number
  price: number
  commission: number
  payment_method: PaymentMethod
  payment_status: PaymentStatus
  rating?: number
  comment?: string
  promo_code?: string
  discount: number
  created_at: string
  accepted_at?: string
  started_at?: string
  completed_at?: string
  canceled_at?: string
}

// Типы транзакций
export type TransactionType = 
  | 'deposit' 
  | 'withdrawal' 
  | 'ride_payment' 
  | 'ride_earning' 
  | 'referral_bonus' 
  | 'commission'

export interface Transaction {
  id: number
  user_id: number
  type: TransactionType
  amount: number
  balance_before: number
  balance_after: number
  ride_id?: number
  payment_method?: string
  payment_id?: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  description?: string
  created_at: string
}

// Типы реферальной системы
export interface Referral {
  id: number
  referrer_id: number
  referred_id: number
  bonus_amount: number
  is_paid: number
  created_at: string
  paid_at?: string
}

// Запросы на вывод средств
export interface WithdrawalRequest {
  id: number
  driver_id: number
  amount: number
  status: 'pending' | 'approved' | 'rejected' | 'completed'
  payment_method: string
  payment_details: string
  admin_comment?: string
  created_at: string
  processed_at?: string
}

// API запросы/ответы
export interface RegisterRequest {
  email: string
  phone: string
  password: string
  name: string
  role: UserRole
  referral_code?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface AuthResponse {
  success: boolean
  token?: string
  user?: Omit<User, 'password_hash'>
  error?: string
}

export interface CreateRideRequest {
  pickup_address: string
  pickup_lat: number
  pickup_lng: number
  dropoff_address: string
  dropoff_lat: number
  dropoff_lng: number
  payment_method: PaymentMethod
  promo_code?: string
}

export interface RideEstimate {
  distance: number
  duration: number
  price: number
  discount: number
  final_price: number
}

// Настройки приложения
export interface AppSettings {
  id: number
  key: string
  value: string
  description?: string
  updated_at: string
}

// Статистика для админ-панели
export interface AdminStats {
  total_users: number
  total_drivers: number
  total_passengers: number
  total_rides: number
  completed_rides: number
  total_revenue: number
  commission_earned: number
  pending_withdrawals: number
  active_drivers: number
}

// Детальная статистика по водителю
export interface DriverStats {
  user: User
  driver: Driver
  total_rides: number
  completed_rides: number
  total_earnings: number
  average_rating: number
  pending_withdrawals: number
}
