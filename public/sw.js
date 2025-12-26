const CACHE_NAME = 'phosphor-cam-v1.0.1'

self.addEventListener('install', e => {
    e.waitUntil(
        caches
            .open(CACHE_NAME)
            .then(async cache => {
                const impAssets = ['/', '/index.html', '/manifest.json']

                try {
                    await cache.addAll(impAssets)
                } catch (error) {}

                const optionalAssets = [
                    '/assets/logo.webp',
                    '/assets/favicon.webp',
                    '/icons/icon-192x192.webp',
                    '/icons/icon-512x512.webp',
                ]

                await Promise.allSettled(
                    optionalAssets.map(async url => {
                        try {
                            return await cache.add(url)
                        } catch (err) {
                            console.warn(`failed to cache ${url}: `, err)
                        }
                    }),
                )
            })
            .then(() => self.skipWaiting())
            .catch(err => {
                console.log('failed to install cache: ', err)
            }),
    )
})

self.addEventListener('activate', event => {
    event.waitUntil(
        caches
            .keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(cacheName => cacheName !== CACHE_NAME)
                        .map(cacheName => caches.delete(cacheName)),
                )
            })
            .then(() => {
                return self.clients.claim()
            }),
    )
})

self.addEventListener('fetch', event => {
    const { request } = event
    const url = new URL(request.url)

    if (request.method !== 'GET') return

    if (url.protocol === 'chrome-extension:' || url.protocol === 'moz-extension:') {
        return
    }

    if (
        url.origin === 'https://fonts.googleapis.com' ||
        url.origin === 'https://fonts.gstatic.com'
    ) {
        event.respondWith(
            caches.match(request).then(cacheResponse => {
                if (cacheResponse) return cacheResponse

                return fetch(request)
                    .then(res => {
                        if (res.status === 200) {
                            const resClone = res.clone()
                            caches.open(CACHE_NAME).then(cache => {
                                cache.put(request, resClone)
                            })
                        }

                        return res
                    })
                    .catch(() => {
                        console.warn('[SW] Font failed to load, continuing anyway')
                        return new Response('', { status: 200 })
                    })
            }),
        )
    } else {
        event.respondWith(
            caches.match(request).then(cacheResponse => {
                if (cacheResponse) return cacheResponse

                return fetch(request)
                    .then(res => {
                        if (!res || res.status !== 200 || res.type === 'error') {
                            return res
                        }

                        const resClone = res.clone()
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(request, resClone)
                        })
                        return res
                    })
                    .catch(() => {
                        console.warn('[SW] Request failed to load')

                        if (request.mode === 'navigate') {
                            return caches.match('/index.html').then(res => {
                                if (res) {
                                    return res
                                }

                                return new Response('Offline - Please reload when connected', {
                                    status: 503,
                                    statusText: 'Service Unavailable',
                                    headers: new Headers({
                                        'Content-Type': 'text/plain',
                                    }),
                                })
                            })
                        }
                    })
            }),
        )
    }
})

self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting()
    }

    if (event.data && event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        return caches.delete(cacheName)
                    }),
                )
            }),
        )
    }

    if (event.data && event.data.type === 'GET_CACHE_STATUS') {
        event.waitUntil(
            caches.open(CACHE_NAME).then(async cache => {
                const keys = await cache.keys()
                event.ports[0].postMessage({
                    cached: keys.length,
                    cacheKeys: keys.map(req => req.url),
                })
            }),
        )
    }
})
