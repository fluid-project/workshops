var demo = demo || {};

(function ($) {
    
    demo.themeSwitcher = function () {
        var switcher = fluid.mobile.themeSwitcher();
        
        var themeTabs = $(".flc-themer").children().click(function (evt) {
            switcher.setTheme($(this).text());
        });
    };
    
})(jQuery);