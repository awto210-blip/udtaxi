/**
 * УДАЧА TAXI - Главная страница приложения
 */

// Проверка авторизации
const token = localStorage.getItem('taxi_token')
const user = JSON.parse(localStorage.getItem('taxi_user') || 'null')

// Компонент главной страницы
function renderHomePage() {
  const app = document.getElementById('app')
  
  if (!token || !user) {
    // Гостевая страница
    app.innerHTML = `
      <div class="min-h-screen flex flex-col">
        <!-- Header -->
        <header class="container mx-auto px-4 py-6 flex justify-between items-center">
          <div class="flex items-center space-x-3">
            <div class="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-2xl glow-animation">
              🍀
            </div>
            <div>
              <h1 class="text-2xl font-bold gradient-text">УДАЧА TAXI</h1>
              <p class="text-xs text-gray-400">Твоя удачная дорога по Удмуртии!</p>
            </div>
          </div>
          <a href="/auth" class="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">
            Войти
          </a>
        </header>

        <!-- Hero Section -->
        <main class="flex-1 flex items-center justify-center px-4">
          <div class="max-w-4xl mx-auto text-center">
            <!-- 3D Taxi Icon -->
            <div class="mb-12 float-animation">
              <div class="text-9xl">🚕</div>
            </div>

            <h2 class="text-5xl md:text-7xl font-bold mb-6">
              <span class="gradient-text">УДАЧА</span> всегда с тобой!
            </h2>

            <p class="text-xl md:text-2xl text-gray-300 mb-12">
              Современный сервис такси в Ижевске и Удмуртии<br>
              Быстро. Надёжно. Выгодно для всех.
            </p>

            <!-- CTA Buttons -->
            <div class="flex flex-col md:flex-row gap-4 justify-center items-center">
              <a href="/auth?role=passenger" class="w-full md:w-auto px-8 py-4 bg-green-500 text-white text-lg rounded-xl hover:bg-green-600 transition glow-animation flex items-center justify-center space-x-2">
                <i class="fas fa-user"></i>
                <span>Я пассажир</span>
              </a>
              <a href="/auth?role=driver" class="w-full md:w-auto px-8 py-4 bg-gray-700 text-white text-lg rounded-xl hover:bg-gray-600 transition flex items-center justify-center space-x-2">
                <i class="fas fa-car"></i>
                <span>Я водитель</span>
              </a>
            </div>

            <!-- Features -->
            <div class="grid md:grid-cols-3 gap-8 mt-20">
              <div class="bg-gray-800 bg-opacity-50 p-6 rounded-xl">
                <div class="text-4xl mb-4">💰</div>
                <h3 class="text-xl font-bold mb-2">Реферальная программа</h3>
                <p class="text-gray-400">Приглашай друзей и получай бонусы за каждого!</p>
              </div>
              <div class="bg-gray-800 bg-opacity-50 p-6 rounded-xl">
                <div class="text-4xl mb-4">⚡</div>
                <h3 class="text-xl font-bold mb-2">Быстрый заказ</h3>
                <p class="text-gray-400">Закажи такси в один клик и отслеживай на карте!</p>
              </div>
              <div class="bg-gray-800 bg-opacity-50 p-6 rounded-xl">
                <div class="text-4xl mb-4">🎯</div>
                <h3 class="text-xl font-bold mb-2">Честные тарифы</h3>
                <p class="text-gray-400">Прозрачная система ценообразования без скрытых комиссий!</p>
              </div>
            </div>
          </div>
        </main>

        <!-- Footer -->
        <footer class="container mx-auto px-4 py-8 text-center text-gray-400">
          <p>&copy; 2025 УДАЧА TAXI. Все права защищены.</p>
        </footer>
      </div>
    `
    
    // PWA Install Prompt
    showPWAInstallPrompt()
    
  } else {
    // Авторизованная страница
    if (user.role === 'passenger') {
      renderPassengerDashboard()
    } else if (user.role === 'driver') {
      renderDriverDashboard()
    } else if (user.role === 'admin') {
      renderAdminDashboard()
    }
  }
}

