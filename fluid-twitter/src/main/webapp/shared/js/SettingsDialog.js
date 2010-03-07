var fluid = fluid || {};

(function ($) {
    
    fluid.flutter = fluid.flutter || {};
    
    var setupSettingsDialog = function (that) {        
        // Turn the dialog element into a jQuery UI dialog widget and show it.
        that.dialogElement.dialog({
            dialogClass : 'fl-widget',
            buttons: {
                "Cancel": that.close,             
                "Settings": function() {
                    that.settings();
                    that.close();
                }
            }
        });
    };
    
    /**
     * Creates a new settings dialog for Flutter.
     * 
     * @param {Object} container the element containing the dialog's contents.
     */
    fluid.flutter.settingsDialog = function (container, settingsAction) {
        var that = {
            dialogElement: $(container)
        };
        
        that.open = function () {
            that.dialogElement.dialog("open");
        };
        
        that.settings = settingsAction;
        
        that.close = function () {
            that.dialogElement.dialog("close");
        };
        
        setupSettingsDialog(that, settingsAction);
        return that;
    };
    
})(jQuery);
