// @ts-ignore
workbox.core.skipWaiting()
// @ts-ignore
workbox.core.clientsClaim()
// @ts-ignore
workbox.routing.registerRoute(
  new RegExp('https:.*min.(css|js)'),
  // @ts-ignore
  workbox.strategies.staleWhileRevalidate({
    cacheName: 'cdn-cache'
  })
)

// @ts-ignore
workbox.precaching.precacheAndRoute(self.__precacheManifest || [])
