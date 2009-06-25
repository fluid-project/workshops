/*global fluid*/

var latte = latte || {};

(function () {
    
    var setupCurrencyNTime = function (that) {
        that.model = {
            startDate: null,
            endDate: null
        };
    };
    
    latte.currencyNTime = function (container, options) {
        var that = fluid.initView("latte.currencyNTime", container, options);
        
        that.showRates = function (startDate, endDate) {
            // Fetch
        };
        
        setupCurrencyNTime(that);
        return that;
    };
    
    fluid.defaults("latte.currencyNTime", {
        // All of our default configuration goes here.
        sampleData: [
            {
                "Date":"2009\/01\/01",
                "Rate":"1.45010"
            },
            {
                "Date": "2009\/01\/02",
                "Rate": "0.05"
            }
        ]
    });
    
})();
