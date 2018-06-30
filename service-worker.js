let cacheName = 'currencyConverter-v11';
let dataCacheName = 'currencyConverterData-v11';
let filesToCache = [
    '/',
    '/index.html',
    '/scripts/app.js',
    '/styles/style.css'
];
// This is what our customer data looks like.
const customerData = [
    { url: "444-44-4444", name: "Bill", age: 35, email: "bill@company.com" },
    { url: "555-55-5555", name: "Donna", age: 32, email: "donna@home.org" }
];
function createDb() {
    //check for support
    if (!(indexedDB)) {
        console.log('This browser doesn\'t support IndexedDB');
        return;
    }

    const dbName = "currency-converter-db";

    let request = indexedDB.open(dbName, 1);

    request.onerror = function (event) {
        // Handle errors.
    };
    request.onupgradeneeded = function (event) {
        let db = event.target.result;

        // Create an objectStore to hold information about our customers. We're
        // going to use "ssn" as our key path because it's guaranteed to be
        // unique - or at least that's what I was told during the kickoff meeting.
        let objectStore = db.createObjectStore("rates", { keyPath: "url" });

        // Create an index to search customers by email. We want to ensure that
        // no two customers have the same email, so use a unique index.
        objectStore.createIndex("url", "url", { unique: true });

        // Use transaction oncomplete to make sure the objectStore creation is 
        // finished before adding data into it.
        /**objectStore.transaction.oncomplete = function (event) {
            // Store values in the newly created objectStore.
            let customerObjectStore = db.transaction("rates", "readwrite").objectStore("rates");
            customerData.forEach(function (customer) {
                customerObjectStore.add(customer);
            });
        };*/
    };
}
function addData(item) {
    let db;
    let request = indexedDB.open("currency-converter-db");
    request.onerror = function (event) {
        alert("Why didn't you allow my web app to use IndexedDB?!");
    };
    request.onsuccess = function (event) {
        db = event.target.result;
        let transaction = db.transaction(["rates"], "readwrite");
        // Do something when all the data is added to the database.
        transaction.oncomplete = function (event) {
            console.log("All done!");
        };

        transaction.onerror = function (event) {
            // Don't forget to handle errors!
        };

        let objectStore = transaction.objectStore("rates");
        console.log('item', item.response.url);
        item.response.json().then((json)=>{
            console.log('json',json);
        });
        let request = objectStore.add({url:item.url,response:"7"});
        request.onsuccess = function (event) {
            // event.target.result === customer.ssn;
        };

        console.log('db', db);
        console.log('transaction', transaction);
    };
}

self.addEventListener('install', function (e) {
    console.log('[ServiceWorker] Install');
    e.waitUntil(
        caches.open(cacheName).then(function (cache) {
            console.log('[ServiceWorker] Caching app shell');
            return cache.addAll(filesToCache);
        })
    );
});

self.addEventListener('activate', function (e) {
    console.log('[ServiceWorker] Activate');
    e.waitUntil(
        caches.keys().then(function (keyList) {
            return Promise.all(keyList.map(function (key) {
                if (key !== cacheName && key !== dataCacheName) {
                    console.log('[ServiceWorker] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        }),

        createDb()
    );
    return self.clients.claim();
});

self.addEventListener('fetch', function (e) {
    console.log('[Service Worker] Fetch', e.request.url);
    var dataUrl = 'https://free.currencyconverterapi.com/api/v5/convert?q=';
    if (e.request.url.indexOf(dataUrl) > -1) {
        /*
         * When the request URL contains dataUrl, the app is asking for 
         * currency rates.
         */
        e.respondWith(


            caches.open(dataCacheName).then(function (cache) {
                return fetch(e.request).then(function (response) {
                    let r = response.clone();
                    cache.put(e.request.url, r);
                    addData({ url: e.request.url, response: r });
                    return response;
                });
            })
        );
    } else {
        /*
         * The app is asking for app shell files. In this scenario the app uses the
         * "Cache, falling back to the network" offline strategy:
         */
        e.respondWith(
            caches.match(e.request).then(function (response) {
                return response || fetch(e.request);
            })
        );
    }
});