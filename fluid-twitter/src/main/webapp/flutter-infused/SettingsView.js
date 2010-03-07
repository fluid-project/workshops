(function ($, fluid) {

    var setupSettingsView = function (that) {
       that.container.find("button").click(function (event) {
           that.twitter.username = that.locate("usernameField").val();
           that.twitter.password = that.locate("passwordField").val();
           
           // Fire an event to tell the world that the user has saved their settings.
           that.events.onSaveSettings.fire(that.twitter.username, that.twitter.password);
           
           // Tell the browser not to do the default action for buttons,
           // since we're handling it ourselves.
           event.preventDefault(); 
       });
    };
    
    /**
     * A View representing the Settings panel.
     * 
     * @param {jQueryable} container the container that contains the tweets panel
     * @param {Object} options options for the view
     */
    fluid.flutter.settingsView = function (container, twitter, events, options) {
        var that = fluid.initView("fluid.flutter.settingsView", container, options);
        that.twitter = twitter;
        that.events = events;
        
        /**
         * Shows the panel at the specified height and width
         * 
         * @param {Number} height the height of the settings panel in pixels
         * @param {Number} width the width of the panel in pixels
         */
        that.show = function (height, width) {
            that.container.removeClass(that.options.styles.hidden);
            
            // Restore the correct dimensions. This should really be done in CSS.
            that.container.height(height);
            that.container.width(width);
        };
        
        /**
         * Hides the view.
         */
        that.hide = function () {
            that.container.addClass(that.options.styles.hidden);
        };
        
        /**
         * Checks if the view is currently displayed on screen.
         * 
         * @return {boolean} 
         */
        that.isVisible = function () {
            return !that.container.hasClass(that.options.styles.hidden);
        };
        
        /**
         * Refreshes the view based on any changes that may have been made to the model.
         */
        that.refreshView = function () {
            that.locate("usernameField").val(that.twitter.username || "");
            that.locate("passwordField").val(that.twitter.password || "");  
        };
        
        setupSettingsView(that);
        return that;
    };
    
    fluid.defaults("fluid.flutter.settingsView", {
        selectors: {
            usernameField: ".flutter-username-edit",
            passwordField: ".flutter-password-edit"
        },
        
        styles: {
            hidden: "flutter-hidden"
        }
    });
    
})(jQuery, fluid);
