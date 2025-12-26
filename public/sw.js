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
                    '/assets/logo.png',
                    '/assets/favicon.png',
                    '/assets/favicon.webp',

                    '/assets/icons/icon-192x192.png',
                    '/assets/icons/icon-512x512.png',
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
