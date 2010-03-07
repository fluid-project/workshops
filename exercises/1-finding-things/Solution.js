(function ($) {
    $(document).ready(function () {
        // The friends list
        $("#friends").addClass("red");
        
        // All list items in every list on the page
        $("li").addClass("green");
        
        // The list items inside the friends list
        $("#friends li").addClass("blue");
        
        // Everything with the class fl-centered
        $(".fl-centered").addClass("red");
        
        // The first form element on the page
        $("form").eq(0).addClass("green");
        
        // The last item in the friends list
        $("#friends:last").addClass("blue");
        
        // The label for the username text field
        $("#settings-panel li:first label").addClass("red");
    }); 
})(jQuery);
