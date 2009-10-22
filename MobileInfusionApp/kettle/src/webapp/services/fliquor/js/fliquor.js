/*
Copyright 2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

// Declare dependencies.
/*global jQuery, fluid, fliquor*/

fluid = fluid || {};

var fliquor = fliquor || {};

(function ($) {
    
    var flickrURL = "http://api.flickr.com/services/rest/?method=flickr.photos.search&format=json&nojsoncallback=1&content_type=1&per_page=25&api_key=e65a1289edd23313ed5469f096e5196c&text=";
    
	var ajaxCall = function (url, success, error) {
	    $.ajax({
            url: url,
            dataType: "json",
            asyn: false,
            success: success,
            error: error
	    });
	};
    
	var getWithAjax = function (url, error) {
	    var data;
	    var success = function (returnedData) {
	        data = returnedData;
	    };
	    
	    ajaxCall(url, success, error);
	    
	    return data;
	};
    
    var getData = function (query, errorCallback) {
        var restURL = flickrURL + query;
        return getWithAjax(restURL, errorCallback);
    };
    
    fliquor.initDataFeed = function (config, app) {
	    var browseDataHandler = function (env) {
	        return [200, {"Content-Type": "text/plain"}, getData(env.env.QUERY_STRING)];
	    };
	
	    var acceptor = fluid.engage.makeAcceptorForResource("fliquor", "json", browseDataHandler);
	    fluid.engage.mountAcceptor(app, "demo", acceptor);
    };
    
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