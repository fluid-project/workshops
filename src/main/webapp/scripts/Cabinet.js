/*
 Copyright 2009 - 2010 University of Toronto
 
 Licensed under the Educational Community License (ECL), Version 2.0 or the New
 BSD license. You may not use this file except in compliance with one these
 Licenses.
 
 You may obtain a copy of the ECL 2.0 License and BSD License at
 https://source.fluidproject.org/svn/LICENSE.txt
 
 */
/*global jQuery, fluid*/

fluid = fluid || {};

(function ($) {
    
    /**
     * Finds the descendant of an element, as specified by the test function passed in the argument
     * 
     * @param {Object} element, the root node to test from
     * @param {Object} test, a function that takes an element and returns true when the correct child is found
     */
    var findChild = function (element, test) {
        element = fluid.unwrap(element);
        var childNodes = element.childNodes;
        
        for (var i = 0; i < childNodes.length; i++) {
            if (test(childNodes[i])) {
                return childNodes[i];
            }
        }
    };
    
    /**
     * Adds the various aria properties
     * 
     * @param {Object} that, the component
     */
    var addAria = function (that) {
        that.container.attr({
            role: "tablist",
            "aria-multiselectable": "true"
        });
        
        that.locate("drawer").attr({
            role: "tab",
            "aria-expanded": "false"
        });
    };
    
    /**
     * Adds the various css classes used by the component
     * 
     * @param {Object} that, the component
     */
    var addCSS = function (that) {
        that.locate("drawer").not(that.shelves || "").addClass(that.options.styles.drawer);
        that.locate("contents").addClass(that.options.styles.contents);
        that.locate("handle").addClass(that.options.styles.handle);
        if (that.shelves) {
            that.shelves.addClass(that.options.styles.shelf);
        }
    };
    
    /**
     * Toggle's the visibility of the contents of the drawer. It finds the contents which
     * are the children of the drawer that was open/closed and sets toggles the visibility
     * 
     * @param {Object} that, the component
     * @param {Object} selector, a selector representing the drawers that were opened/closed
     */
    var toggleVisibility = function (that, selector) {
        selector = fluid.wrap(selector);
        selector.each(function (index, element) {
            var contents = findChild(element, function (element) {
                return $(element).is(that.options.selectors.contents);
            });
            
            if (contents) {
                $(contents).toggle();
            }
        });
    };
    
    /**
     * A general function to adjust the position of the drawer (open or closed)
     * 
     * @param {Object} that, the component
     * @param {Object} selector, a selector representing the set of drawers
     * @param {Object} addedStyleName, the style to be added
     * @param {Object} removedStyleName, the style to be removed
     * @param {Object} ariaString, the string to be added to the "aria-expanded" attribute
     * @param {Object} eventName, the name of the event to fire.
     */
    var drawerAdjust = function (that, selector, addedStyleName, removedStyleName, ariaString, eventName) {
        selector = fluid.wrap(selector);
        selector.addClass(that.options.styles[addedStyleName]);
        selector.removeClass(that.options.styles[removedStyleName]);
        selector.attr("aria-expanded", ariaString);
        toggleVisibility(that, selector);

        if (eventName) {
            that.events[eventName].fire(selector);
        }
    };
    
    /**
     * Causes the drawers to appear open
     * 
     * @param {Object} that, the component
     * @param {Object} selector, a selector representing the set of drawers to open
     * @param {Object} stopEvent, a boolean value indicating if an event should be fired.
     */
    var open = function (that, selector, stopEvent) {
        drawerAdjust(that, selector, "drawerOpened", "drawerClosed", "true", stopEvent ? null : "afterOpen");
    };
    
    /**
     * Causes the drawers to apper closed, won't close a drawer that doesn't have a handle
     * 
     * @param {Object} that, the component
     * @param {Object} selector, a selector representing the set of drawers to close
     * @param {Object} stopEvent, a boolean value indicating if an event should be fired.
     */
    var close = function (that, selector, stopEvent) {
        selector = that.shelves ? fluid.wrap(selector).not(that.shelves) : selector;
        drawerAdjust(that, selector, "drawerClosed", "drawerOpened", "false", stopEvent ? null : "afterClose");
    };
    
    /**
     * Opens/Closes the specified drawers, and fires the appropriate events.
     * 
     * @param {Object} that, the component
     * @param {Object} openState, a boolean representing the open state of the drawer. True === open.
     * @param {Object} selector, a selector representing the drawers to open/close
     * @param {Object} stopEvent, a boolean used to prevent the event from firing. 
     */
    var moveDrawers = function (that, moveFunc, selector, stopEvent) {
        moveFunc(that, selector, stopEvent);
    };
    
    /**
     * Finds the drawer for a given handle
     * 
     * @param {Object} that, the component
     * @param {Object} element, a handle
     */
    var findHandleBase = function (that, element) {
        return $(fluid.findAncestor(element, function (el) {
            return $(el).is(that.options.selectors.drawer);
        }));
    };
    
    /**
     * Adds a click event to each handle for opening/closing the drawer
     * 
     * @param {Object} that, the component
     */
    var addClickEvent = function (that) {
        that.locate("handle").click(function () {
            that.toggleDrawers(findHandleBase(that, this));
        });
    };
    
    /**
     * Adds keyboard a11y to the handles
     * 
     * @param {Object} that, the component
     */
    var addKeyNav = function (that) {        
        that.container.attr("tabindex", 0);
        that.container.fluid("selectable", {
            selectableSelector: that.options.selectors.handle
        });
        that.locate("handle").fluid("activatable", function (evt) {
            that.toggleDrawers(findHandleBase(that, evt.target));
        });
    };
    
    /**
     * Finds the set of drawers that don't have handles and creates a jquery object called that.shelves with them.
     * 
     * @param {Object} that, the component
     */
    var findShelves = function (that) {
        var shelvesList;
        that.locate("drawer").each(function () {
            var drawer = $(this);
            if (drawer.find(that.options.selectors.handle).length === 0) {
                shelvesList = shelvesList ? shelvesList.add(drawer) : drawer;
            }
        });
        that.shelves = shelvesList;
    };
    
    /**
     * Calls the various setup functions
     * 
     * @param {Object} that, the component
     */
    var setup = function (that) {
        findShelves(that);
        addAria(that);
        addCSS(that);
        moveDrawers(that, that.options.startOpen ? open : close, that.locate("drawer"), that.options.preventEventFireOnInit);
        if (that.options.startOpen) {
            that.openDrawers(that.locate("openByDefault"));
        }
        addClickEvent(that);
        
        // Only add keyboard navigation if we've got the keyboard-a11y available to us.
        if (fluid.a11y) {
            addKeyNav(that);
        }
    };
    
    /**
     * The creator function for the component
     * 
     * @param {Object} container, the components container
     * @param {Object} options, the integrator specified options.
     */
    fluid.cabinet = function (container, options) {
        var that = fluid.initView("fluid.cabinet", container, options);
        
        /**
         * Toggles the open state of the drawer. 
         * 
         * @param {Object} drawer, the drawers to open/close
         */
        that.toggleDrawers = function (drawer) {
            drawer = fluid.wrap(drawer);
            drawer.each(function (index, element) {
                var elm = $(element);
                
                if (elm.hasClass(that.options.styles.drawerClosed)) {
                    that.openDrawers(elm);
                } else if (elm.hasClass(that.options.styles.drawerOpened)) {
                    that.closeDrawers(elm);
                }
            });
        };
        
        /**
         * Opens all specified drawers
         * 
         * @param {Object} selector, the set of drawers to open
         */
        that.openDrawers = function (selector) {
            moveDrawers(that, open, selector);
        };
        
        /**
         * Closes all specified drawers
         * 
         * @param {Object} selector, the set of drawers to close
         */
        that.closeDrawers = function (selector) {
            moveDrawers(that, close, selector);
        };
        
        setup(that);
        
        return that;
    };
    
    fluid.defaults("fluid.cabinet", {
        selectors: {
            drawer: ".flc-cabinet-drawer",
            handle: ".flc-cabinet-handle", 
            header: ".flc-cabinet-header",
            headerDescription: ".flc-cabinet-headerDescription",
            contents: ".flc-cabinet-contents",
            openByDefault: ""
        },
        
        styles: {
            drawerClosed: "fl-cabinet-drawerClosed",
            drawerOpened: "fl-cabinet-drawerOpened",            
            drawer: "fl-container fl-container-autoHeading fl-cabinet-animation fl-container-collapsable",
            shelf: "fl-container",
            contents: "fl-cabinet-contents",
            handle: "fl-cabinet-handle"
        },
        
        events: {
            afterOpen: null,
            afterClose: null
        },
        
        startOpen: false,
        
        preventEventFireOnInit: true
    });
    
})(jQuery);
