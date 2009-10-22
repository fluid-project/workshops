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
        
    };
    
    var dataFetchComplete = function (that) {
        var displayData = function (data) {
            var mappedData = mapData(that, data);
            renderData(that, mappedData);
        };
        
        that.events.afterImagesReturnedFromFlickr.addListener(displayData);
    };
    
    var bindEvents = function (that) {
        dataFetchComplete(that);
    };
    
    var setup = function (that) {
        bindEvents(that);
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
            ajaxCall(url, that.events.afterImagesReturnedFromFlickr.fire, that.events.imageFetchError);
        };
        
        setup(that);
        
        return that;
    };
    
    fluid.defaults("fliquor.imageViewer", {
        
        selectors: {
        },
        
        styles: {
        },
        
        strings: {
            imageURL: "http://farm%farm.static.flickr.com/%server/%id_%secret_t.jpg",
            userPage: "http://www.flickr.com/photos/%owner/%id"
        },
        
        events: {
            afterImagesReturnedFromFlickr: null,
            imageFetchError: null
        }
    });
    
})(jQuery);