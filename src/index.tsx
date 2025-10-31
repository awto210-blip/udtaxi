/**
 * УДАЧА TAXI - Главный файл приложения
 * Современный агрегатор такси для Удмуртии
 */

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import type { Bindings } from './types'
import { config } from '../config'

// Импорт маршрутов
import auth from './routes/auth'
import rides from './routes/rides'
import admin from './routes/admin'

// Импорт middleware
import { authMiddleware } from './utils/middleware'

const app = new Hono<{ Bindings: Bindings }>()

// CORS для API
app.use('/api/*', cors())

// Статические файлы
app.use('/static/*', serveStatic({ root: './public' }))

// API Routes без авторизации
app.route('/api/auth', auth)
app.route('/api/admin', admin)

// API Routes с авторизацией
app.use('/api/rides/*', authMiddleware)
app.route('/api/rides', rides)

// Информация о приложении
app.get('/api/info', (c) => {
  return c.json({
    name: config.app.name,
    version: config.app.version,
    slogan: config.app.slogan
  })
})

// Главная страница
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ru">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="description" content="${config.app.name} - ${config.app.slogan}">
        <title>${config.app.name} - Главная</title>
        
        <!-- Tailwind CSS -->
        <script src="https://cdn.tailwindcss.com"></script>
        
        <!-- Icons -->
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        
        <!-- PWA Manifest -->
        <link rel="manifest" href="/manifest.json">
        <meta name="theme-color" content="#10b981">
        
        <!-- Apple PWA -->
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
        <meta name="apple-mobile-web-app-title" content="УДАЧА TAXI">
        <link rel="apple-touch-icon" href="/static/icons/icon-192.png">
        
        <style>
            @keyframes float {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-20px); }
            }
            
            @keyframes glow {
                0%, 100% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.5); }
                50% { box-shadow: 0 0 40px rgba(16, 185, 129, 0.8); }
            }
            
            .float-animation {
                animation: float 3s ease-in-out infinite;
            }
            
            .glow-animation {
                animation: glow 2s ease-in-out infinite;
            }
            
            .gradient-bg {
                background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
            }
            
            .gradient-text {
                background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }
        </style>
    </head>
    <body class="gradient-bg min-h-screen text-white">
        <div id="app"></div>
        
        <!-- Axios для HTTP запросов -->
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        
        <!-- Главный скрипт -->
        <script src="/static/app.js"></script>
    </body>
    </html>
  `)
})

// Страница авторизации
app.get('/auth', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ru">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${config.app.name} - Вход</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <style>
            .gradient-bg {
                background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
            }
        </style>
    </head>
    <body class="gradient-bg min-h-screen">
        <div id="auth-app"></div>
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/auth.js"></script>
    </body>
    </html>
  `)
})

// 404
app.notFound((c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ru">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>404 - Страница не найдена</title>
        <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-900 text-white min-h-screen flex items-center justify-center">
        <div class="text-center">
            <h1 class="text-9xl font-bold text-green-500">404</h1>
            <p class="text-2xl mt-4">Страница не найдена</p>
            <a href="/" class="mt-8 inline-block px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">
                На главную
            </a>
        </div>
    </body>
    </html>
  `, 404)
})

export default app
