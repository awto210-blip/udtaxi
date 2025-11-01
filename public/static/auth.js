/**
 * УДАЧА TAXI - Страница авторизации и регистрации
 */

// Получаем роль из URL
const urlParams = new URLSearchParams(window.location.search)
const preselectedRole = urlParams.get('role')

let isLoginMode = true

function renderAuthPage() {
  const app = document.getElementById('auth-app')
  
  app.innerHTML = `
    <div class="min-h-screen flex items-center justify-center px-4 py-12">
      <div class="max-w-md w-full">
        <!-- Logo -->
        <div class="text-center mb-8">
          <div class="inline-block w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-4xl mb-4 glow-animation">
            🍀
          </div>
          <h1 class="text-4xl font-bold mb-2">
            <span class="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
              УДАЧА TAXI
            </span>
          </h1>
          <p class="text-gray-400">Твоя удачная дорога по Удмуртии!</p>
        </div>

        <!-- Auth Form -->
        <div class="bg-gray-800 rounded-2xl p-8 shadow-2xl">
          <!-- Tabs -->
          <div class="flex mb-6 bg-gray-700 rounded-lg p-1">
            <button id="login-tab" onclick="switchMode(true)" 
              class="flex-1 py-2 rounded-lg transition ${isLoginMode ? 'bg-green-500 text-white' : 'text-gray-400'}">
              Вход
            </button>
            <button id="register-tab" onclick="switchMode(false)" 
              class="flex-1 py-2 rounded-lg transition ${!isLoginMode ? 'bg-green-500 text-white' : 'text-gray-400'}">
              Регистрация
            </button>
          </div>

          ${!isLoginMode ? `
            <!-- Быстрая регистрация -->
            <div class="bg-green-500 bg-opacity-10 border border-green-500 rounded-lg p-4 mb-4">
              <p class="text-sm text-green-400 mb-2">⚡ Быстрая регистрация</p>
              <button type="button" onclick="quickRegister('passenger')" 
                class="w-full mb-2 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition text-sm">
                🚕 Зарегистрироваться как пассажир
              </button>
              <button type="button" onclick="quickRegister('driver')" 
                class="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-sm">
                🚗 Зарегистрироваться как водитель
              </button>
              <p class="text-xs text-gray-400 mt-2">Данные заполнятся автоматически</p>
            </div>
            
            <div class="text-center text-gray-400 text-sm my-4">или заполните вручную</div>
          ` : ''}

          <form id="auth-form" onsubmit="handleSubmit(event)" class="space-y-4">
            ${!isLoginMode ? `
              <!-- Имя (только для регистрации) -->
              <div>
                <label class="block text-sm text-gray-400 mb-2">Имя</label>
                <input id="name" type="text" required 
                  placeholder="Иван Иванов"
                  class="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-green-500 outline-none">
              </div>
            ` : ''}

            <!-- Email -->
            <div>
              <label class="block text-sm text-gray-400 mb-2">Email</label>
              <input id="email" type="email" required 
                placeholder="example@mail.ru"
                class="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-green-500 outline-none">
            </div>

            ${!isLoginMode ? `
              <!-- Телефон (только для регистрации) -->
              <div>
                <label class="block text-sm text-gray-400 mb-2">Телефон</label>
                <input id="phone" type="tel" required 
                  placeholder="+7 (900) 123-45-67"
                  class="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-green-500 outline-none">
              </div>
            ` : ''}

            <!-- Пароль -->
            <div>
              <label class="block text-sm text-gray-400 mb-2">Пароль</label>
              <input id="password" type="password" required 
                placeholder="Минимум 6 символов"
                minlength="6"
                class="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-green-500 outline-none">
            </div>

            ${!isLoginMode ? `
              <!-- Роль (только для регистрации) -->
              <div>
                <label class="block text-sm text-gray-400 mb-2">Я...</label>
                <select id="role" required
                  class="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-green-500 outline-none">
                  <option value="passenger" ${preselectedRole === 'passenger' ? 'selected' : ''}>
                    🚕 Пассажир
                  </option>
                  <option value="driver" ${preselectedRole === 'driver' ? 'selected' : ''}>
                    🚗 Водитель
                  </option>
                </select>
              </div>

              <!-- Реферальный код (опционально) -->
              <div>
                <label class="block text-sm text-gray-400 mb-2">Реферальный код (необязательно)</label>
                <input id="referral-code" type="text" 
                  placeholder="IVAN2025"
                  class="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-green-500 outline-none">
              </div>
            ` : ''}

            <!-- Submit Button -->
            <button type="submit" 
              class="w-full py-4 bg-green-500 text-white text-lg font-bold rounded-lg hover:bg-green-600 transition glow-animation">
              ${isLoginMode ? 'Войти' : 'Зарегистрироваться'}
            </button>
          </form>

          ${isLoginMode ? `
            <p class="text-center text-gray-400 text-sm mt-4">
              Нет аккаунта? 
              <button onclick="switchMode(false)" class="text-green-500 hover:underline">
                Зарегистрируйтесь
              </button>
            </p>
          ` : `
            <p class="text-center text-gray-400 text-sm mt-4">
              Уже есть аккаунт? 
              <button onclick="switchMode(true)" class="text-green-500 hover:underline">
                Войдите
              </button>
            </p>
          `}
        </div>

        <!-- Back to Home -->
        <div class="text-center mt-6">
          <a href="/" class="text-gray-400 hover:text-white transition">
            ← Вернуться на главную
          </a>
        </div>
      </div>
    </div>
  `
}

