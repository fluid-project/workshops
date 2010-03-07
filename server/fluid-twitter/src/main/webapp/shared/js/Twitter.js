var fluid = fluid || {};

(function ($) {
    var RESOURCES = {
        FRIENDS: "Friends",
        STATUSES: "Statuses",
        USER: "User"
    };
    
    var createQuery = function (that, data) {
        var query = {
            u: that.username,
            p: that.password
        };
        
        return jQuery.extend(query, data);
    };
    
    var ajax = function (that, method, url, onSuccess, onError, data) {
        jQuery.ajax({
            url: url,
            type: method,
            dataType: "json",
            data: createQuery(that, data),
            success: onSuccess,
            error: onError
        });
    };
    
    var serverURLFactory = function (baseUrl, friendId) {
        return baseUrl + RESOURCES.STATUSES;
    };
    
    var fileSystemURLFactory = function (baseUrl, friendId) {
        return "./sample-data/user_timeline_" + friendId + ".json";
    };
    
    var setupTwitter = function (that, options) {
        // Mix in options
        that.options = $.extend(true, {}, options);
        that.options.maxTweets = that.options.maxTweets || 5;
        that.username = that.options.username;
        that.password = that.options.password;
        
        // Setup the URL factory for local or server use.
        if (!that.options.userUrlFactory) {
            that.options.userUrlFactory = (document.location.protocol === "file:") ? fileSystemURLFactory : serverURLFactory;
        }
    };
    
    /**
     * Provides an API for accessing information from Twitter.
     * Options structure may include:
     *   baseUrl:  The base URL to be used for querying Twitter info
     *   username: The username for access to Twitter
     *   password: The password for access to Twitter
     *   userUrlFactory: A function which will build URLs returning info for a particular user
     *   maxTweets: The maximum number of tweets to be returned 
     */
    fluid.twitter = function (options) {
        options = options || {};
         // Define your new object instance, and set up its variables.
        var that = {
            username: null,
            password: null,
            selectedFriendId: null,
            friends: null,
            tweets: null
        };
        
        /**
         * Gets information about the user from Twitter, including name and picture.
         *
         * @param {Function} onSuccess a function to invoke with the data when it has been fetched succesfully
         * @param {Function} onError a function to invoke if there was an error getting data
         */
        that.fetchUser = function (onSuccess, onError) {
            ajax(that, "GET", that.options.baseUrl + RESOURCES.USER, onSuccess, onError, {
                id: that.username
            })
        };
        
        /**
         * Gets the list of friends for the current user from Twitter.
         * 
         * @param {Function} onSuccess a function to invoke with the data when it has been fetched succesfully
         * @param {Function} onError a function to invoke if there was an error getting data
         */
        that.fetchFriends = function (onSuccess, onError) {
            ajax(that, "GET", that.options.baseUrl + RESOURCES.FRIENDS, onSuccess, onError, {
                id: that.username
            });
        };
        
        /**
         * Gets a list of recent tweets for the specified friend from Twitter
         * 
         * @param {String} friendId the friend id to fetch tweets for
         * @param {Function} onSuccess a function to invoke with the data when it has been fetched
         * @param {Function} onError a function to invoke if there was an error getting data
         */
        that.fetchTweets = function (friendId, onSuccess, onError) {
            ajax(that, "GET", that.options.userUrlFactory(that.options.baseUrl, friendId), onSuccess, onError, {
                id: friendId,
                count: that.options.maxTweets
            });
        };
        
        /**
         * Posts a new tweet for the current user to Twitter.
         * 
         * @param {String} statusMessage the status message to send
         * @param {Function} onSuccess a function to invoke when the data has been sent
         * @param {Function} onError a function to invoke if there was an error getting data
         */
        that.postStatus = function (statusMessage, onSuccess, onError) {
            ajax(that, "POST", that.options.baseUrl + RESOURCES.STATUSES, onSuccess, onError, {
                status: statusMessage
            });
        };
        
        setupTwitter(that, options);
        return that;
    };
    
})(jQuery);
