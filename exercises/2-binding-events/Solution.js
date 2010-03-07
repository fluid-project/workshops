(function ($) {
    $(document).ready(function () {
        var friends = $("#friends li");
        var activeClass = "flutter-active";
        var selectFriend = function (friend) {
            friends.not(friend).removeClass(activeClass);
            friend.addClass(activeClass);
        };
        
        friends.click(function () {
            selectFriend($(this));
        });
    });
})(jQuery);
