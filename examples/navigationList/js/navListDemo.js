
var demo = demo || {};

(function ($) {
    var imageURLTemplate = "http://farm%farm.static.flickr.com/%server/%id_%secret_m.jpg";
    var userPageURLTemplate = "http://www.flickr.com/photos/%owner/%id";
    
    var jasigFlickrPhotos = {
        "photos":{
            "page":1, 
            "pages":6, 
            "perpage":25, 
            "total":"134", 
            "photo":[
                {"id":"4366552930", "owner":"29979136@N03", "secret":"30a7167c6a", "server":"2777", "farm":3, "title":"Town and Country Resort", "ispublic":1, "isfriend":0, "isfamily":0}, 
                {"id":"4365808141", "owner":"29979136@N03", "secret":"2c818b926e", "server":"4058", "farm":5, "title":"Resort Pool", "ispublic":1, "isfriend":0, "isfamily":0}, 
                {"id":"3968554707", "owner":"29979136@N03", "secret":"0eaa1446b7", "server":"3533", "farm":4, "title":"Jasig Running Club", "ispublic":1, "isfriend":0, "isfamily":0}, 
                {"id":"3962010811", "owner":"14362628@N00", "secret":"7988a16224", "server":"2670", "farm":3, "title":"Unconference Catering", "ispublic":1, "isfriend":0, "isfamily":0}, 
                {"id":"3951618266", "owner":"14362628@N00", "secret":"457cd279c7", "server":"2528", "farm":3, "title":"manchester_rss_reader", "ispublic":1, "isfriend":0, "isfamily":0}, 
                {"id":"3925669076", "owner":"22913804@N03", "secret":"d32332aa7c", "server":"3481", "farm":4, "title":"jasig ray...........", "ispublic":1, "isfriend":0, "isfamily":0}, 
                {"id":"3681284463", "owner":"42546041@N00", "secret":"9abd3eb0f9", "server":"2549", "farm":3, "title":"iHotelConferenceCenter", "ispublic":1, "isfriend":0, "isfamily":0}, 
                {"id":"3328638822", "owner":"49897782@N00", "secret":"ef91e2ce93", "server":"3312", "farm":4, "title":"JASIG Dallas Runners", "ispublic":1, "isfriend":0, "isfamily":0}, 
                {"id":"2923771148", "owner":"11732853@N00", "secret":"162844a5c0", "server":"3100", "farm":4, "title":"The JASIG Runners Club", "ispublic":1, "isfriend":0, "isfamily":0}, 
                {"id":"2805963395", "owner":"29979136@N03", "secret":"27b9e230f7", "server":"3295", "farm":4, "title":"Pyle Center", "ispublic":1, "isfriend":0, "isfamily":0}, 
                {"id":"2610485160", "owner":"49897782@N00", "secret":"bfa0824fd9", "server":"3160", "farm":4, "title":"JASIG UK", "ispublic":1, "isfriend":0, "isfamily":0}, 
                {"id":"2450946981", "owner":"14362628@N00", "secret":"baa49891c0", "server":"2243", "farm":3, "title":"Train", "ispublic":1, "isfriend":0, "isfamily":0}, 
                {"id":"2448419013", "owner":"49897782@N00", "secret":"c168c1db1c", "server":"3080", "farm":4, "title":"Opening Panel", "ispublic":1, "isfriend":0, "isfamily":0}, 
                {"id":"2449006482", "owner":"49897782@N00", "secret":"679e5e458d", "server":"2347", "farm":3, "title":"JASIG, St. Paul 2008", "ispublic":1, "isfriend":0, "isfamily":0}, 
                {"id":"2444282225", "owner":"78175333@N00", "secret":"5816d1f320", "server":"2393", "farm":3, "title":"JA-SIG St Paul 2008 - First night", "ispublic":1, "isfriend":0, "isfamily":0}, 
                {"id":"2445108406", "owner":"78175333@N00", "secret":"5d9ab32248", "server":"2410", "farm":3, "title":"JA-SIG St Paul 2008 - First night", "ispublic":1, "isfriend":0, "isfamily":0}, 
                {"id":"2444282329", "owner":"78175333@N00", "secret":"3f9c0c0218", "server":"3023", "farm":4, "title":"JA-SIG St Paul 2008 - First night", "ispublic":1, "isfriend":0, "isfamily":0}, 
                {"id":"2444282673", "owner":"78175333@N00", "secret":"c9516d6346", "server":"2403", "farm":3, "title":"JA-SIG St Paul 2008 - First night", "ispublic":1, "isfriend":0, "isfamily":0}, 
                {"id":"2445108046", "owner":"78175333@N00", "secret":"f22de92823", "server":"2234", "farm":3, "title":"JA-SIG St Paul 2008 - First night", "ispublic":1, "isfriend":0, "isfamily":0}, 
                {"id":"2444282427", "owner":"78175333@N00", "secret":"625c24c596", "server":"3152", "farm":4, "title":"JA-SIG St Paul 2008 - First night", "ispublic":1, "isfriend":0, "isfamily":0}, 
                {"id":"2444282295", "owner":"78175333@N00", "secret":"c09921fd39", "server":"3086", "farm":4, "title":"JA-SIG St Paul 2008 - First night", "ispublic":1, "isfriend":0, "isfamily":0}, 
                {"id":"2445108332", "owner":"78175333@N00", "secret":"4d0645f92c", "server":"3081", "farm":4, "title":"JA-SIG St Paul 2008 - First night", "ispublic":1, "isfriend":0, "isfamily":0}, 
                {"id":"2444282353", "owner":"78175333@N00", "secret":"b0658e087c", "server":"2203", "farm":3, "title":"JA-SIG St Paul 2008 - First night", "ispublic":1, "isfriend":0, "isfamily":0}, 
                {"id":"2421822251", "owner":"14362628@N00", "secret":"cf01fc6f2c", "server":"3046", "farm":4, "title":"100_0109", "ispublic":1, "isfriend":0, "isfamily":0}, 
                {"id":"1984857369", "owner":"23559689@N00", "secret":"b09cf4069c", "server":"2234", "farm":3, "title":"Aaron talking", "ispublic":1, "isfriend":0, "isfamily":0}
            ]
        }, 
        "stat":"ok"
    };
    
    var mapData = function (flickrData) {
        return fluid.transform(flickrData.photos.photo, function (photo) {
            return {
                image: fluid.stringTemplate(imageURLTemplate, photo),
                target: fluid.stringTemplate(userPageURLTemplate, photo),
                title: photo.title
            };
        });
    };
    
    var isGrid = false;
    var changeToggleLabel = function (toggler) {
        isGrid = !isGrid;
        if (isGrid) {
            toggler.text("List");
        } else {
            toggler.text("Grid")
        }
    };

    demo.init = function (container) {
        container = $(container);
        
        var initNavList = function () {
            var navList = fluid.navigationList(container, {
                model: mapData(jasigFlickrPhotos)
            });
            
            var toggler = $(".flc-navigationList-toggle");
            toggler.text("Grid");
            
            toggler.click(function () {
                changeToggleLabel($(this));
                navList.toggleLayout();
            });
        };
        
        var templateURL = "../../../fluid-engage-core/components/navigationList/html/NavigationList.html .flc-navigationList";
        container.load(templateURL, null, initNavList);
    };
})(jQuery);
