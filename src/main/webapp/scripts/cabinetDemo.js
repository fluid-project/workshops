/*global fluid, alert, jQuery*/

var demo = demo || {};

(function ($) {

    var render = function (that) {
        var sel = that.options.selectors;
        var str = that.options.strings;
        var pmod = that.model.photo;
        var selectorMap = [
            {id: "image", selector: sel.image},
            {id: "imageTitle", selector: sel.imageTitle},
            {id: "imageDesc", selector: sel.imageDesc},
            {id: "imageDate", selector: sel.imageDate},
            {id: "tags:", selector: sel.tags},
            {id: "tag", selector: sel.tag}
        ];
        
        var generateTree = function () {
            var tree = {
                children: [
                    {
                        ID: "imageTitle",
                        value: pmod.title._content
                    },
                    {
                        ID: "imageDesc",
                        value: pmod.description._content
                    },
                    {
                        ID: "imageDate",
                        value: pmod.dates.taken
                    },
                    {
                        ID: "image",
                        target: fluid.stringTemplate(that.options.strings.imageURLTemplate, pmod)
                    }
                ]
            };
            
            var repeated = fluid.transform(pmod.tags.tag, function (tag) {
                var name = tag.raw;
                console.log(name);
                return {
                    ID: "tags:",
                    children: [{
                        ID: "tag",
                        linktext: name,
                        target: fluid.stringTemplate(str.tagURLTemplate, {tag: name})
                    }]
                };
            });
            
            tree.children = tree.children.concat(repeated);
            
            return tree;
        };
        
        var options = {
            cutpoints: selectorMap
        };
        
        return fluid.selfRender(that.container, generateTree(), options);
    };
    
    var setupSubcomponents = function (that) {
        fluid.initSubcomponent(that, "cab", [that.container, fluid.COMPONENT_OPTIONS]);
    };

    var getData = function (that) {
        
        var setup = function (model) {
            that.model = model;
            render(that);
            setupSubcomponents(that);
        };
        
        var opts = that.options;
        $.ajax({
            url: opts.model.dataFeedURL,
            dataType: "json",
            data: {id: opts.model.photoID},
            success: setup,
            error: function (xhr, textstatus, error) {
                alert("The Following error was thrown: \n" + error);
            }
        });
    };
    
    demo.initCabinetView = function (container, options) {
        var that = fluid.initView("demo.initCabinetView", container, options);
        
        getData(that);
        
        return that;
    };
    
    fluid.defaults("demo.initCabinetView", {
        cab: {
            type: "fluid.cabinet"
        },
        
        selectors: {
            image: ".dc-image",
            imageTitle: ".dc-title-text",
            imageDesc: ".dc-desc-text",
            imageDate: ".dc-date-text",
            tags: ".dc-link-container",
            tag: ".dc-link"
        },
        
        strings: {
            imageURLTemplate: "http://farm%farm.static.flickr.com/%server/%id_%secret.jpg",
            tagURLTemplate: "http://www.flickr.com/photos/tags/%tag/"
        },
        
        model: {
            photoID: "",
            dataFeedURL: "../data/samplePhotoInfo.json"
        }
    });
})(jQuery);