// Пассажирская панель
function renderPassengerDashboard() {
  const app = document.getElementById('app')
  
  app.innerHTML = `
    <div class="min-h-screen">
      <!-- Header -->
      <header class="bg-gray-800 shadow-lg">
        <div class="container mx-auto px-4 py-4 flex justify-between items-center">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">🍀</div>
            <div>
              <h1 class="text-xl font-bold gradient-text">УДАЧА TAXI</h1>
              <p class="text-xs text-gray-400">Привет, ${user.name}!</p>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <div class="text-right">
              <p class="text-xs text-gray-400">Баланс</p>
              <p class="text-lg font-bold text-green-500">${user.balance} ₽</p>
            </div>
            <button onclick="logout()" class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition">
              Выход
            </button>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="container mx-auto px-4 py-8">
        <div class="grid lg:grid-cols-2 gap-8">
          <!-- Карта и заказ -->
          <div class="bg-gray-800 rounded-xl p-6">
            <h2 class="text-2xl font-bold mb-6 flex items-center">
              <i class="fas fa-map-marked-alt mr-3 text-green-500"></i>
              Заказать такси
            </h2>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm text-gray-400 mb-2">Откуда</label>
                <input id="pickup" type="text" placeholder="Введите адрес подачи" 
                  class="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-green-500 outline-none">
              </div>
              
              <div>
                <label class="block text-sm text-gray-400 mb-2">Куда</label>
                <input id="dropoff" type="text" placeholder="Введите адрес назначения" 
                  class="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-green-500 outline-none">
              </div>

              <div>
                <label class="block text-sm text-gray-400 mb-2">Способ оплаты</label>
                <select id="payment-method" class="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-green-500 outline-none">
                  <option value="cash">Наличные</option>
                  <option value="card">Банковская карта</option>
                  <option value="balance">С баланса (${user.balance} ₽)</option>
                </select>
              </div>

              <div id="price-estimate" class="hidden bg-green-500 bg-opacity-10 border border-green-500 rounded-lg p-4">
                <p class="text-sm text-gray-400">Примерная стоимость</p>
                <p class="text-3xl font-bold text-green-500"><span id="price-value">0</span> ₽</p>
                <p class="text-xs text-gray-400 mt-2">
                  Расстояние: <span id="distance-value">0</span> км | 
                  Время: <span id="duration-value">0</span> мин
                </p>
              </div>

              <button onclick="createRide()" class="w-full py-4 bg-green-500 text-white text-lg font-bold rounded-lg hover:bg-green-600 transition">
                Заказать такси
              </button>
            </div>

            <!-- Карта (заглушка) -->
            <div class="mt-6 h-64 bg-gray-700 rounded-lg flex items-center justify-center">
              <div class="text-center">
                <i class="fas fa-map text-5xl text-gray-500 mb-4"></i>
                <p class="text-gray-400">Яндекс.Карта загружается...</p>
                <p class="text-xs text-gray-500 mt-2">Добавьте API-ключ в config.ts</p>
              </div>
            </div>
          </div>

          <!-- История и профиль -->
          <div class="space-y-6">
            <!-- Реферальная программа -->
            <div class="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white">
              <h3 class="text-xl font-bold mb-3">🎁 Пригласи друга!</h3>
              <p class="text-sm mb-4">Получи 100 ₽ за каждого приглашённого друга</p>
              <div class="flex items-center space-x-2">
                <input type="text" readonly value="${user.referral_code}" 
                  class="flex-1 px-3 py-2 bg-white bg-opacity-20 rounded text-white text-center font-mono text-lg">
                <button onclick="copyReferralCode('${user.referral_code}')" 
                  class="px-4 py-2 bg-white text-green-600 rounded hover:bg-gray-100 transition">
                  <i class="fas fa-copy"></i>
                </button>
              </div>
            </div>

            <!-- История поездок -->
            <div class="bg-gray-800 rounded-xl p-6">
              <h3 class="text-xl font-bold mb-4">История поездок</h3>
              <div id="rides-history">
                <p class="text-gray-400 text-center py-8">Загрузка...</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `
  
  // Загрузка истории поездок
  loadRidesHistory()
}

