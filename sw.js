const CACHE_NAME = "app-shell-v1";
const API_CACHE = "api-cache-v1";
const API_BASE = "https://story-api.dicoding.dev/v1";
const IMAGE_CACHE = "image-cache-v1";

const APP_SHELL = [
  "/",
  "/index.html",
  "/manifest.json",
  "/styles/styles.css",
  "/scripts/index.js",
  "/images/favicon.png",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/images/fallback.png",
];

/* ================= INSTALL ================= */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)),
  );
});

/* ================= ACTIVATE ================= */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && key !== API_CACHE && key !== IMAGE_CACHE) {
            return caches.delete(key);
          }
        }),
      ),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // ===== IMAGE REQUEST =====
  if (request.destination === "image") {
    event.respondWith(
      caches.open(IMAGE_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;

        try {
          const response = await fetch(request);
          cache.put(request, response.clone());
          return response;
        } catch {
          return caches.match("/images/fallback.png");
        }
      }),
    );
    return;
  }

  // ===== API REQUEST =====
  if (request.url.startsWith(API_BASE)) {
    if (request.method === "GET") {
      event.respondWith(
        caches.open(API_CACHE).then(async (cache) => {
          try {
            const response = await fetch(request);
            cache.put(request, response.clone());
            return response;
          } catch {
            const cached = await cache.match(request);
            if (cached) return cached;
            return new Response(JSON.stringify({ listStory: [] }), {
              headers: { "Content-Type": "application/json" },
            });
          }
        }),
      );
    } else {
      // POST, PUT, DELETE langsung fetch tanpa cache
      event.respondWith(fetch(request));
    }
    return;
  }

  // ===== APP SHELL =====
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request)),
  );
});

/* ================= PUSH NOTIFICATION ================= */
self.addEventListener("push", (event) => {
  if (!event.data) return;
  const data = event.data.json();

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.options.body,
      icon: data.options.icon || "/icons/icon-192x192.png",
      data: {
        url: `/#/detail/${data.options.data.id}`,
      },
    }),
  );
});

/* ================= NOTIF CLICK ================= */
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data.url;

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientsArr) => {
        for (const client of clientsArr) {
          if ("navigate" in client) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
        return clients.openWindow(targetUrl);
      }),
  );
});
