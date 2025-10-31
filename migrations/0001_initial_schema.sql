-- УДАЧА TAXI - Initial Database Schema
-- Создано: 2025-10-31

-- Таблица пользователей (и водители, и пассажиры)
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('passenger', 'driver', 'admin')),
  avatar_url TEXT,
  rating REAL DEFAULT 5.0,
  balance REAL DEFAULT 0.0,
  referral_code TEXT UNIQUE NOT NULL,
  referred_by TEXT,
  premium_until DATETIME,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Таблица информации о водителях
CREATE TABLE IF NOT EXISTS drivers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE NOT NULL,
  car_model TEXT NOT NULL,
  car_color TEXT NOT NULL,
  car_number TEXT NOT NULL,
  license_number TEXT NOT NULL,
  license_photo_url TEXT,
  car_photo_url TEXT,
  is_verified INTEGER DEFAULT 0,
  is_online INTEGER DEFAULT 0,
  current_lat REAL,
  current_lng REAL,
  total_rides INTEGER DEFAULT 0,
  completed_rides INTEGER DEFAULT 0,
  canceled_rides INTEGER DEFAULT 0,
  earnings_total REAL DEFAULT 0.0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Таблица поездок
CREATE TABLE IF NOT EXISTS rides (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  passenger_id INTEGER NOT NULL,
  driver_id INTEGER,
  status TEXT NOT NULL CHECK(status IN ('pending', 'accepted', 'in_progress', 'completed', 'canceled')),
  pickup_address TEXT NOT NULL,
  pickup_lat REAL NOT NULL,
  pickup_lng REAL NOT NULL,
  dropoff_address TEXT NOT NULL,
  dropoff_lat REAL NOT NULL,
  dropoff_lng REAL NOT NULL,
  distance REAL,
  duration INTEGER,
  price REAL NOT NULL,
  commission REAL DEFAULT 0.0,
  payment_method TEXT NOT NULL CHECK(payment_method IN ('cash', 'card', 'balance')),
  payment_status TEXT DEFAULT 'pending' CHECK(payment_status IN ('pending', 'paid', 'refunded')),
  rating INTEGER CHECK(rating >= 1 AND rating <= 5),
  comment TEXT,
  promo_code TEXT,
  discount REAL DEFAULT 0.0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  accepted_at DATETIME,
  started_at DATETIME,
  completed_at DATETIME,
  canceled_at DATETIME,
  FOREIGN KEY (passenger_id) REFERENCES users(id),
  FOREIGN KEY (driver_id) REFERENCES users(id)
);

-- Таблица реферальной системы
CREATE TABLE IF NOT EXISTS referrals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  referrer_id INTEGER NOT NULL,
  referred_id INTEGER NOT NULL,
  bonus_amount REAL DEFAULT 100.0,
  is_paid INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  paid_at DATETIME,
  FOREIGN KEY (referrer_id) REFERENCES users(id),
  FOREIGN KEY (referred_id) REFERENCES users(id)
);

-- Таблица транзакций
CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('deposit', 'withdrawal', 'ride_payment', 'ride_earning', 'referral_bonus', 'commission')),
  amount REAL NOT NULL,
  balance_before REAL NOT NULL,
  balance_after REAL NOT NULL,
  ride_id INTEGER,
  payment_method TEXT,
  payment_id TEXT,
  status TEXT DEFAULT 'completed' CHECK(status IN ('pending', 'completed', 'failed', 'refunded')),
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (ride_id) REFERENCES rides(id)
);

-- Таблица запросов на вывод средств
CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  driver_id INTEGER NOT NULL,
  amount REAL NOT NULL,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected', 'completed')),
  payment_method TEXT NOT NULL,
  payment_details TEXT NOT NULL,
  admin_comment TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  processed_at DATETIME,
  FOREIGN KEY (driver_id) REFERENCES users(id)
);

-- Таблица настроек приложения
CREATE TABLE IF NOT EXISTS app_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для оптимизации
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

CREATE INDEX IF NOT EXISTS idx_drivers_user_id ON drivers(user_id);
CREATE INDEX IF NOT EXISTS idx_drivers_is_online ON drivers(is_online);

CREATE INDEX IF NOT EXISTS idx_rides_passenger_id ON rides(passenger_id);
CREATE INDEX IF NOT EXISTS idx_rides_driver_id ON rides(driver_id);
CREATE INDEX IF NOT EXISTS idx_rides_status ON rides(status);
CREATE INDEX IF NOT EXISTS idx_rides_created_at ON rides(created_at);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_id ON referrals(referred_id);

CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_driver_id ON withdrawal_requests(driver_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON withdrawal_requests(status);

-- Вставка настроек по умолчанию
INSERT OR IGNORE INTO app_settings (key, value, description) VALUES 
  ('commission_rate', '0.15', 'Комиссия сервиса (15%)'),
  ('base_fare', '100', 'Базовая стоимость поездки (руб)'),
  ('price_per_km', '15', 'Стоимость за км (руб)'),
  ('price_per_minute', '5', 'Стоимость за минуту (руб)'),
  ('referral_bonus', '100', 'Бонус за реферала (руб)'),
  ('first_ride_discount', '50', 'Скидка на первую поездку (%)'),
  ('premium_driver_monthly', '500', 'Стоимость Premium для водителя/месяц (руб)'),
  ('premium_passenger_monthly', '200', 'Стоимость Premium для пассажира/месяц (руб)'),
  ('min_withdrawal_amount', '1000', 'Минимальная сумма вывода (руб)');
