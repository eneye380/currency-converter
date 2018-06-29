(function () {

    console.log("Testing...");

    let app = {
        isLoading: true,
        countries: [],
        currencies: [],
        dollarRates: [],
        spinner: document.querySelector('.loader'),
    };

    document.getElementById('convert').addEventListener('click', () => {
        // get currency values
        let from = document.getElementById('from');
        let to = document.getElementById('to');

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
                app.currencies.some((to) => {
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
                        console.log(myJson);
                    });
                    //return to = 'GBP';
                });
            });
        app.saveDollarRates();
    }


    //get online conversion rate
    app.getConversionRate = (from = 'USD', to = 'NGN') => {
        let url = `https://free.currencyconverterapi.com/api/v5/convert?q=${from}_${to}&compact=ultra`;
        fetch(url)
            .then(function (response) {
                return response.json();
            })
            .then(function (myJson) {
                let cur_sym = `${from}_${to}`;
                app.displayConversionResult(myJson[cur_sym]);
                console.log(myJson);
            });
    }
    //get offline conversion rate
    app.getOfflineConversationRate = (from = 'USD', to = 'USD') => {

    }


    //app start-up code
    app.startUp = () => {
        app.dollarRates = localStorage.dollarRates;
        if (app.dollarRates) {
            //app.getDollarRates();
           // app.saveDollarRates();
            //app.dollarRates = JSON.parse(app.dollarRates);
            console.log("no");
        } else {
            /* The user is using the app for the first time.
             */
    //        app.getDollarRates();
           // console.log(app.dollarRates);
      //      app.saveDollarRates();
            console.log("yes");
        }
    };
    
    app.startUp();
    console.log(app.dollarRates);
    //app.getCurrencyCodes();
    //app.saveDollarRates();
    //app.getAllCountries();
    //app.getAllCurrencies();
    //app.getConversionRate();
})();