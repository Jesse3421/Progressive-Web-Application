const APP_PREFIX = 'Budget-';
const VERSION = 'version_01';
const CACHE_NAME = APP_PREFIX + VERSION;

const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/css/styles.css",
    "/js/index.js", 
    "/js/idb.js", 
    
];

//Cache Resources
self.addEventListener('install', function (evt) {
    evt.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            console.log('installing cache : ' + CACHE_NAME)
            return cache.addAll(FILES_TO_CACHE)
        })
    )
    self.skipWaiting();
});

//Activate and Delete old cache
self.addEventListener("activate", function(evt) {
    evt.waitUntil(
      caches.keys().then(keyList => {
        return Promise.all(
          keyList.map(key => {
            if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
              console.log("Removing old cache data", key);
              return caches.delete(key);
            }
          })
        );
      })
    );
  
    self.clients.claim();
  });

// Respond with cached resources
self.addEventListener('fetch', function(evt) {
    if(evt.request.url.includes('/api/')) {
    evt.respondWith(
        caches
            .open(CACHE_NAME)
            .then(cache => {
                return fetch(evt.request)
                    .then(response => {
                        if(response.status === 200) {
                            cache.put(evt.request.url, response.clone());
                        }
                        return response;
                    })
                    .catch(err => {
                        return cache.match(evt.request);
                    });
            })
                .catch(err =>  console.log(err))
            )
            return;
            }

    evt.respondWith(
            fetch(evt.request).catch(function() {
                return caches.match(evt.request).then(function(response) {
                    if(response) {
                        return response;
                    } else if (evt.request.headers.get('accept').includes('text/html')){
                        return caches.match('/');
                    }
                });
            })
        )
        });
    
