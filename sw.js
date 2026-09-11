/* ===========================================================
   Service Worker — Plan Diario Sierra Antapite
   -----------------------------------------------------------
   CADA VEZ que subas un cambio al HTML (o a este mismo archivo),
   sube también el número de CACHE_VERSION de aquí abajo.
   Eso es lo único que hace que GitHub Pages "se entere" del
   cambio y reemplace lo que tenía guardado.
   =========================================================== */
const CACHE_VERSION = "v3";                 // <-- sube este número en cada actualización
const CACHE_NAME = "plan-antapite-" + CACHE_VERSION;

const ARCHIVOS_PARA_OFFLINE = [
  "./",
  "./index.html",
  // agrega aquí otros archivos propios que uses (css, íconos, etc.)
];

/* Al instalar la nueva versión, la descarga en su propio caché
   (sin tocar la versión vieja todavía) y se activa de inmediato,
   sin esperar a que se cierren todas las pestañas abiertas */
self.addEventListener("install", (evento) => {
  self.skipWaiting();
  evento.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ARCHIVOS_PARA_OFFLINE))
  );
});

/* Al activarse, borra cualquier caché de una versión anterior y
   toma control de las pestañas ya abiertas sin recargar manual */
self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches.keys().then((nombres) =>
      Promise.all(
        nombres
          .filter((nombre) => nombre !== CACHE_NAME)
          .map((nombre) => caches.delete(nombre))
      )
    )
  );
  self.clients.claim();
});

/* Estrategia "network first" para el HTML: SIEMPRE intenta traer
   la versión más nueva de internet primero. Si hay internet, ves
   el cambio al instante. Si NO hay internet (o falla la red),
   usa la copia guardada — ahí es donde funciona offline. */
self.addEventListener("fetch", (evento) => {
  const peticion = evento.request;

  evento.respondWith(
    fetch(peticion)
      .then((respuestaRed) => {
        // Guarda la respuesta fresca en el caché de esta versión
        const copia = respuestaRed.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(peticion, copia));
        return respuestaRed;
      })
      .catch(() => {
        // Sin internet: devuelve lo que haya guardado
        return caches.match(peticion);
      })
  );
});
