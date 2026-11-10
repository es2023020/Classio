// Classio Tutor CRM — Progressive Web App Service Worker (Production Hardened)
const CACHE_VERSION = 'classio-v2.1-static'
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/classio-logo.png',
  '/classio-icon.png',
  '/icon-32.png',
  '/icon-192.png',
  '/apple-icon.png',
]

// Install Service Worker: Cache static shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('Classio SW pre-cache notice:', err)
      })
    })
  )
  self.skipWaiting()
})

// Activate & Cleanup Stale Caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_VERSION) {
            return caches.delete(key)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// Fetch strategy: Cache-first for static assets only; Network-only for API, Supabase, and dynamic private routes
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return

  const url = new URL(event.request.url)

  // Security & Privacy Rules: NEVER cache private authenticated student, admin, or payment data
  const isExcluded =
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/admin') ||
    url.pathname.startsWith('/portal') ||
    url.hostname.includes('supabase.co') ||
    event.request.headers.has('authorization') ||
    url.search.length > 0

  if (isExcluded) {
    // Pass straight to network without caching
    return
  }

  // Only cache immutable static assets (images, static files, fonts, web manifest)
  const isStaticAsset =
    url.pathname.startsWith('/_next/static/') ||
    STATIC_ASSETS.includes(url.pathname) ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.ico') ||
    url.pathname.endsWith('.woff2')

  if (isStaticAsset) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached
        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone()
            caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, clone))
          }
          return networkResponse
        }).catch(() => cached || new Response('Offline', { status: 503 }))
      })
    )
    return
  }

  // For HTML navigation requests, try network first; fallback to root cache if offline
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/').then((fallback) => fallback || new Response('Offline', { status: 503 }))
      })
    )
  }
})
