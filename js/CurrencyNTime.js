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
    
    var showInvalidState = function(that, isInvalid) {
        if (isInvalid) {
            that.locate("currencySelect").addClass(that.options.styles.invalidRange);
            that.locate("invalidRangeMessage").show();
        }
        else {
            that.locate("currencySelect").removeClass(that.options.styles.invalidRange);
            that.locate("invalidRangeMessage").hide();
        }
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
                showInvalidState(that, false);
                that.options.fetchRates(that);
            }
            else {
                showInvalidState(that, true);
                that.events.sliceReady.fire(that, null);
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
        that.events.sliceReady.fire(that, null);
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
    
    latte.currencyNTime.renderTable = function() { 
        var renderTemplate = null;
        return function (that, slice) {
            slice = slice || [];
            if (slice.length === 0) {
                that.locate("currencyTable").hide();
                return;
            }
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
            if (renderTemplate) {
                fluid.reRender(renderTemplate, that.locate("currencyTable"), tree, renderOptions);
            }
            else {
                renderTemplate = fluid.selfRender(that.locate("currencyTable"), tree, renderOptions);
            }
            that.locate("currencyTable").show();
        };
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
        styles: {
            invalidRange: "fl-invalid-range"
        },
        selectors: {
            dateFrom: "#dfrom",
            dateTo: "#dto",
            currencySelect: ".flc-currency-select",
            politeErrorMessage: ".flc-currency-errorMsg",
            currencyTable: ".flc-currency-table",
            currencyRow: ".flc-currency-row",
            currencyDate: ".flc-currency-date",
            currencyRate: ".flc-currency-rate",
            invalidRangeMessage: ".flc-invalid-range"
        },
        
        events: {
            sliceReady: null
        },
        listeners: {
            "sliceReady.render": latte.currencyNTime.renderTable()
        }
    });
    
})();
