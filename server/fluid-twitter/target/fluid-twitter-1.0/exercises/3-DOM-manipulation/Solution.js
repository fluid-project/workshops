(function ($) {
    $(document).ready(function () {
        var template = $("#tweets #flutter-tweet-template").remove();
        template.attr("id", "");
        var entryField = $("#status");
        
        
        function updateStatus(newText) {
            var newNode = template.clone();
            newNode.text(newText);
            $("#tweets").append(newNode);
            newNode.show();
        }
        
        entryField.keyup(function (event) {
            if (event.which === $.ui.keyCode.ENTER) {
                updateStatus(entryField.val());
                entryField.val("");
                
                // We want to prevent the browser from handling the Enter key in its default way.
                event.preventDefault();
            }
        });
        
        
    }); 
})(jQuery);
