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
    
	var ajaxCall = function (url, success, error) {
	    $.ajax({
            url: url,
            dataType: "json",
            success: success,
            error: error
	    });
	};
    
    var storeTemplate = function (that) {
        that.template = that.locate("template").remove();
    };
    
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
    
    var activateSearch = function (that) {
        that.locate("searchBox").fluid("activatable", that.search);
        that.locate("searchButton").click(function (evt) {
            that.search();
            return false;
        });
    };
    
    var bindEvents = function (that) {
        that.events.afterImagesReturnedFromFlickr.addListener(that.renderData);
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
            ajaxCall(url, that.events.afterImagesReturnedFromFlickr.fire, that.events.imageFetchError);
        };
        
        that.search = function () {
            that.locate("welcomeMessage").hide();
            that.locate("searchingMessage").show();
            that.getFromFlickr(that.locate("searchBox").val());
        };
        
        that.renderData = function (data) {
            var mappedData = mapData(that, data);
                
            renderData(that, mappedData);
            that.locate("searchingMessage").hide();
        };

        setup(that);
        
        return that;
    };
    
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
        
        styles: {
            
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
