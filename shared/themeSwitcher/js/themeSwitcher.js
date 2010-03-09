/*global navigator, jQuery, fluid*/

var fluid = fluid || {};
fluid.mobile = fluid.mobile || {};

(function($) {
    
    var THEME_PREFIX = "fl-theme-";
    
    function swapThemeClass(dom, classSuffix) {
        var themeScope = dom.locate("themeScope");
        var classAtt = themeScope.attr("class");
        var classes = classAtt.split(" ");
        $.each(classes, function (idx, className) {
            if (className.indexOf(THEME_PREFIX) > -1) {
                themeScope.removeClass(className);
            }
        });
        
        themeScope.addClass(THEME_PREFIX + classSuffix);
    }
    
    function replaceURL(el, attr, file) {
        var url = el.attr(attr);
        var fileIdx = url.lastIndexOf("/");
        var replacedURL;
        if (fileIdx === -1) {
            replacedURL =  file;
        } else {
            var urlBase = url.substring(0, fileIdx + 1);
            replacedURL = urlBase + file;
        }
        
        el.attr(attr, replacedURL);
    }
    
    function makeLinkTag(baseURL, fileName) {
        return $("<link type=\"text/css\" rel=\"stylesheet\" href=\"" + baseURL + fileName + "\" />");
    }
    
    function updateStylesheets(dom, layoutURL, themeURL, fssURLBase) {
        var layoutTag = makeLinkTag(fssURLBase, layoutURL);
        var themeTag = makeLinkTag(fssURLBase, themeURL);
        
        var existingLayout = dom.locate("layoutStylesheet");
        if (existingLayout.length > 0) {
            replaceURL(existingLayout, "href", layoutURL)
        }
        var reset = dom.locate("resetStylesheet");
        var firstHeadItem = $("head :first");
        
        if (reset.length > 0) {
            reset.after(layoutTag);
        } else if (firstHeadItem.length > 0){
            firstHeadItem.before(layoutTag);
        } else {
            $(head).append(layoutTag);
        }
        
        var existingTheme = dom.locate("themeStylesheet");
        if (existingTheme.length > 0) {
            replaceURL(existingTheme, "href", themeURL);
        } else {
            layoutTag.after(themeTag);
        }
    }
    
    function setupThemeSwitcher(that) {
        that.setThemeForCurrentUserAgent();
    }
    
    fluid.mobile.themeSwitcher = function (options) {
        var that = fluid.initView("fluid.mobile.themeSwitcher", $(document), options);

        that.setThemeForCurrentUserAgent = function () {
            var userAgent = navigator.userAgent;
            
            for (var theme in that.options.themes) {
                if (userAgent.match(theme)) {
                    that.setTheme(theme);
                    return;
                }
            }
            
            that.setTheme(that.options.defaultTheme);
        };
        
        that.setTheme = function (name) {
            var classSuffix = name.toLowerCase();
            var themeInfo = that.options.themes[name];
            var layoutURL = that.options.layout[themeInfo.layout];
            
            updateStylesheets(that.dom, layoutURL, themeInfo.file, that.options.fssURLBase);
            swapThemeClass(that.dom, classSuffix);
        };
        
        setupThemeSwitcher(that);
		return that;
	};

	fluid.defaults("fluid.mobile.themeSwitcher", {
	    selectors: {
	        resetStylesheet: "[href$=fss-reset.css]",
	        layoutStylesheet: ".flc-themeSwitcher-layout",
	        themeStylesheet: ".flc-themeSwitcher-theme",
	        themeScope: "body"
	    },
	    
		defaultTheme: "coal",

        themes: {
            iPhone: {
                file: "fss-mobile-theme-iphone.css",
                layout: "mobile"
            },
            
            Android: {
                file: "fss-mobile-theme-android.css",
                layout: "mobile"
            },
            
            coal: {
                file: "fss-theme-coal.css",
                layout: "full"
            },
            
            mist: {
                file: "fss-theme-mist.css",
                layout: "full"
            },
            
            rust: {
                file: "fss-theme-rust.css",
                layout: "full"
            },
            
            slate: {
                file: "fss-theme-slate.css",
                layout: "full"
            },
            
            highContrast: {
                file: "fss-theme-hc.css",
                layout: "full"
            },
            
            highContrastInverted: {
                file: "fss-theme-hci.css",
                layout: "full"
            }          
        },
        
        layout: {
            mobile: "fss-mobile-layout.css",
            full: "fss-layout.css"
        },
        
        fssURLBase: "../../../fluid-infusion/src/webapp/framework/fss/css/"
	});

})(jQuery);
