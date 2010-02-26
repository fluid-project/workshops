/*
 Copyright 2008-2009 University of Toronto
 
 Licensed under the Educational Community License (ECL), Version 2.0 or the New
 BSD license. You may not use this file except in compliance with one these
 Licenses.
 
 You may obtain a copy of the ECL 2.0 License and BSD License at
 https://source.fluidproject.org/svn/LICENSE.txt
 
 */
/*global window, jQuery, fluid*/

fluid = fluid || {};
var fliquor = fliquor || {};

(function ($) {
    
    /**
     * A wrapper for the jquery ajax function.
     * Sets the dataType to be json
     * 
     * @param {Object} url, the url to make the ajax call to
     * @param {Object} success, the function run on successful completion of the ajax call
     * @param {Object} error, the function to run if the ajax call fails.
     */
	var ajaxCall = function (url, success, error) {
	    $.ajax({
            url: url,
            dataType: "json",
            success: success,
            error: error
	    });
	};
    
    /**
     * Retrieves the template from the markup, stores it in a variable and removes it from the DOM.
     * 
     * @param {Object} that, the component
     */
    var storeTemplate = function (that) {
        that.template = that.locate("template").remove();
    };
    
    /**
     * Assembles the raw data from the ajax call into the model used by the component.
     * It makes use of the fluid string templating to assemble the urls
     * 
     * @param {Object} that, the component
     * @param {Object} data, the raw data returned from the ajax call
     */
    var mapData = function (that, data) {
        if (data.stat === "ok") {
            var photos = data.photos.photo;
            return fluid.transform(photos, function (photo) {
                return {
                    imageSource: fluid.stringTemplate(that.options.strings.imageURL, photo),
                    flickrPage: fluid.stringTemplate(that.options.strings.userPage, photo),
                    imageTitle: photo.title
                };
            });
        }
    };
    
    /**
     * Inserts the normalized data into the template and appends it to the images section of the markup
     * 
     * @param {Object} that, the component
     * @param {Object} data, the normalized data
     */
    var renderData = function (that, data) {
        that.locate("images").empty();
        $.each(data, function (index, object) {
            var renderedThumb = that.template.clone();
            that.locate("thumbnailLink", renderedThumb).attr("href", object.flickrPage);
            that.locate("thumbnailImage", renderedThumb).attr({
                src: object.imageSource, 
                title: object.imageTitle, 
                alt: object.imageTitle
            });
            that.locate("thumbnailTitle", renderedThumb).text(object.imageTitle);
            that.locate("images").append(renderedThumb);
        });
        that.events.afterRender.fire(that, data);
    };
    
    /**
     * Adds a click event to the search button and makes the search field keyboard activatable
     * 
     * @param {Object} that, the component
     */
    var activateSearch = function (that) {
        that.locate("searchBox").fluid("activatable", that.search);
        that.locate("searchButton").click(function (evt) {
            that.search();
            return false;
        });
    };
    
    /**
     * Binds the events and listeners that are used in fliquor
     * 
     * @param {Object} that, the component
     */
    var bindEvents = function (that) {
        that.events.afterImagesReturnedFromFlickr.addListener(that.renderData);
        activateSearch(that);
    };
    
    var addAria = function (that) {
        that.locate("searchButton").attr("role", "button");
    };
    
    /**
     * calls the various functions that need to be run when the app starts.
     * 
     * @param {Object} that, the component
     */
    var setup = function (that) {
        bindEvents(that);
        storeTemplate(that);
        addAria(that);
    };
    
    /**
     * The component's creator function 
     * 
     * @param {Object} container, the container which will hold the component
     * @param {Object} options, options passed into the component
     */
    fliquor.imageViewer = function (container, options) {
        var that = fluid.initView("fliquor.imageViewer", container, options);
        
        /**
         * Makes an ajax call to the server, passing along the search query to send to flickr
         * Returns the raw data and passes it along via the firing of the afterImagesReturnedFromFlickr event
         * 
         * @param {Object} query, the image search to run on flickr
         */
        that.getFromFlickr = function (query) {
            var url = that.options.url + "?searchTerm=" + query;
            ajaxCall(url, that.events.afterImagesReturnedFromFlickr.fire, that.events.imageFetchError);
        };
        
        /**
         * Peforms a search.
         * It takes the value entered into the search field, and passes it along as the query to flickr
         * 
         * Additionally, it will hide the welcome message, display the searching message.
         */
        that.search = function () {
            that.locate("welcomeMessage").hide();
            that.locate("searchingMessage").show();
            that.getFromFlickr(that.locate("searchBox").val());
        };
        
        /**
         * Displays data the data that is returned from flickr
         * 
         * Additionally it will hide the searching message after rendering.
         * 
         * @param {Object} data, the raw data returned from flickr
         */
        that.renderData = function (data) {
            var mappedData = mapData(that, data);
                
            renderData(that, mappedData);
            that.locate("searchingMessage").hide();
        };

        setup(that);
        
        return that;
    };
    
    /**
     * Register all the component's defaults with the framework.
     * When Fliquor is instantiated, a DOM Binder will automatically be created and bound to the selectors
     * specified in the options. Events will also be automatically created for you.
     */
    fluid.defaults("fliquor.imageViewer", {
        selectors: {
            searchButton: ".flc-fliquor-searchButton",
            searchBox: ".flc-fliquor-search", 
            template: ".flc-fliquor-template",
            images: ".flc-fliquor-images",
            welcomeMessage: ".flc-fliquor-welcomeMessage",
            searchingMessage: ".flc-fliquor-searchingMessage",
            
            // Relative to the thumbnail item.
            thumbnailLink: "a",
            thumbnailImage: "img",
            thumbnailTitle: ".flc-fliquor-item-title"
        },
        
        strings: {
            imageURL: "http://farm%farm.static.flickr.com/%server/%id_%secret_m.jpg",
            userPage: "http://www.flickr.com/photos/%owner/%id"
        },
        
        events: {
            afterImagesReturnedFromFlickr: null,
            imageFetchError: null,
            afterRender: null
        },
        
        url: null
    });
    
})(jQuery);