function switchMode(login) {
  isLoginMode = login
  renderAuthPage()
}

// Быстрая регистрация с автозаполнением
async function quickRegister(role) {
  const timestamp = Date.now()
  const randomNum = Math.floor(Math.random() * 1000)
  
  const userData = {
    passenger: {
      name: `Пассажир ${randomNum}`,
      email: `passenger${timestamp}@test.ru`,
      phone: `+7900${randomNum}${String(timestamp).slice(-4)}`,
      role: 'passenger'
    },
    driver: {
      name: `Водитель ${randomNum}`,
      email: `driver${timestamp}@test.ru`,
      phone: `+7901${randomNum}${String(timestamp).slice(-4)}`,
      role: 'driver'
    }
  }
  
  const data = userData[role]
  const password = '123456' // Простой пароль для теста
  
  try {
    const response = await axios.post('/api/auth/register', {
      email: data.email,
      password: password,
      name: data.name,
      phone: data.phone,
      role: data.role
    })
    
    if (response.data.success) {
      localStorage.setItem('taxi_token', response.data.token)
      localStorage.setItem('taxi_user', JSON.stringify(response.data.user))
      
      alert(`✅ Успешная регистрация!\n\nEmail: ${data.email}\nПароль: ${password}\n\nСохраните эти данные!`)
      window.location.href = '/'
    }
  } catch (error) {
    const errorMessage = error.response?.data?.error || error.message
    alert(`Ошибка: ${errorMessage}`)
    console.error('Quick register error:', error)
  }
}

async function handleSubmit(event) {
  event.preventDefault()
  
  const email = document.getElementById('email').value
  const password = document.getElementById('password').value
  
  try {
    if (isLoginMode) {
      // Вход
      const response = await axios.post('/api/auth/login', {
        email,
        password
      })
      
      if (response.data.success) {
        localStorage.setItem('taxi_token', response.data.token)
        localStorage.setItem('taxi_user', JSON.stringify(response.data.user))
        
        // Перенаправление в зависимости от роли
        window.location.href = '/'
      }
    } else {
      // Регистрация
      const name = document.getElementById('name').value
      const phone = document.getElementById('phone').value
      const role = document.getElementById('role').value
      const referralCode = document.getElementById('referral-code')?.value || undefined
      
      const response = await axios.post('/api/auth/register', {
        email,
        password,
        name,
        phone,
        role,
        referral_code: referralCode
      })
      
      if (response.data.success) {
        localStorage.setItem('taxi_token', response.data.token)
        localStorage.setItem('taxi_user', JSON.stringify(response.data.user))
        
        // Показываем приветственное сообщение
        alert(`Добро пожаловать, ${name}! ${
          referralCode ? 'Реферальный бонус начислен!' : 'Приглашайте друзей и получайте бонусы!'
        }`)
        
        window.location.href = '/'
      }
    }
  } catch (error) {
    const errorMessage = error.response?.data?.error || error.message
    alert(`Ошибка: ${errorMessage}`)
    console.error('Auth error:', error)
  }
}

// Анимация для glow эффекта
const style = document.createElement('style')
style.textContent = `
  @keyframes glow {
    0%, 100% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.5); }
    50% { box-shadow: 0 0 40px rgba(16, 185, 129, 0.8); }
  }
  
  .glow-animation {
    animation: glow 2s ease-in-out infinite;
  }
`
document.head.appendChild(style)

// Инициализация
renderAuthPage()
