// Service worker voor EA Catering.
// Zorgt dat de pagina direct opent en ook werkt als de verbinding even slecht is.
// Bij elke start wordt op de achtergrond de nieuwste versie opgehaald.
// Verander VERSIE als je de cache wilt vernieuwen.

const VERSIE = "ea-catering-v2";

const BASIS = [
    "./",
    "index.html",
    "style.css?v=5",
    "manifest.webmanifest",
    "icon-192.png",
    "icon-512.png",
    "apple-touch-icon.png"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(VERSIE).then(cache => cache.addAll(BASIS))
    );
    self.skipWaiting();
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(namen =>
            Promise.all(
                namen
                    .filter(naam => naam !== VERSIE)
                    .map(naam => caches.delete(naam))
            )
        )
    );
    self.clients.claim();
});

self.addEventListener("fetch", event => {
    const request = event.request;
    const url = new URL(request.url);

    // Alleen onze eigen bestanden; YouTube-thumbnails en -links laten we met rust.
    if (request.method !== "GET" || url.origin !== self.location.origin) {
        return;
    }

    event.respondWith(
        caches.open(VERSIE).then(cache =>
            cache.match(request).then(inCache => {
                const ophalen = fetch(request)
                    .then(antwoord => {
                        if (antwoord && antwoord.ok) {
                            cache.put(request, antwoord.clone());
                        }
                        return antwoord;
                    })
                    .catch(() => inCache);

                return inCache || ophalen;
            })
        )
    );
});
