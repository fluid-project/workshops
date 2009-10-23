/*
 Copyright 2008-2009 University of Toronto
 
 Licensed under the Educational Community License (ECL), Version 2.0 or the New
 BSD license. You may not use this file except in compliance with one these
 Licenses.
 
 You may obtain a copy of the ECL 2.0 License and BSD License at
 https://source.fluidproject.org/svn/LICENSE.txt
 
 */
/*global jQuery, fluid*/

fluid = fluid || {};
var fliquor = fliquor || {};

(function ($) {
    
	var ajaxCall = function (url, success, error) {
	    $.ajax({
            url: url,
            dataType: "json",
            success: success,
            error: error
	    });
	};
    
    var storeTemplate = function (that) {
        that.template = that.locate("template").clone();
    };
    
    var clearTemplate = function (that) {
        that.locate("templateContainer").html("");
    };
    
    var mapData = function (that, data) {
        if(data.stat === "ok") {
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
    
    var renderData = function (that, data) {
        clearTemplate(that);
        $.each(data, function (index, object) {
            var templateClone = that.template.clone();
            templateClone.find("a").attr({href: object.flickrPage});
            templateClone.find("img").attr({src: object.imageSource, title: object.imageTitle, alt: object.imageTitle});
            templateClone.find(that.options.selectors.templateTitle).text(object.imageTitle);
            that.locate("templateContainer").append(templateClone);
        });
        that.events.afterRender.fire(that, data);
    };
    
    var swapClasses = function (oldClass, newClass, element) {
        element.removeClass(oldClass);
        element.addClass(newClass);
    };
    
    var dataFetchComplete = function (that) {
        var searchStyle = that.options.styles.searching;
        var displayStyle = that.options.styles.displayResults;
        
        var displayData = function (data) {
            var mappedData = mapData(that, data);
            renderData(that, mappedData);
            swapClasses(searchStyle, displayStyle, that.container);
        };
        
        that.events.afterImagesReturnedFromFlickr.addListener(displayData);
    };
    
    var activateSearch = function (that) {
        var oldStyle = that.options.styles.displayResults;
        var newStyle = that.options.styles.searching;
        
        var search = function () {
            swapClasses(oldStyle, newStyle, that.container);
            that.getFromFlickr(that.locate("searchBox").val());
        };
        
        that.locate("searchButton").click(search);
        that.locate("searchBox").fluid("activatable", search);
    };
    
    var bindEvents = function (that) {
        dataFetchComplete(that);
        activateSearch(that);
    };
    
    var setup = function (that) {
        bindEvents(that);
        storeTemplate(that);
    };
    
    /**
     * The component's creator function 
     * 
     * @param {Object} container, the container which will hold the component
     * @param {Object} options, options passed into the component
     */
    fliquor.imageViewer = function (container, options) {
        var that = fluid.initView("fliquor.imageViewer", container, options);
        
        that.getFromFlickr = function (query) {
            var url = String(window.location).replace(".html", ".json") + "?" + query;
            url = url.replace("#", "");
            ajaxCall(url, that.events.afterImagesReturnedFromFlickr.fire, that.events.imageFetchError);
        };
        
        setup(that);
        
        return that;
    };
    
    fluid.defaults("fliquor.imageViewer", {
        
        selectors: {
            searchButton: ".flc-fliquor-searchButton",
            searchBox: ".flc-fliquor-search", 
            template: ".flc-fliquor-template",
            templateContainer: ".flc-fliquor-templateContainer",
            templateTitle: ".title"
        },
        
        styles: {
            searching: "searching",
            displayResults: "rendering"
        },
        
        strings: {
            imageURL: "http://farm%farm.static.flickr.com/%server/%id_%secret_t.jpg",
            userPage: "http://www.flickr.com/photos/%owner/%id"
        },
        
        events: {
            afterImagesReturnedFromFlickr: null,
            imageFetchError: null,
            afterRender: null
        }
    });
    
})(jQuery);