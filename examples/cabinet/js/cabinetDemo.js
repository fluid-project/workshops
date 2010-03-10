/*global fluid, alert, jQuery*/

var demo = demo || {};

(function ($) {

    var makeProtoComponents = function (that) {
        var photo = that.model.photo;
        var proto = {
            image: {target: fluid.stringTemplate(that.options.strings.imageURLTemplate, photo)},
            imageTitle: "%photo.title._content",
            imageDesc: "%photo.description._content",
            imageDate: "%photo.dates.taken",
            tags: {
                children: fluid.transform(photo.tags.tag, function (tag) {
                    var name = tag.raw;
                    return {
                        tag: {
                            linktext: name,
                            target: fluid.stringTemplate(that.options.strings.tagURLTemplate, {tag: name}) 
                        }
                    };
                })
            }
        };
        return proto;
    };

    
    var setupSubcomponents = function (that) {
        fluid.initSubcomponent(that, "cab", [that.container, fluid.COMPONENT_OPTIONS]);
    };

    var getData = function (that) {
        
        var setup = function (model) {
            var messageLocator = fluid.messageLocator(that.options.strings, fluid.stringTemplate);
            that.model = model;
            that.render = fluid.engage.renderUtils.createRendererFunction(that.container, that.options.selectors, {
                repeatingSelectors: ["tags"],
                rendererOptions: {
                    messageLocator: messageLocator,
                    model: that.model
                }
            });
            that.refreshView();
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
        
        var expander = fluid.renderer.makeProtoExpander({ELstyle: "%"});
        
        that.refreshView = function () {
            var protoTree = makeProtoComponents(that);
            var tree = expander(protoTree);
            that.render(tree);
        };
        
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
