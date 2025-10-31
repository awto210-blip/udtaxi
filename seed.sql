-- УДАЧА TAXI - Тестовые данные для разработки

-- Тестовые пользователи (пароль для всех: password123)
-- Хеш для 'password123': $2a$10$rB7Z5YqJ3vZ5YqJ3vZ5YqJ3vZ5YqJ3vZ5YqJ3vZ5YqJ3vZ5YqJ3vZ
INSERT OR IGNORE INTO users (email, phone, password_hash, name, role, referral_code, balance) VALUES 
  ('admin@udacha.taxi', '+79001234567', '$2a$10$rB7Z5YqJ3vZ5YqJ3vZ5YqJ3vZ5YqJ3vZ5YqJ3vZ5YqJ3vZ5YqJ3vZ', 'Администратор', 'admin', 'ADMIN2025', 10000.0),
  ('driver1@udacha.taxi', '+79001234568', '$2a$10$rB7Z5YqJ3vZ5YqJ3vZ5YqJ3vZ5YqJ3vZ5YqJ3vZ5YqJ3vZ5YqJ3vZ', 'Иван Водителев', 'driver', 'IVAN2025', 5000.0),
  ('driver2@udacha.taxi', '+79001234569', '$2a$10$rB7Z5YqJ3vZ5YqJ3vZ5YqJ3vZ5YqJ3vZ5YqJ3vZ5YqJ3vZ5YqJ3vZ', 'Петр Рулёв', 'driver', 'PETR2025', 3000.0),
  ('passenger1@udacha.taxi', '+79001234570', '$2a$10$rB7Z5YqJ3vZ5YqJ3vZ5YqJ3vZ5YqJ3vZ5YqJ3vZ5YqJ3vZ5YqJ3vZ', 'Анна Пассажирова', 'passenger', 'ANNA2025', 500.0),
  ('passenger2@udacha.taxi', '+79001234571', '$2a$10$rB7Z5YqJ3vZ5YqJ3vZ5YqJ3vZ5YqJ3vZ5YqJ3vZ5YqJ3vZ5YqJ3vZ', 'Мария Клиентова', 'passenger', 'MARIA2025', 300.0);

-- Информация о водителях
INSERT OR IGNORE INTO drivers (user_id, car_model, car_color, car_number, license_number, is_verified, is_online, current_lat, current_lng, total_rides, completed_rides) VALUES 
  (2, 'Toyota Camry', 'Черный', 'А123ВС18', 'ВУ1234567890', 1, 1, 56.8519, 53.2048, 150, 140),
  (3, 'Hyundai Solaris', 'Белый', 'В456ЕК18', 'ВУ0987654321', 1, 1, 56.8619, 53.2148, 80, 75);

-- Тестовые поездки
INSERT OR IGNORE INTO rides (passenger_id, driver_id, status, pickup_address, pickup_lat, pickup_lng, dropoff_address, dropoff_lat, dropoff_lng, distance, duration, price, commission, payment_method, payment_status, rating, created_at, completed_at) VALUES 
  (4, 2, 'completed', 'Ижевск, ул. Пушкинская, 268', 56.8519, 53.2048, 'Ижевск, ул. Советская, 32', 56.8619, 53.2148, 5.2, 15, 175.0, 26.25, 'card', 'paid', 5, datetime('now', '-2 days'), datetime('now', '-2 days', '+15 minutes')),
  (5, 3, 'completed', 'Ижевск, ТЦ Италмас', 56.8319, 53.1948, 'Ижевск, Железнодорожный вокзал', 56.8519, 53.2248, 7.8, 20, 245.0, 36.75, 'cash', 'paid', 4, datetime('now', '-1 days'), datetime('now', '-1 days', '+20 minutes')),
  (4, 2, 'completed', 'Ижевск, пл. 50 лет Октября', 56.8400, 53.2000, 'Ижевск, Аэропорт', 56.8280, 53.4580, 25.5, 35, 520.0, 78.0, 'card', 'paid', 5, datetime('now', '-5 hours'), datetime('now', '-4 hours', '+25 minutes')),
  (5, 2, 'in_progress', 'Ижевск, ул. Удмуртская, 255', 56.8619, 53.2248, 'Ижевск, ул. Карла Маркса, 244', 56.8519, 53.2148, 3.2, 10, 130.0, 19.5, 'balance', 'pending', NULL, datetime('now', '-10 minutes'), NULL),
  (4, NULL, 'pending', 'Ижевск, ул. Пушкинская, 268', 56.8519, 53.2048, 'Ижевск, ТРЦ Петровский', 56.8319, 53.1948, 4.5, 12, 155.0, 23.25, 'card', 'pending', NULL, datetime('now', '-2 minutes'), NULL);

-- Транзакции
INSERT OR IGNORE INTO transactions (user_id, type, amount, balance_before, balance_after, ride_id, status, description, created_at) VALUES 
  (4, 'deposit', 500.0, 0.0, 500.0, NULL, 'completed', 'Пополнение баланса через ЮKassa', datetime('now', '-3 days')),
  (2, 'ride_earning', 148.75, 4851.25, 5000.0, 1, 'completed', 'Заработок за поездку #1', datetime('now', '-2 days')),
  (4, 'ride_payment', -175.0, 500.0, 325.0, 1, 'completed', 'Оплата поездки #1', datetime('now', '-2 days')),
  (3, 'ride_earning', 208.25, 2791.75, 3000.0, 2, 'completed', 'Заработок за поездку #2', datetime('now', '-1 days')),
  (5, 'ride_payment', -245.0, 545.0, 300.0, 2, 'completed', 'Оплата поездки #2', datetime('now', '-1 days'));

-- Реферальные бонусы
INSERT OR IGNORE INTO referrals (referrer_id, referred_id, bonus_amount, is_paid, paid_at) VALUES 
  (2, 4, 100.0, 1, datetime('now', '-2 days')),
  (4, 5, 100.0, 1, datetime('now', '-1 days'));
