(function ($) {
    $(document).ready(function () {
        var friends = $("#friends li");
        function selectFriend(friend) {
            friends.removeClass("flutter-active");
            friend.addClass("flutter-active");
        }
        // The friends list
        friends.each(function(index, item) {
            var jItem = $(item);
            jItem.click(function (){selectFriend(jItem);});  
        });
        
    }); 
})(jQuery);
