var fluid = fluid || {};

(function ($) {
    var RESOURCES = {
        FRIENDS: "/Friends",
        STATUSES: "/Statuses"
    };
    
    var createQuery = function (that, data) {
        var query = {
            u: that.options.username,
            p: that.options.password
        };
        
        return jQuery.extend(query, data);
    };

    
    function makeDefaultUserUrlFactory() {
        return function(baseUrl, friendid) {
            return baseUrl + RESOURCES.STATUSES;
        };
    }
    
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
        var that = { };
        
        that.options = $.extend(true, {}, options);
        that.options.maxTweets = that.options.maxTweets || 10;
        that.options.userUrlFactory = that.options.userUrlFactory || makeDefaultUserUrlFactory(that);
        
        /**
         * Gets the list of friends for the current user from Twitter.
         * 
         * @param {Function} onSuccess a function to invoke with the data when it has been fetched succesfully
         * @param {Function} onError a function to invoke if there was an error getting data
         */
        that.getFriends = function (onSuccess, onError) {

        };
        
        /**
         * Gets a list of recent tweets for the specified friend from Twitter
         * 
         * @param {String} friendId the friend id to fetch tweets for
         * @param {Function} onSuccess a function to invoke with the data when it has been fetched
         * @param {Function} onError a function to invoke if there was an error getting data
         */
        that.getTweets = function (friendId, onSuccess, onError) {

        };
        
        /**
         * Posts a new tweet for the current user to Twitter.
         * 
         * @param {String} statusMessage the status message to send
         * @param {Function} onSuccess a function to invoke when the data has been sent
         * @param {Function} onError a function to invoke if there was an error getting data
         */
        that.postStatus = function (statusMessage, onSuccess, onError) {

        };
        
        return that;
    };
    
})(jQuery);
