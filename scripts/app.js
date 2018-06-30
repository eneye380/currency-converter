(function () {
'use strict';
    console.log("Testing...");

    let app = {
        isLoading: true,
        offline: true,
        countries: [],
        currencies: [],
        dollarRates: [],
        newRates: {},
        spinner: document.querySelector('.loader'),
    };

    document.getElementById('convert').addEventListener('click', () => {
        // get currency values
        let from = document.getElementById('from');
        let to = document.getElementById('to');
document.getElementById('result').setAttribute("value", 'converting...');
        app.getConversionRate(from.value, to.value);
    });

    //display result
    app.displayConversionResult = (rate) => {
        let amount = document.getElementById('amount').value;
        let ans = amount * rate;
        ans = ans.toFixed(2);
        document.getElementById('result').setAttribute("value", ans);
        console.log(ans);
    }
    //retrieve all currencies
    app.getAllCurrencies = () => {
        fetch('https://free.currencyconverterapi.com/api/v5/currencies')
            .then(function (response) {
                return response.json();
            })
            .then(function (myJson) {
                console.log(myJson);
            });
    }

    //retrieve all currencies
    app.getCurrencyCodes = () => {
        fetch('https://free.currencyconverterapi.com/api/v5/currencies')
            .then(function (response) {
                return response.json();
            })
            .then(function (myJson) {
                app.currencies = Object.keys(myJson.results);
                console.log(app.currencies.sort());
            });
    }

    //retrieves all countries
    app.getAllCountries = () => {
        fetch('https://free.currencyconverterapi.com/api/v5/countries')
            .then(function (response) {
                return response.json();
            })
            .then(function (myJson) {
                console.log(myJson);
            });
    }

    //save doller rates for all currencies to local storage
    app.saveDollarRates = () => {
        let dollarRates = JSON.stringify(app.dollarRates);
        localStorage.dollarRates = dollarRates;
        let newRates = JSON.stringify(app.newRates);
        localStorage.newRates = newRates;
    }

    //fetch doller rates for all currencies
    app.getDollarRates = () => {
        let i = 0;

        fetch('https://free.currencyconverterapi.com/api/v5/currencies')
            .then(function (response) {
                return response.json();
            })
            .then(function (myJson) {
                app.currencies = Object.keys(myJson.results);
                app.currencies = app.currencies.sort();
                let sequence = Promise.resolve();
                app.dollarRates = [];
                app.newRates = {};
                app.currencies.some((to) => {
                    i++;
                    if (i === 3) {
                        return to = 'ALL';
                    }
                    let conversion = `USD_${to}`;
                    let url = `https://free.currencyconverterapi.com/api/v5/convert?q=${conversion}&compact=ultra`;
                    /**
                     * Series - sequence = sequence.then
                     * Parallel - sequence.then
                     */
                    sequence.then(() => {
                        return fetch(url)
                            .then(function (response) {
                                return response.json();
                            });
                    }).then(function (myJson) {
                        app.dollarRates.push(myJson);
                        app.newRates[conversion] = myJson[conversion];
                        app.saveDollarRates();

                    });
                    //return to = 'GBP';
                });
            });

    }


    //get online conversion rate
    app.getConversionRate = (from = 'USD', to = 'NGN') => {
        let url = `https://free.currencyconverterapi.com/api/v5/convert?q=${from}_${to}&compact=ultra`;
        //Cache strategy
        if ('caches' in window) {
            /*
             * Check if the service worker has already cached this city's currency
             * conversion rate data. If the service worker has the data, then display the cached
             * data while the app fetches the latest data.
             */
            caches.match(url).then(function (response) {
                if (response) {
                    response.json().then(function updateFromCache(json) {
                        let cur_sym = `${from}_${to}`;
                        app.displayConversionResult(json[cur_sym]);
                        console.log('Cache Data',json);
                    });
                }
            });
        }
        //Network strategy
        fetch(url)
            .then(function (response) {
                return response.json();
            }).catch(() => {
                console.log('No Data!');
            })
            .then(function (myJson) {
                let cur_sym = `${from}_${to}`;
                app.displayConversionResult(myJson[cur_sym]);
                console.log('Network Data',myJson);
            }).catch(() => {
                console.log('No Data!');
            });
    }
    //get offline conversion rate
    app.getOfflineConversationRate = (from = 'USD', to = 'USD') => {

    }


    //app start-up code
    app.startUp = () => {
        console.log('idb',indexedDB);
        app.dollarRates = localStorage.dollarRates;
        app.newRates = localStorage.newRates;
        if (app.newRates) {
            app.dollarRates = JSON.parse(app.dollarRates);
            app.newRates = JSON.parse(app.newRates);
            console.log('Conversion rates', app.newRates);
            console.log("no");
        } else {
            /* The user is using the app for the first time.
             */
            app.getDollarRates();

            console.log("yes");
        }
    };

    app.startUp();
    

    //app.getCurrencyCodes();
    //app.saveDollarRates();
    //app.getAllCountries();
    //app.getAllCurrencies();
    //app.getConversionRate();

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker
            .register('./service-worker.js')
            .then(function () { console.log('Service Worker Registered'); });
    }
})();