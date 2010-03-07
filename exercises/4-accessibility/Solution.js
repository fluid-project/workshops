var demo = demo || {};
demo.a11y = demo.a11y || {};

(function ($) {
    
    demo.a11y.addKeyboardNavigation = function () {
        var friendsList = $("#friends");
        
        // Put the friends list in the tab order so you access it with the tab key.
        friendsList.attr("tabindex", 0);
        
        // Make each individual friend selectable with the arrow keys.
        friendsList.fluid("selectable", {
            selectableSelector: "li"
        });
        
        // Make each friend activatable with the Enter and Space bar keys.
        friendsList.children("li").fluid("activatable", function (evt) {
            alert($(evt.target).text() + " was activated!");
        });
    };
    
    demo.a11y.addARIA = function () {
        var friendsList = $("#friends");
        
        // Identify the friends container as a list of tabs.
        friendsList.attr("role", "tablist");
        
        // Give each friend the "tab" role.
        friendsList.children().attr("role", "tab");
        
        // Give the tweets panel an ARIA "panel" role.
        var tweetsList = $("#tweets");
        tweetsList.attr("role", "panel");    
    };
    
    $(function () {
        demo.a11y.addKeyboardNavigation();
        demo.a11y.addARIA();
    });

})(jQuery);