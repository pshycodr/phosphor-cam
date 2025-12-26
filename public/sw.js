const CACHE_NAME = 'phosphor-cam-v1.0.5'

self.addEventListener('install', e => {
    e.waitUntil(
        caches
            .open(CACHE_NAME)
            .then(async cache => {
                console.log('[SW] log-1 ', cache)

                const impAssets = ['/', '/index.html', '/manifest.json']

                try {
                    await cache.addAll(impAssets)
                } catch (error) {
                    console.log('faild to add impAssets: ', error)
                }

                const optionalAssets = [
                    '/assets/logo.webp',
                    '/assets/favicon.webp',
                    '/assets/favicon.webp',

                    '/icons/icon-192x192.webp',
                    '/icons/icon-512x512.webp',
                ]

                await Promise.allSettled(
                    optionalAssets.map(url => {
                        console.log('[SW] log-2 ', url)

                        cache.add(url).catch(err => {
                            console.warn(`failed to cache ${url}: `, err)
                        })
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
                console.log('[SW] cache names: ', cacheNames)
                return Promise.all(
                    cacheNames.forEach(cacheName => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('[SW] Deleting old cache: ', cacheName)
                            return caches.delete(cacheName)
                        }
                    }),
                )
            })
            .then(() => {
                console.log('[SW] Activation complete - taking control')
                return self.clients.claim()
            }),
    )
})

self.addEventListener('fetch', event => {
    const { request } = event
    const url = new URL(request.url)

    // console.log(request)

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
                        // console.log(res);

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
                        // console.log(res);

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
                        console.warn('[SW] Font failed to load, continuing anyway')

                        if (request.mode === 'navigate') {
                            return caches.match('/index.html').then(res => {
                                if (res) {
                                    return res
                                }

                                // Last fallback
                                return new Response('Offline - Please reload when connected', {
                                    status: 503,
                                    statusText: 'Service Unavailable',
                                    headers: new Headers({
                                        'Content-Type': 'text/plain',
                                    }),
                                })
                            })
                        }

                        throw err
                    })
            }),
        )
    }
})
