/**
 * PLAN DIARIO · SIERRA ANTAPITE — Service Worker
 * Permite abrir y llenar el formulario aunque no haya internet.
 * La PRIMERA vez que se abre el link necesita conexión (para
 * guardar esta "copia" en el dispositivo); después de eso,
 * abre sin internet con normalidad.
 *
 * Este archivo debe subirse a GitHub junto a index.html, en la
 * misma carpeta (la raíz del repositorio).
 */

var CACHE_NAME = "plan-diario-antapite-v1";
var ARCHIVOS_BASE = [
  "./",
  "./index.html",
  "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
];

self.addEventListener("install", function(event){
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){
      return cache.addAll(ARCHIVOS_BASE);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function(event){
  event.waitUntil(
    caches.keys().then(function(claves){
      return Promise.all(
        claves.filter(function(clave){ return clave !== CACHE_NAME; })
              .map(function(clave){ return caches.delete(clave); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function(event){
  // Las llamadas al backend (Google Apps Script) siempre van a la red:
  // nunca queremos servir una respuesta vieja de la "base de datos".
  if(event.request.url.indexOf("script.google.com") !== -1){
    return;
  }

  event.respondWith(
    caches.match(event.request).then(function(enCache){
      if(enCache) return enCache;
      return fetch(event.request).then(function(respuesta){
        if(respuesta && respuesta.status === 200 && event.request.method === "GET"){
          var copia = respuesta.clone();
          caches.open(CACHE_NAME).then(function(cache){ cache.put(event.request, copia); });
        }
        return respuesta;
      }).catch(function(){
        if(event.request.mode === "navigate"){
          return caches.match("./index.html");
        }
      });
    })
  );
});
