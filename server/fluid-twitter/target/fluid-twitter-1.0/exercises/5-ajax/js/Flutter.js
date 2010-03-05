var fluid = fluid || {};

(function ($) {
    
    var idForFriendElement = function (that, friendElement) {
        return friendElement.attr("id");
    };
    
    var renderFriend = function (that, friend) {
        // Grab the template element and clone it.
        var friendElement = that.friendTemplate.clone();
        
        // Give the friend an id so we can bind it back to the data later.
        friendElement.attr("id", friend.id);
        
        // Setup the image with a correct url and alt text.
        friendElement.find("img").attr("src", friend.profile_image_url).attr("alt", friend.name + "'s profile picture.");
        
        // Render its name.
        friendElement.append(friend.name);
        
        // Add it to the friends list. It will be hidden to start.
        that.friendsList.append(friendElement);
        
        // Sprinkle on a little animation for slickness.
        friendElement.fadeIn("slow");
    };
    
    var renderTweet = function (that, tweet) {
        // Clone the template.
        var tweetElement = that.tweetTemplate.clone();
        
        // Remove the id from the tweet.
        tweetElement.attr("id", "");
        
        // Set its text to the status text from Twitter.
        tweetElement.text(tweet.text);
        
        // Add it to the DOM.
        that.tweetsList.append(tweetElement);
        
        // Fade it in all slick-like.
        tweetElement.fadeIn("slow");
    };
    
    var showStatusUpdateMessage = function (that, message) {
        that.statusMessage.text(message);
        that.statusMessage.show();
    };
    
    var showFriendsErrorDialog = function (that) {
        if (!that.friendsErrorDialog) {
            that.friendsErrorDialog = fluid.flutter.settingsDialog("#friends-error-dialog", that.showSettingsPanel);
        }
        
        that.friendsErrorDialog.open();
    };
    
    var showTweetsForFriend = function (that, activatedFriend) {
        var id = idForFriendElement(that, activatedFriend);
        if (id) { 
            that.twitter.getTweets(id, that.renderTweetsList, that.showTweetsListError);
        }
    };
    
    var showFriends = function (that) {
        that.twitter.getFriends(that.renderFriendsList, that.showFriendsListError);    
    };
    
    var makeListSelectable = function (list) {
        var selectableThat = list.fluid("selectable", {
            selectableSelector: "li"
        });
    };
    
    var addKeyboardNavigation = function (that) {        
        // Put the friends and tweets lists in the tab order so you access them with the tab key.
        that.friendsList.attr("tabindex", 0);
        that.tweetsList.attr("tabindex", 0);
        
        // Make each individual friend and tweet selectable with the arrow keys.
        makeListSelectable(that.friendsList);
        makeListSelectable(that.tweetsList);
        
        // Add an activation handler for the Enter key.
        that.friendsList.find("li").fluid("activatable", that.selectFriend);
        return {
            selectableFriends: that.friendsList.that(),
            selectableTweets: that.tweetsList.that()
        };
    };

    var bindMainPanelHandlers = function (that) {
        // Add a keypress event to the status edit field that submits the status to Twitter.
        that.statusEditField.keyup(function (event) {
            if (event.which === $.ui.keyCode.ENTER) {
                that.updateStatus(that.statusEditField.val());
                
                // We want to prevent the browser from handling the Enter key in its default way.
                event.preventDefault();
            }
        });
        
        // Add a focus event to the status edit field that clears the previous status update message.
        that.statusEditField.focus(function () {
            that.statusMessage.hide();
        });
        
        // Add a mouse click handler to each of the friend elements.
        $("li", that.friendsList).live("click", function(event){
            that.selectFriend(event.target);
        });
    };
    
    var bindSettingsPanelHandlers = function (that) {
       that.settingsPanel.find("button").click(function (event) {
           // Pull the data out of the form and push into into our Twitter object.
           that.twitter.options.username = $("#username", that.settingsPanel).val();
           that.twitter.options.password = $("#password", that.settingsPanel).val();
           
           // Show the main panel again.
           that.showMainPanel();
           
           // Tell the browser not to do the default action for buttons,
           // since we're handling it ourselves.
           event.preventDefault(); 
       });
    };
    
    var bindTabHandlers = function (that) {
        // Bind a click handler to the tab container to handle tab switching.
        var tabChildren = that.tabs.children();
        tabChildren.click(function (event) {
            tabChildren.removeClass(".fl-activeTab");
            $(event.target).addClass(".fl-activeTab");
        });
        
        // Bind a click handler to the Friends tab.
        that.tabs.find("#friends-tab").click(function(event) {
            that.showMainPanel();
            event.preventDefault();
        });
        
        // And one to the Settings tab.
        that.tabs.find("#settings-tab").click(function (event) {
            that.showSettingsPanel();
            event.preventDefault();
        });
    };
    
    var bindEventHandlers = function (that) {
        bindMainPanelHandlers(that);
        bindSettingsPanelHandlers(that);
        bindTabHandlers(that);
        return addKeyboardNavigation(that);
    };
    
    var addARIATabRole = function (tabs) {
        tabs.attr("role", "tab");
    };
    
    var addARIA = function (that) {
        // Identify the friends container as a list of tabs.
        that.friendsList.attr("role", "tablist");
        
        // Give each friend the "tab" role.
        addARIATabRole(that.friendsList.children());
        
        // Give the tweets panel an ARIA "panel" role.
        that.tweetsList.attr("role", "panel");
    };
    
    var setupFlutter = function (that, options) {

        // Create a new Twitter instance for making calls to the server.
        that.twitter = fluid.twitter(
           {baseUrl: options.serverUrl,
            userUrlFactory: options.userUrlFactory
        });
        
        // Select the interesting parts of UI and hold onto them as instance variables.
        that.mainPanel = $("#main-panel");
        that.settingsPanel = $("#settings-panel");
        that.statusEditField = $(".flutter-status-panel textarea");
        that.statusMessage = $(".flutter-status-panel #flutter-status-update-message");
        that.friendsList = $("#friends");
        that.tweetsList = $("#tweets");
        that.tabs = $("#tabs");
        
        // Grab the template elements from the DOM and then remove them so they don't get in the way.
        that.friendTemplate = $("#flutter-friend-template").remove();
        that.tweetTemplate = $("#flutter-tweet-template").remove();
       
        // Bind event handlers and other dynamic behaviour.
        that.selectables = bindEventHandlers(that);
       
        // Select a friend by default: either whatever is selected in the markup, or the first in the list.
        var defaultFriend = $(".flutter-active", that.friendsList) || that.friendsList.children(":first");
        that.selectFriend(defaultFriend);
        
        addARIA(that);
        
        // Show the main panel and fetch data from Twitter.
        that.showMainPanel();
    };
    
    /**
     * Creates a new instance of the Flutter widget, a client-side Twitter client.
     */
    fluid.flutter = function (options) {
        var that = {};
        options = options || {};
        
        /**
         * Selects the friend represented by friendElement, showing their recent tweets.
         * 
         * @param {Element} friendElement
         */ 
        that.selectFriend = function (friendElement) {
            // Wrap the element in a jQuery, since all event handlers pass pure DOM elements.
            friendElement = $(friendElement);
            
            // Add a class to give the style the friend as active.
            friendElement.addClass("flutter-active");
            if (that.selectedFriend) {
                that.selectedFriend.removeClass("flutter-active");
            }
            that.selectedFriend = friendElement;
            
            // Mark the tab with the ARIA "selected" state.
            that.selectedFriend.attr("aria-selected", true);
            
            // Use the ARIA "labelledby" property to mark the selected friend as the label for the tweets panel.
            that.tweetsList.attr("aria-labelledby", that.selectedFriend.id);
        
            // Show the list of tweets for this friend.
            showTweetsForFriend(that, friendElement);
        };

        /**
         * Updates the user's status on Twitter.
         * 
         * @param {String} statusMessage the status message to send to Twitter
         */
        that.updateStatus = function (statusMessage) {
            that.twitter.postStatus(statusMessage, that.showStatusUpdateSuccess, that.showStatusUpdateError);
        };
        
        /**
         * Renders the list of friends with data from Twitter.
         * 
         * @param {Array} friendsData an array of Friend objects from Twitter
         */
        that.renderFriendsList = function (friendsData) {
            // Clear out any friends that have already been rendered.
            that.friendsList.empty();
            
            // Render each data row into the template element.
            jQuery.each(friendsData, function (idx, friend) {
                renderFriend(that, friend);
            });
            
            // Make sure all the new stuff in the list is selectable.
            that.friendsList.that().refresh();
            
            // Still need to add activation and ARIA roles to each friend.
            
            // Finally, select the first friend.
            that.friendsList.children().eq(0).click();
        };
        
        /**
         * Renders the list of tweets with data from Twitter.
         * 
         * @param {Array} tweetsData an array of Status objects from Twitter
         */
        that.renderTweetsList = function (tweetsData) {
            // Clear out any tweets that have already been rendered.
            that.tweetsList.empty();
            
            // Render each data row into the template element.
            jQuery.each(tweetsData, function (idx, tweet) {
                renderTweet(that, tweet);
            });
            
            // Refresh the list of keyboard selectable elements after we've changed the DOM.
            that.selectables.selectableTweets.refresh();
        };
        
        /**
         * Displays the main Friends panel.
         */
        that.showMainPanel = function () {
            if (that.mainPanel.hasClass("flutter-hidden")) {
                that.settingsPanel.addClass("flutter-hidden");
                that.mainPanel.removeClass("flutter-hidden");
            }

            showFriends(that);
        };
        
        /**
         * Displays the Settings panel.
         */
        that.showSettingsPanel = function () {
            if (!that.settingsPanel.hasClass("flutter-hidden")) {
                return;
            }
            
            // Hold on to the main panel's height and width so we make the settings panel the same size.
            var mainHeight = that.mainPanel.height();
            var mainWidth = that.mainPanel.width();
        
            // Swap panels.
            that.mainPanel.addClass("flutter-hidden");
            that.settingsPanel.removeClass("flutter-hidden");
            
            // Restore the correct dimensions. This should really be done in CSS.
            that.settingsPanel.height(mainHeight);
            that.settingsPanel.width(mainWidth);
        };
        
        /**
         * Shows a message to the user when their status has been successfully updated on Twitter. 
         */
        that.showStatusUpdateSuccess = function () {
            showStatusUpdateMessage(that, "Your status was successfully updated!");
            
            // Clear the edit field so the user has another affordance showing that their status update was a success.
            that.statusEditField.val("");
        };
        
        /**
         * Displays a polite error message to the user if there was a problem updating their status on Twitter.
         */
        that.showStatusUpdateError = function () {
            showStatusUpdateMessage(that, "There was a problem updating your status on Twitter.");
        };
        
        /**
         * Displays a polite error message to the user if there was a problem geting their friends list from Twitter.
         */
        that.showFriendsListError = function () {
            showFriendsErrorDialog(that);
        };
        
        /**
         * Displays a polite error message to the user if there was a problem getting a list of tweets from Twitter.
         */
        that.showTweetsListError = function () {
            that.renderTweetsList([{
                text: "There was a problem getting a list of recent tweets for this user."
            }]);
        };
        
        setupFlutter(that, options);
        return that;
    };
    
    function localUserUrlFactory (baseUrl, friendid) {
        return baseUrl + "/user_timeline_" + friendid + ".json";
    }

    var filesystemServer = document.location.protocol === "file:";    
    var liveServerUrl = "../";
    // Edit these two lines to change the configuration for the server connection
    
    $(document).ready(function () {
        var options = {
            serverUrl: filesystemServer? "sample-data" : liveServerUrl,
            userUrlFactory: filesystemServer? localUserUrlFactory: null
        };
        fluid.flutter(options);
    });
})(jQuery);
