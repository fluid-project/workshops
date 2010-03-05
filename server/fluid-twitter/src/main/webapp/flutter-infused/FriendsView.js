(function ($, fluid) {
        
    // Simple ad-hoc data binding. These two function assume that the friend's id is assigned to the element's id.
    var idForFriendElement = function (friendElement) {
        return $(friendElement).attr("id");
    };
    
    var friendElementForId = function (friendId) {
        return fluid.jById(friendId);  
    };
    
    var makeFriendActivatable = function (that, friendElement) {
        friendElement.fluid("activatable", function(evt){
            that.selectFriend(evt.target);
        });    
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
        
        makeFriendActivatable(that, friendElement);
        
        // Add it to the friends list. It will be hidden to start, and then faded in.
        that.locate("friendsList").append(friendElement);
        friendElement.fadeIn("slow");
    };
    
    var addKeyboardNavigation = function (that) {
        that.container.attr("tabindex", 0);
        that.friendSelectionContext = that.container.fluid("selectable", {
            selectableSelector: that.options.selectors.friends
        }).that();
        
        makeFriendActivatable(that, that.locate("friends"));
    };
    
    var addARIA = function (that) {
        // Identify the friends container as a list of tabs.
        that.container.attr("role", "tablist");
        
        // Give each friend the "tab" role.
        that.locate("friends").attr("role", "tab");
    };
    
    var listenForEvents = function (that) {
        // Pass a set of event listeners up to our parent using the "returnedOptions" property.
        // This property is automatically recognized by the framework's options merging system
        // and is passed upstream to the parent.
        that.returnedOptions = {
            listeners: {
                onFriendsFetchSuccess: that.renderFriendsList
            }
        };
    };
    
    var selectCurrentFriend = function (that) {
        // Select a friend by default: either whatever is selected already, or the first in the list.
        var activeFriend = friendElementForId(that.twitter.selectedFriendId);
        var defaultFriend = activeFriend.length ? activeFriend : that.locate("friends").eq(0);
        that.selectFriend(defaultFriend);
    };
    
    var setupFriendsView = function(that) {
        // Grab the template elements from the DOM and then remove them so they don't get in the way.
        that.friendTemplate = that.locate("friendTemplate").remove(); 
        
        // Add a mouse click handler to each of the friend elements.
        // Use jQuery's new live() function to ensure that any new friends will automatically get bound, too.
        that.locate("friends").live("click", function(event){
            that.selectFriend(event.target);
        });
        
        // Make it accessible.
        addKeyboardNavigation(that);
        addARIA(that);
        
        listenForEvents(that);
        
        selectCurrentFriend(that);
    };
    
    /**
     * A View representing the Flutter friends panel.
     * 
     * @param {jQueryable} container the container that contains the friends panel
     * @param {Object} options options for the view.
     */
    fluid.flutter.friendsView = function (container, twitter, events, options) {
        // Initialize this as a View.
        var that = fluid.initView("fluid.flutter.friendsView", container, options);
        that.twitter = twitter;
        that.events = events;
        
        /**
         * Renders the list of friends with data from Twitter.
         * 
         * @param {Array} friendsData an array of Friend objects from Twitter
         */
        that.renderFriendsList = function (friendsData) {
            that.twitter.friends = friendsData;
            
            // Clear out any friends that have already been rendered.
            that.container.empty();
            
            // Render each data row into the template element.
            jQuery.each(friendsData, function (idx, friend) {
                renderFriend(that, friend);
            });
            
            // Make sure all the new stuff in the list is selectable.
            that.friendSelectionContext.refresh();
            
            // Add ARIA roles to each friend.
            addARIA(that);
            
            // Finally, select the appropriate friend.
            selectCurrentFriend(that);
        };
        
        /**
         * Selects the friend represented by friendElement, showing their recent tweets.
         * 
         * @param {Element} friendElement
         */ 
        that.selectFriend = function (friendElement) {
            var friends = that.locate("friends");
            
            // Wrap the element in a jQuery, since all event handlers pass pure DOM elements.
            friendElement = $(friendElement);

            // Add a class to style the friend as active.
            friends.removeClass(that.options.styles.active);
            friendElement.addClass(that.options.styles.active);
            
            // Mark the tab with the ARIA "selected" state.
            friends.attr("aria-selected", false);
            friendElement.attr("aria-selected", true);
            
            // Update the model, then fire an event to let everyone know that the friend was selected.
            var id = idForFriendElement(friendElement);
            that.twitter.selectedFriendId = id;
            that.events.afterFriendSelected.fire(id);
        };
        
        /**
         * Re-renders the view based on any changes that may have occurred in the model.
         */
        that.refreshView = function () {
            that.renderFriendsList(that.twitter.friends);
        };
        
        setupFriendsView(that);
        return that;
    };
    
    fluid.defaults("fluid.flutter.friendsView", {
        // Defines the selectors used to find elements within the view.
        selectors: {
            friends: "li",
            activeFriend: ".flutter-active",
            friendTemplate: ".flutter-friend-template",
            errorDialog: ".errorDialog"
        },
        
        // Styles added to friend elements.
        styles: {
            active: "flutter-active"
        }
    });
    
})(jQuery, fluid);
