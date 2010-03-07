(function ($, fluid) {
    
    var bindNavigationHandlers = function (that) {
        var selectTab = function (selectedTab, event) {
            that.locate("allTabs").removeClass(that.options.styles.activeTab);
            selectedTab.addClass(that.options.styles.activeTab);
            event.preventDefault();
        };
        
        // Bind a click handler to the Friends tab.
        var friendsTab = that.locate("friendsTab");
        friendsTab.click(function(event) {
            selectTab(friendsTab, event);
            that.showMainPanel();
        });
        
        // And one to the Settings tab.
        var settingsTab = that.locate("settingsTab");
        settingsTab.click(function (event) {
            selectTab(settingsTab, event);
            that.showSettingsPanel();
        });
    };
    
    var bindEventHandlers = function (that) {        
        that.events.onSaveSettings.addListener(that.showMainPanel);
        that.events.onFriendsFetchError.addListener(that.friendsErrorDialog.open);

        bindNavigationHandlers(that);
    };
    
    var initSubViews = function (that) {
        // Create the Friend View, responsible for showing and selecting the list of friends.
        that.friendsView = fluid.initSubcomponent(that, 
                                                  "friendsView", 
                                                  [that.locate("friendsList"), that.twitter, that.events, fluid.COMPONENT_OPTIONS]);
        
        // Instantiate the Tweets View, which displays the list of tweets.
        that.tweetsView = fluid.initSubcomponent(that, 
                                                 "tweetsView", 
                                                 [that.locate("tweetsList"), that.twitter, that.events, fluid.COMPONENT_OPTIONS]);
        
        // The Settings View controls the panel allowing users to edit their username and password for Twitter.
        that.settingsView = fluid.initSubcomponent(that, 
                                                   "settingsView", 
                                                   [that.locate("settingsPanel"), that.twitter, that.events, fluid.COMPONENT_OPTIONS]);
        
        // The Status View shows the user's icon, name, and allows them to update their status.
        that.statusView = fluid.initSubcomponent(that, 
                                                 "statusView", 
                                                 [that.locate("statusPanel"), that.twitter, that.events, fluid.COMPONENT_OPTIONS]);
    };
    
    var setupFlutter = function (that) {
        // Create a new Twitter instance for making calls to the server.
        that.twitter = fluid.twitter({
            baseUrl: that.options.serverUrl,
            userUrlFactory: that.options.userUrlFactory
        });
        
        // Initialize the various bits of UI behaviour required by Flutter.
        initSubViews(that);
                                    
        // Set up the Friend error dialog.
        that.friendsErrorDialog = fluid.flutter.settingsDialog(that.locate("errorDialog"), that.showSettingsPanel);
                       
        // Bind event handlers and other dynamic behaviour.
        bindEventHandlers(that);
        
        // Show the main panel and fetch data from Twitter.
        that.showMainPanel();
    };
    
    /**
     * Creates a new instance of the Flutter widget, a client-side Twitter client.
     */
    fluid.flutter = function (container, options) {
        // Initialize Flutter as a View.
        var that = fluid.initView("fluid.flutter", container, options);
        
        /**
         * Selects the specified friend, causing their tweets to be fetched from Twitter and displayed in the Tweets View.
         * 
         * @param {jQueryable} friendElement the friend element to select
         */
        that.selectFriend = function (friendElement) {
            that.friendsView.selectFriend(friendElement);
        };
        
        /**
         * Displays the main Friends panel.
         */
        that.showMainPanel = function () {
           // Show the main panel again.
           that.settingsView.hide();
           
            var mainPanel = that.locate("mainPanel"); 
            if (mainPanel.hasClass(that.options.styles.hidden)) {
                that.settingsView.hide();
                mainPanel.removeClass(that.options.styles.hidden);
            }

            // Load the friends list from Twitter, wiring it up to our events system so everyone knows
            // when success or an error occurred.
            that.twitter.fetchFriends(that.events.onFriendsFetchSuccess.fire, that.events.onFriendsFetchError.fire); 
        };
        
        /**
         * Displays the Settings panel.
         */
        that.showSettingsPanel = function () {
            if (that.settingsView.isVisible()) {
                return;
            }
        
            // Swap panels.
            var mainPanel = that.locate("mainPanel");
            that.settingsView.show(mainPanel.height(), mainPanel.width());
            mainPanel.addClass(that.options.styles.hidden);
        };
        
        setupFlutter(that);
        return that;
    };
    
    fluid.defaults("fluid.flutter", {
        friendsView: {
            type: "fluid.flutter.friendsView"
        },
        
        tweetsView: {
            type: "fluid.flutter.tweetsView"
        },

        settingsView: {
            type: "fluid.flutter.settingsView"
        },
        
        statusView: {
            type: "fluid.flutter.statusView"
        },
                
        selectors: {
            mainPanel: ".flutter-main-panel",
            settingsPanel: ".flutter-settings-panel",
            
            statusPanel: ".flutter-status-panel",
            friendsList: ".flutter-friends",
            tweetsList: ".flutter-tweets",
            
            allTabs: ".flutter-panel-tabs li",
            friendsTab: ".flutter-friends-tab",
            settingsTab: ".flutter-settings-tab",
            
            errorDialog: ".flutter-error-dialog"
        },
        
        styles: {
            hidden: "flutter-hidden",
            activeTab: "fl-activeTab"
        },
        
        events: {
            // View-related events.
            afterFriendSelected: null,
            onSaveSettings: null,
            
            // Model change events.
            onFriendsFetchSuccess: null,
            onFriendsFetchError: null,
            onTweetsFetchSuccess: null,
            onTweetsFetchError: null,
            onStatusSaveSuccess: null,
            onStatusSaveError: null
        }
    });
    
    $(document).ready(function () {
        var options = {
            serverUrl: "../"
        };
        fluid.flutter(".flutter-main", options);
    });
})(jQuery, fluid);
