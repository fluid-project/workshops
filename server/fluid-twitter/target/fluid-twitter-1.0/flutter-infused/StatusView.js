(function ($, fluid) {
    
    var showStatusUpdateMessage = function (that, message) {
        var statusMessage = that.locate("statusMessage");
        statusMessage.text(message);
        statusMessage.show();
    };
    
    var listenForEvents = function (that) {
        // Pass a set of event listeners up to our parent using the "returnedOptions" property.
        // This property is automatically recognized by the framework's options merging system.
        that.returnedOptions = {
            listeners: {
                onStatusSaveSuccess: that.showStatusUpdateSuccess,
                onStatusSaveError: that.showStatusUpdateError
            }
        };   
    };
    
    var setupStatusView = function (that) {
        var statusEditField = that.locate("statusEdit");
        
        // Add a keypress event to the status edit field that submits the status to Twitter.
        statusEditField.keypress(function (event) {
            if (event.which === $.ui.keyCode.ENTER) {
                that.updateStatus(statusEditField.val());
                
                // We want to prevent the browser from handling the Enter key in its default way.
                event.preventDefault();
            }
        });
        
        // Add a focus event to the status edit field that clears the previous status update message.
        statusEditField.focus(function () {
            that.locate("statusMessage").hide();
        });
        
        listenForEvents(that);
    };
    
    /**
     * A View representing the Flutter status panel.
     * 
     * @param {Object} container
     * @param {Object} options
     */
    fluid.flutter.statusView = function (container, twitter, events, options) {
        var that = fluid.initView("fluid.flutter.statusView", container, options);
        that.twitter = twitter;
        that.events = events;
                
        /**
         * Updates the user's status on Twitter.
         * 
         * @param {String} statusMessage the status message to send to Twitter
         */
        that.updateStatus = function (statusMessage) {
            // Post the status to the server
            that.twitter.postStatus(statusMessage,
                                    that.events.onStatusSaveSuccess.fire,
                                    that.events.onStatusSaveError.fire);
        };
        
        /**
         * Shows a message to the user when their status has been successfully updated on Twitter. 
         */
        that.showStatusUpdateSuccess = function () {
            showStatusUpdateMessage(that, "Your status was successfully updated!");
            
            // Clear the edit field so the user has another affordance showing that their status update was a success.
            that.locate("statusEdit").val("");
        };
        
        /**
         * Displays a polite error message to the user if there was a problem updating their status on Twitter.
         */
        that.showStatusUpdateError = function () {
            showStatusUpdateMessage(that, "There was a problem updating your status on Twitter.");
        };
        
        setupStatusView(that);
        return that;    
    };
    
    fluid.defaults("fluid.flutter.statusView", {
        selectors: {
            statusEdit: "textarea",
            statusMessage: ".flutter-status-update-message"
        }
    });
    
})(jQuery, fluid);
