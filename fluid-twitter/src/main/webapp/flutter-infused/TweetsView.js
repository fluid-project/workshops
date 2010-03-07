(function ($, fluid) {
    
    var renderTweet = function (that, tweet) {
        // Clone the template.
        var tweetElement = that.tweetTemplate.clone();
        
        // Set its text to the status text from Twitter.
        tweetElement.text(tweet.text);
        
        // Add it to the DOM and animate.
        that.container.append(tweetElement);
        tweetElement.fadeIn("slow");
    };
    
    var addKeyboardNavigation = function (that) {        
        // Put the friends and tweets lists in the tab order so you access them with the tab key.
        that.container.attr("tabindex", 0);
        
        // Make each individual friend and tweet selectable with the arrow keys.
        that.tweetsSelectionContext = that.container.fluid("selectable", {
            selectableSelector: that.options.selectors.tweets
        }).that();
    };
    
    var addARIA = function (that) {
        // Give the tweets panel an ARIA "panel" role.
        that.container.attr("role", "panel");
    };
    
    var setupTweetsView = function (that) {
        // Grab the template elements from the DOM and then remove them so they don't get in the way.
        that.tweetTemplate = that.locate("tweetTemplate").remove();
        
        // Make it accessible.
        addKeyboardNavigation(that);
        addARIA(that);
        
        // Pass a set of event listeners up to our parent using the "returnedOptions" property.
        // This property is automatically recognized by the framework's options merging system.
        that.returnedOptions = {
            listeners: {
                afterFriendSelected: that.showTweetsForFriend,
                onTweetsFetchSuccess: that.renderTweetsList, 
                onTweetsFetchError: that.showTweetsListError
            }
        };
    };
    
    /**
     * A View representing the Flutter tweets panel.
     * 
     * @param {jQueryable} container the container that contains the tweets panel
     * @param {Object} options options for the view
     */
    fluid.flutter.tweetsView = function (container, twitter, events, options) {
        var that = fluid.initView("fluid.flutter.tweetsView", container, options);
        that.twitter = twitter;
        that.events = events;
        
        /**
         * Fetches recent tweets for the specified user from Twitter and renders them when ready.
         * 
         * @param {Element} friendElement the friend to show tweets for
         */ 
        that.showTweetsForFriend = function (friendId) {   
            // Use the ARIA "labelledby" property to mark the selected friend as the label for the tweets panel.
            that.container.attr("aria-labelledby", friendId);

            // Fetch the tweets list from Twitter, wiring it up to our events system.
            that.twitter.fetchTweets(friendId, 
                                     that.events.onTweetsFetchSuccess.fire, 
                                     that.events.onTweetsFetchError.fire);
        };
        
        /**
         * Renders the list of tweets with data from Twitter.
         * 
         * @param {Array} tweetsData an array of Status objects from Twitter
         */
        that.renderTweetsList = function (tweetsData) {
            that.twitter.tweets = tweetsData;
            
            // Clear out any tweets that have already been rendered.
            that.container.empty();
            
            // Render each data row into the template element.
            jQuery.each(tweetsData, function (idx, tweet) {
                renderTweet(that, tweet);
            });
            
            // Refresh the list of keyboard selectable elements after we've changed the DOM.
            that.tweetsSelectionContext.refresh();
        };
        
        /**
         * Updates the view based on any changes that may have been made to the twitter model.
         */
        that.refreshView = function () {
            that.renderTweetsList(that.twitter.tweets);
        };
        
        /**
         * Displays a polite error message to the user if there was a problem getting a list of tweets from Twitter.
         */
        that.showTweetsListError = function () {
            that.renderTweetsList([{
                text: "There was a problem getting a list of recent tweets for this user."
            }]);
        };
        
        setupTweetsView(that);
        return that;
    };
    
    fluid.defaults("fluid.flutter.tweetsView", {
        selectors: {
            tweets: "li",
            tweetTemplate: ".flutter-tweet-template"
        }
    });
    
})(jQuery, fluid);
