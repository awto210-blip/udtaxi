#!/bin/bash
# УДАЧА TAXI - Скрипт инициализации базы данных

echo "🚀 Инициализация базы данных УДАЧА TAXI..."

# Запускаем dev сервер в фоне на 10 секунд чтобы создалась БД
npx wrangler pages dev dist --d1=udacha-taxi-db --local --port 3001 &
DEV_PID=$!

echo "⏳ Ожидание создания базы данных..."
sleep 10

# Останавливаем dev сервер
kill $DEV_PID 2>/dev/null

# Находим созданную БД
DB_FILE=$(find .wrangler/state/v3/d1 -name "*.sqlite" 2>/dev/null | head -1)

if [ -z "$DB_FILE" ]; then
    echo "❌ База данных не найдена"
    exit 1
fi

echo "✅ База данных найдена: $DB_FILE"

# Применяем миграции используя Node.js и better-sqlite3
node << 'EOF'
const fs = require('fs');
const path = require('path');

// Находим БД
const dbPath = require('child_process')
  .execSync('find .wrangler/state/v3/d1 -name "*.sqlite" 2>/dev/null | head -1')
  .toString()
  .trim();

if (!dbPath) {
  console.error('❌ База данных не найдена');
  process.exit(1);
}

console.log('📄 Читаем миграцию...');
const migration = fs.readFileSync('migrations/0001_initial_schema.sql', 'utf8');

// Читаем seed данные
const seed = fs.readFileSync('seed.sql', 'utf8');

// Используем wrangler для выполнения SQL
const { execSync } = require('child_process');

try {
  // Сохраняем в временный файл
  const tempFile = '/tmp/migration-combined.sql';
  fs.writeFileSync(tempFile, migration + '\n' + seed);
  
  // Используем cat для передачи SQL в wrangler
  execSync(`cat ${tempFile} | npx wrangler d1 execute udacha-taxi-db --local --file=${tempFile}`, {
    stdio: 'inherit'
  });
  
  console.log('✅ Миграции применены успешно!');
} catch (error) {
  console.error('❌ Ошибка применения миграций:', error.message);
}
EOF

echo "🎉 Инициализация завершена!"