// Водительская панель
function renderDriverDashboard() {
  const app = document.getElementById('app')
  
  app.innerHTML = `
    <div class="min-h-screen">
      <!-- Header -->
      <header class="bg-gray-800 shadow-lg">
        <div class="container mx-auto px-4 py-4 flex justify-between items-center">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">🍀</div>
            <div>
              <h1 class="text-xl font-bold gradient-text">УДАЧА TAXI</h1>
              <p class="text-xs text-gray-400">Водитель: ${user.name}</p>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <div class="text-right">
              <p class="text-xs text-gray-400">Баланс</p>
              <p class="text-lg font-bold text-green-500">${user.balance} ₽</p>
            </div>
            <button onclick="logout()" class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition">
              Выход
            </button>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="container mx-auto px-4 py-8">
        <div class="grid lg:grid-cols-2 gap-8">
          <!-- Доступные заказы -->
          <div class="bg-gray-800 rounded-xl p-6">
            <h2 class="text-2xl font-bold mb-6 flex items-center justify-between">
              <span>
                <i class="fas fa-list mr-3 text-green-500"></i>
                Доступные заказы
              </span>
              <button onclick="loadPendingRides()" class="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600">
                <i class="fas fa-sync"></i> Обновить
              </button>
            </h2>
            
            <div id="pending-rides">
              <p class="text-gray-400 text-center py-8">Загрузка заказов...</p>
            </div>
          </div>

          <!-- Статистика -->
          <div class="space-y-6">
            <!-- Карточки статистики -->
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-gray-800 rounded-xl p-4">
                <p class="text-gray-400 text-sm">Заработано</p>
                <p class="text-2xl font-bold text-green-500">${user.balance} ₽</p>
              </div>
              <div class="bg-gray-800 rounded-xl p-4">
                <p class="text-gray-400 text-sm">Рейтинг</p>
                <p class="text-2xl font-bold text-yellow-500">⭐ ${user.rating.toFixed(1)}</p>
              </div>
            </div>

            <!-- Вывод средств -->
            <div class="bg-gray-800 rounded-xl p-6">
              <h3 class="text-xl font-bold mb-4">Вывод средств</h3>
              <p class="text-sm text-gray-400 mb-4">Минимальная сумма: 1000 ₽</p>
              <button class="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                ${user.balance < 1000 ? 'disabled class="opacity-50 cursor-not-allowed"' : ''}>
                Вывести средства
              </button>
            </div>

            <!-- История поездок -->
            <div class="bg-gray-800 rounded-xl p-6">
              <h3 class="text-xl font-bold mb-4">Мои поездки</h3>
              <div id="driver-rides-history">
                <p class="text-gray-400 text-center py-8">Загрузка...</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `
  
  // Загрузка данных
  loadPendingRides()
  loadRidesHistory()
}

// Админ панель
function renderAdminDashboard() {
  const app = document.getElementById('app')
  
  app.innerHTML = `
    <div class="min-h-screen">
      <header class="bg-gray-800 shadow-lg">
        <div class="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 class="text-2xl font-bold gradient-text">УДАЧА TAXI - Админ-панель</h1>
          <button onclick="logout()" class="px-4 py-2 bg-red-500 text-white rounded-lg">Выход</button>
        </div>
      </header>
      <main class="container mx-auto px-4 py-8">
        <div class="text-center py-20">
          <i class="fas fa-tools text-6xl text-gray-600 mb-4"></i>
          <h2 class="text-2xl font-bold">Админ-панель в разработке</h2>
          <p class="text-gray-400 mt-2">Здесь будет статистика, управление пользователями и заказами</p>
        </div>
      </main>
    </div>
  `
}

