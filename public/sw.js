const CACHE_NAME = 'phosphor-cam-v1.0.1'

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
