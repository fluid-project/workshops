/*global fluid*/

var latte = latte || {};

(function () {
    
    var setupCurrencyNTime = function (that) {
        // Create an empty model where we will hold values from the user.
        that.model = {
            startDate: null,
            endDate: null
        };
    };
    
    latte.currencyNTime = function (container, options) {
        var that = fluid.initView("latte.currencyNTime", container, options);
        
        that.fetchRates = function (startDate, endDate) {
            $.ajax({
               url: "file://../data/rates.json",
               type: "GET",
               dataType: "json",
               data: that.model,
               success: function (data) {
                   that.results = data;
               }
            });
            return that.options.sampleData;
        };
        
        setupCurrencyNTime(that);
        return that;
    };
   
    fluid.defaults("latte.currencyNTime", {     
        // All of our default configuration goes here.
        
        selectors: {
            startDateList: ".flc-currencyntime-start",
            endDateList: ".flc-currencyntime-end"
        },
        
        events: {
            
        }
    });
    
})();
