(function ($) {
    var keyCode = {
        TAB: 9,
        LEFT: 37,
        UP: 38,
        RIGHT: 39,
		DOWN: 40
    };
    
    var setupSelectionContext = function (thisjQ, options) {
        return {
            selectables: $(options.selectables, this),
            selectedItem: null,
            handlers: {
                onSelect: options.onSelect,
                onUnselect: options.onUnselect
            }
        };
    };
    
    var select = function (thisjQ, evt, toSelect) {
        var context = thisjQ.arrowKeys.selectionContext;
        context.selectedItem = toSelect;
        toSelect.focus();
        context.handlers.onSelect(evt, toSelect);
    };
    
    var unselect = function (thisjQ, evt, toUnselect) {
        var context = thisjQ.arrowKeys.selectionContext;
        context.handlers.onUnselect(evt, toUnselect);
        toUnselect.blur();
        context.selectedItem = null;
    };
    
    var determineSelectable = function (thisjQ, evt) {
        var selectable = null;
        if (evt.which === keyCode.RIGHT || evt.which === keyCode.down) {
            var 
        } else {
            
        } 
        
        return selectable;
    };
    
    var addKeyHandlers = function (thisjQ) {
        var context = thisjQ.arrowKeys.selectionContext;
        
        // Add a listener for the arrow keys.
        thisjQ.keyPress(function (evt) {
            // Figure out which arrow key the user pressed, and which item is next/previous.
            var toSelect = determineSelectable(thisjQ, evt);
            
            // Unselect anything previously selected and select the new item.
            unselect(thisjQ, evt, context.selectedItem);
            select(thisjQ, evt, toSelect);
        });
        
        // And one for the tab key.
        thisjQ.keyPress(function (evt) {
            // If we're tabbed into, automatically select the correct selectable item.
            if (evt.which === keyCode.TAB) {
                // If something is already selected, re-select it. Otherwise, select the first item.
                var toSelect = context.selectedItem || context.selectables.eq(0);
                select(thisjQ, evt, toSelect);
            }
        });
    };
    
    $.fn.arrowKeys = function (options) {
        // Merge defaults with the user's settings.
        options = $.extend({}, this.arrowkeys.defaults, options);
        
        // Set up a context to remember what's going on. 
        // In a real implementation, this is best implemented using jQuery.data
        this.arrowKeys.selectionContext = setupSelectionContext(this, options);
        
        addKeyHandlers(this, options);
    };
    
    $.fn.arrowKeys.defaults = {
        selectables: ".selectable",
        orientation: "vertical"
    };
    
    $.fn.activatable = function (handler, options) {
        
    };
    

    
})(jQuery);
