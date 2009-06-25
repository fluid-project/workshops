/*global fluid*/

var latte = latte || {};

(function () {
    
    latte.convertDate = function(date) {
       var bits = date.split("/");
       return bits[2] + "/" + bits[0] + "/" + bits[1];
    }
  
    latte.conformJSON = function(json) {
        return fluid.transform(json, function(row) {
            return {
              date: latte.convertDate(row.Date),
              rate: row.Rate
            };
        });
    }
    
    var renderSelectionUI = function(that) {
        // Loop through the model and create a list 
        // containing all available dates.
        var dates = [""].concat(
            fluid.transform(that.options.localRates, function(row) {
                return row.date;
        }));
        
        // Build up a tree, which provides instructions to the renderer.
        var modelTree = {children: [
            {
              ID: "dateFrom",
              selection: {valuebinding: "startDate", value: ""},
              optionlist: dates
            },
            {
              ID: "dateTo",          
              selection: {valuebinding: "endDate", value: ""},
              optionlist: dates
            }]
        };
        
        var selectors = that.options.selectors;
        
        fluid.selfRender(that.locate("currencySelect"), modelTree,{
            cutpoints: [ {
                id: "dateFrom",
                selector: selectors.dateFrom
            },
            {
                id: "dateTo",
                selector: selectors.dateTo
            }
            ],
            model: that.model,
            applier: that.applier,
            autoBind: true
        });
    };
    
    latte.fetchStaticRates = function (url, callback) {
        function localCallback(response) {
            var data = JSON.parse(response);
            data = latte.conformJSON(data);
            callback(data);
        }
     $.ajax({url: url, success: localCallback});
    };
    
    var setupCurrencyNTime = function (that) {
        // Create an empty model where we will hold values from the user.
        that.model = {
            startDate: "",
            endDate: ""
        };
        that.applier = fluid.makeChangeApplier(that.model);
        renderSelectionUI(that);
        //that.options.fetchRates(that);
        
    };
    
    
    latte.currencyNTime = function (container, options) {
        var that = fluid.initView("latte.currencyNTime", container, options);
        
        that.showErrorMessage = function () {
            that.locate("politeErrorMessage").show();  
        };
        setupCurrencyNTime(that);
        return that;
    };
   
    latte.currencyNTime.localFetch = function (that) {
        var index1 = $.inArray(that.options.localRates, that.model.startDate);
        var index2 = $.inArray(that.options.localRates, that.model.endDate);
        var togo = [];
        for (var i = 0; i < (index2 - index1); ++ i) {
            togo[i] = that.options.localRates[i + index1];
        }
        return togo;
    };
   
    latte.currencyNTime.ajaxFetch = function (that) {
            $.ajax({
               url: "file://../data/rates.json",
               type: "GET",
               dataType: "json",
               data: that.model,
               success: function (data) {
                   that.results = data;
               },
               error: that.showErrorMessage
            });
            
            return that.options.sampleData;
        };
   
    fluid.defaults("latte.currencyNTime", {     
        // All of our default configuration goes here.
        fetchRates: latte.currencyNTime.ajaxFetch,
        selectors: {
            dateFrom: "#dfrom",
            dateTo: "#dto",
            currencySelect: ".flc-currency-select",
            politeErrorMessage: ".flc-currencyNTime-errorMsg"
        },
        
        events: {
            
        }
    });
    
})();
