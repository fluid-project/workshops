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
    
    function makeCutpoint(selectors, ID, selectorName) {
          return {
                id: ID,
                selector: selectors[selectorName]
            };
        }
    
    var renderSelectionUI = function(that) {
        // Loop through the model and create a list 
        // containing all available dates.
        var dates = [""].concat(
            fluid.transform(that.options.localRates, function(row) {
                return row.date;
        }));
        
        function makeSelection(ID, binding) {
            return {
              ID: ID,
              selection: {valuebinding: binding},
              optionlist: dates
            };
        }
        
        // Build up a tree, which provides instructions to the renderer.
        var modelTree = {children: [
            makeSelection("dateFrom", "startDate"),
            makeSelection("dateTo", "endDate")
            ]
        };
        
        var selectors = that.options.selectors;
        
        fluid.selfRender(that.locate("currencySelect"), modelTree, {
            cutpoints: [ 
               makeCutpoint(selectors, "dateFrom", "dateFrom"),
               makeCutpoint(selectors, "dateTo", "dateTo")
            ],
            model: that.model,
            applier: that.applier,
            autoBind: true
        });
        that.applier.modelChanged.addListener("*", function() {
            if (latte.currencyNTime.isValidRange(that.model)) {
                that.options.fetchRates(that);
            }
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
    };
    
    
    latte.currencyNTime = function (container, options) {
        var that = fluid.initView("latte.currencyNTime", container, options);
        
        that.showErrorMessage = function () {
            that.locate("politeErrorMessage").show();  
        };
        setupCurrencyNTime(that);
        return that;
    };
    
    latte.currencyNTime.isValidRange = function(model) {
        return model.startDate && model.endDate &&
            model.startDate < model.endDate;
    };
   
    fluid.setLogging(true);
    
    latte.currencyNTime.renderTable = function (that, slice) {
        var selectors = that.options.selectors;
        var renderOptions = {
            cutpoints: [
                makeCutpoint(selectors, "row:", "currencyRow"),
                makeCutpoint(selectors, "rate", "currencyRate"),
                makeCutpoint(selectors, "date", "currencyDate")
            ]
        };
        //var tree = {"row:": slice};
        var tree = { "children" : 
           fluid.transform(slice, function(row) {
               return {
                 ID: "row:",
                 children: [
                    {ID: "date",
                     value: row.date},
                    {ID: "rate",
                     value: row.rate}
                 ]
               }  
           })};
        fluid.selfRender(that.locate("currencyTable"), tree, renderOptions);
    };
   
    latte.currencyNTime.localFetch = function (that) {
        function findIndex(date) {
            return fluid.find(that.options.localRates, function(row, index) {
                return row.date === date? index : null;
            });
        }
        var index1 = findIndex(that.model.startDate);
        var index2 = findIndex(that.model.endDate);
        var slice = [];
        for (var i = 0; i < (index2 - index1); ++ i) {
            slice[i] = that.options.localRates[i + index1];
        }
        that.events.sliceReady.fire(that, slice);
    };
   
    latte.currencyNTime.ajaxFetch = function (that) {
            $.ajax({
               url: "file://../data/rates.json",
               type: "GET",
               dataType: "json",
               data: that.model,
               success: function (data) {
                   that.events.sliceReady.fire(that, data);
               },
               error: that.showErrorMessage
            });
        };
   
    fluid.defaults("latte.currencyNTime", {     
        // All of our default configuration goes here.
        fetchRates: latte.currencyNTime.ajaxFetch,
        selectors: {
            dateFrom: "#dfrom",
            dateTo: "#dto",
            currencySelect: ".flc-currency-select",
            politeErrorMessage: ".flc-currencyNTime-errorMsg",
            currencyTable: ".flc-currency-table",
            currencyRow: ".flc-currency-row",
            currencyDate: ".flc-currency-date",
            currencyRate: ".flc-currency-rate"
        },
        
        events: {
            sliceReady: null
        },
        listeners: {
            "sliceReady.render": latte.currencyNTime.renderTable
        }
    });
    
})();