// Функции API
async function createRide() {
  const pickup = document.getElementById('pickup').value
  const dropoff = document.getElementById('dropoff').value
  const paymentMethod = document.getElementById('payment-method').value
  
  if (!pickup || !dropoff) {
    alert('Заполните адреса подачи и назначения')
    return
  }
  
  // Mock координаты (в продакшене используйте геокодирование)
  const mockCoords = {
    pickup: { lat: 56.8519, lng: 53.2048 },
    dropoff: { lat: 56.8619, lng: 53.2148 }
  }
  
  try {
    const response = await axios.post('/api/rides/create', {
      pickup_address: pickup,
      pickup_lat: mockCoords.pickup.lat,
      pickup_lng: mockCoords.pickup.lng,
      dropoff_address: dropoff,
      dropoff_lat: mockCoords.dropoff.lat,
      dropoff_lng: mockCoords.dropoff.lng,
      payment_method: paymentMethod
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    
    if (response.data.success) {
      alert('Заказ создан! Ожидайте водителя.')
      location.reload()
    }
  } catch (error) {
    alert('Ошибка создания заказа: ' + (error.response?.data?.error || error.message))
  }
}

async function loadRidesHistory() {
  try {
    const response = await axios.get('/api/rides', {
      headers: { Authorization: `Bearer ${token}` }
    })
    
    const container = document.getElementById('rides-history') || document.getElementById('driver-rides-history')
    if (!container) return
    
    if (response.data.rides && response.data.rides.length > 0) {
      container.innerHTML = response.data.rides.slice(0, 5).map(ride => `
        <div class="border-b border-gray-700 py-3">
          <div class="flex justify-between items-start mb-1">
            <p class="font-bold">${ride.pickup_address}</p>
            <span class="px-2 py-1 bg-${getRideStatusColor(ride.status)}-500 text-xs rounded">${getRideStatusText(ride.status)}</span>
          </div>
          <p class="text-sm text-gray-400">${ride.dropoff_address}</p>
          <div class="flex justify-between items-center mt-2">
            <span class="text-xs text-gray-500">${new Date(ride.created_at).toLocaleString('ru')}</span>
            <span class="text-green-500 font-bold">${ride.price} ₽</span>
          </div>
        </div>
      `).join('')
    } else {
      container.innerHTML = '<p class="text-gray-400 text-center py-8">Пока нет поездок</p>'
    }
  } catch (error) {
    console.error('Load rides error:', error)
  }
}

async function loadPendingRides() {
  try {
    const response = await axios.get('/api/rides/pending', {
      headers: { Authorization: `Bearer ${token}` }
    })
    
    const container = document.getElementById('pending-rides')
    if (!container) return
    
    if (response.data.rides && response.data.rides.length > 0) {
      container.innerHTML = response.data.rides.map(ride => `
        <div class="bg-gray-700 rounded-lg p-4 mb-4">
          <div class="flex justify-between items-start mb-3">
            <div class="flex-1">
              <p class="font-bold mb-1">${ride.pickup_address}</p>
              <p class="text-sm text-gray-400">${ride.dropoff_address}</p>
            </div>
            <span class="text-xl font-bold text-green-500">${ride.price} ₽</span>
          </div>
          <div class="flex justify-between items-center text-xs text-gray-400 mb-3">
            <span>${ride.distance} км</span>
            <span>${ride.duration} мин</span>
            <span>${new Date(ride.created_at).toLocaleTimeString('ru')}</span>
          </div>
          <button onclick="acceptRide(${ride.id})" 
            class="w-full py-2 bg-green-500 text-white rounded hover:bg-green-600 transition">
            Принять заказ
          </button>
        </div>
      `).join('')
    } else {
      container.innerHTML = '<p class="text-gray-400 text-center py-8">Нет доступных заказов</p>'
    }
  } catch (error) {
    console.error('Load pending rides error:', error)
  }
}

async function acceptRide(rideId) {
  try {
    const response = await axios.post(`/api/rides/${rideId}/accept`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    })
    
    if (response.data.success) {
      alert('Заказ принят!')
      loadPendingRides()
    }
  } catch (error) {
    alert('Ошибка: ' + (error.response?.data?.error || error.message))
  }
}

function copyReferralCode(code) {
  navigator.clipboard.writeText(code)
  alert('Реферальный код скопирован: ' + code)
}

function logout() {
  localStorage.removeItem('taxi_token')
  localStorage.removeItem('taxi_user')
  location.href = '/'
}

function getRideStatusColor(status) {
  const colors = {
    pending: 'yellow',
    accepted: 'blue',
    in_progress: 'purple',
    completed: 'green',
    canceled: 'red'
  }
  return colors[status] || 'gray'
}

function getRideStatusText(status) {
  const texts = {
    pending: 'Ожидание',
    accepted: 'Принят',
    in_progress: 'В пути',
    completed: 'Завершён',
    canceled: 'Отменён'
  }
  return texts[status] || status
}

// PWA Install Prompt
function showPWAInstallPrompt() {
  let deferredPrompt
  
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e
    
    // Показываем кнопку установки
    setTimeout(() => {
      if (confirm('Добавить УДАЧА TAXI на главный экран для быстрого доступа?')) {
        deferredPrompt.prompt()
        deferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('PWA установлен')
          }
          deferredPrompt = null
        })
      }
    }, 3000)
  })
}

// Инициализация
renderHomePage()
