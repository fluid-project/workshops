/*
Copyright 2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

// Declare dependencies.
/*global jQuery, fluid*/

var fliquor = fliquor || {};

(function ($) {
    
    var flickrURL = "http://api.flickr.com/services/rest/" + 
                    "?method=flickr.photos.search&format=json" + 
                    "&nojsoncallback=1&content_type=1" + 
                    "&per_page=25&api_key=e65a1289edd23313ed5469f096e5196c&text=";
    
	var getWithAjax = function (url, errorCallback) {
	    var data;
	    $.ajax({
            url: url,
            dataType: "json",
            async: false,
            success: function (returnedData) {
                data = returnedData;
            },
            error: errorCallback
        });
	    
	    return data;
	};
    
    var getData = function (query, errorCallback) {
        var restURL = flickrURL + query;
        return getWithAjax(restURL, errorCallback);
    };
    
    /**
     * Creates a simple Kettle data feed that proxies data from Flickr to Fliquor's client-side code.
     * This gets around the same origin policy in all browsers.
     */
    fliquor.initDataFeed = function (config, app) {
	    var flickrProxy = fluid.engage.makeAcceptorForResource("fliquor", "json", function (env) {
            return [200, {"Content-Type": "text/plain"}, getData(env.env.QUERY_STRING)];
        });
	    fluid.engage.mountAcceptor(app, "demo", flickrProxy);
    };
    
    /**
     * Registers a Kettle markup feed that servers up the Fliquor client-side HTML.
     */
    fliquor.initMarkupFeed = function (config, app) {
        var handler = fluid.engage.mountRenderHandler({
            config: config,
            app: app,
            target: "demo/",
            source: "html/",
            sourceMountRelative: "fliquor"
        });
        
        handler.registerProducer("fliquor", function (context, env) {
            return {};
        });
    };
    
})(jQuery);