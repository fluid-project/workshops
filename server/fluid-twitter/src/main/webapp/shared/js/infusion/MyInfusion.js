/*
 * jQuery delegate plug-in v1.0
 *
 * Copyright (c) 2007 Jörn Zaefferer
 *
 * $Id: jquery.delegate.js 7175 2009-05-15 16:59:09Z antranig@caret.cam.ac.uk $
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 */

// provides cross-browser focusin and focusout events
// IE has native support, in other browsers, use event caputuring (neither bubbles)

// provides delegate(type: String, delegate: Selector, handler: Callback) plugin for easier event delegation
// handler is only called when $(event.target).is(delegate), in the scope of the jQuery-object for event.target 

// provides triggerEvent(type: String, target: Element) to trigger delegated events
;(function($) {
	$.each({
		focus: 'focusin',
		blur: 'focusout'	
	}, function( original, fix ){
		$.event.special[fix] = {
			setup:function() {
				if ( $.browser.msie ) return false;
				this.addEventListener( original, $.event.special[fix].handler, true );
			},
			teardown:function() {
				if ( $.browser.msie ) return false;
				this.removeEventListener( original,
				$.event.special[fix].handler, true );
			},
			handler: function(e) {
				arguments[0] = $.event.fix(e);
				arguments[0].type = fix;
				return $.event.handle.apply(this, arguments);
			}
		};
	});

	$.extend($.fn, {
		delegate: function(type, delegate, handler) {
			return this.bind(type, function(event) {
				var target = $(event.target);
				if (target.is(delegate)) {
					return handler.apply(target, arguments);
				}
			});
		},
		triggerEvent: function(type, target) {
			return this.triggerHandler(type, [jQuery.event.fix({ type: type, target: target })]);
		}
	})
})(jQuery);
/*
Copyright 2007-2009 University of Cambridge
Copyright 2007-2009 University of Toronto
Copyright 2007-2009 University of California, Berkeley

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

// Declare dependencies.
/*global jQuery, YAHOO, opera*/

var fluid_1_2 = fluid_1_2 || {};
var fluid = fluid || fluid_1_2;

(function ($, fluid) {
    
    fluid.version = "Infusion 1.2";
    
    fluid.environment = {
        fluid: fluid
    };
    
    /**
     * Causes an error message to be logged to the console and a real runtime error to be thrown.
     * 
     * @param {String|Error} message the error message to log
     */
    fluid.fail = function (message) {
        fluid.setLogging(true);
        fluid.log(message.message? message.message : message);
        //throw new Error(message);
        message.fail(); // Intentionally cause a browser error by invoking a nonexistent function.
    };
    
    /**
     * Wraps an object in a jQuery if it isn't already one. This function is useful since
     * it ensures to wrap a null or otherwise falsy argument to itself, rather than the
     * often unhelpful jQuery default of returning the overall document node.
     * 
     * @param {Object} obj the object to wrap in a jQuery
     */
    fluid.wrap = function (obj) {
        return ((!obj || obj.jquery) ? obj : $(obj)); 
    };
    
    /**
     * If obj is a jQuery, this function will return the first DOM element within it.
     * 
     * @param {jQuery} obj the jQuery instance to unwrap into a pure DOM element
     */
    fluid.unwrap = function (obj) {
        return obj && obj.jquery && obj.length === 1 ? obj[0] : obj; // Unwrap the element if it's a jQuery.
    };
    
    /** 
     * Searches through the supplied object for the first value which matches the one supplied.
     * @param obj {Object} the Object to be searched through
     * @param value {Object} the value to be found. This will be compared against the object's
     * member using === equality.
     * @return {String} The first key whose value matches the one supplied, or <code>null</code> if no
     * such key is found.
     */
    fluid.keyForValue = function (obj, value) {
        for (var key in obj) {
            if (obj[key] === value) {
                return key;
            }
        }
        return null;
    };
    
    /**
     * This method is now deprecated and will be removed in a future release of Infusion. 
     * See fluid.keyForValue instead.
     */
    fluid.findKeyInObject = fluid.keyForValue;
    
    /** 
     * Clears an object or array of its contents. For objects, each property is deleted.
     * 
     * @param {Object|Array} target the target to be cleared
     */
    fluid.clear = function (target) {
        if (target instanceof Array) {
            target.length = 0;
        }
        else {
            for (var i in target) {
                delete target[i];
            }
        }
    };
    
    /** A basic utility that returns its argument unchanged */
    
    fluid.identity = function(arg) {
        return arg;
    }
    
    // Framework and instantiation functions.
    
    /**
     * Fetches a single container element and returns it as a jQuery.
     * 
     * @param {String||jQuery||element} an id string, a single-element jQuery, or a DOM element specifying a unique container
     * @return a single-element jQuery of container
     */
    fluid.container = function (containerSpec) {
        var container = containerSpec;
        if (typeof containerSpec === "string" || 
          containerSpec.nodeType && (containerSpec.nodeType === 1  || containerSpec.nodeType === 9)) {
            container = $(containerSpec);
        }
        
        // Throw an exception if we've got more or less than one element.
        if (!container || !container.jquery || container.length !== 1) {
            if (typeof(containerSpec) !== "string") {
                containerSpec = container.selector;
            }
            fluid.fail({
                name: "NotOne",
                message: "A single container element was not found for selector " + containerSpec
            });
        }
        
        return container;
    };
    
    // stubs for two functions in FluidDebugging.js
    fluid.dumpEl = fluid.identity;
    fluid.renderTimestamp = fluid.identity;
    
    /**
     * Retreives and stores a component's default settings centrally.
     * @param {boolean} (options) if true, manipulate a global option (for the head
     *   component) rather than instance options.
     * @param {String} componentName the name of the component
     * @param {Object} (optional) an container of key/value pairs to set
     * 
     */
    var defaultsStore = {};
    var globalDefaultsStore = {};
    fluid.defaults = function () {
        var offset = 0;
        var store = defaultsStore;
        if (typeof arguments[0] === "boolean") {
            store = globalDefaultsStore;
            offset = 1;
        }
        var componentName = arguments[offset];
        var defaultsObject = arguments[offset + 1];
        if (defaultsObject !== undefined) {
            store[componentName] = defaultsObject;   
            return defaultsObject;
        }
        
        return store[componentName];
    };
    
    /**
     * Creates a new DOM Binder instance, used to locate elements in the DOM by name.
     * 
     * @param {Object} container the root element in which to locate named elements
     * @param {Object} selectors a collection of named jQuery selectors
     */
    fluid.createDomBinder = function (container, selectors) {
        var cache = {}, that = {};
        
        function cacheKey(name, thisContainer) {
            return $.data(fluid.unwrap(thisContainer)) + "-" + name;
        }

        function record(name, thisContainer, result) {
            cache[cacheKey(name, thisContainer)] = result;
        }

        that.locate = function (name, localContainer) {
            var selector, thisContainer, togo;
            
            selector = selectors[name];
            thisContainer = localContainer? localContainer: container;
            if (!thisContainer) {
                fluid.fail("DOM binder invoked for selector " + name + " without container");
            }

            if (!selector) {
                return thisContainer;
            }

            if (typeof(selector) === "function") {
                togo = $(selector.call(null, fluid.unwrap(thisContainer)));
            } else {
                togo = $(selector, thisContainer);
            }
            if (togo.get(0) === document) {
                togo = [];
                //fluid.fail("Selector " + name + " with value " + selectors[name] +
                //            " did not find any elements with container " + fluid.dumpEl(container));
            }
            if (!togo.selector) {
                togo.selector = selector;
                togo.context = thisContainer;
            }
            togo.selectorName = name;
            record(name, thisContainer, togo);
            return togo;
        };
        that.fastLocate = function (name, localContainer) {
            var thisContainer = localContainer? localContainer: container;
            var key = cacheKey(name, thisContainer);
            var togo = cache[key];
            return togo? togo : that.locate(name, localContainer);
        };
        that.clear = function () {
            cache = {};
        };
        that.refresh = function (names, localContainer) {
            var thisContainer = localContainer? localContainer: container;
            if (typeof names === "string") {
                names = [names];
            }
            if (thisContainer.length === undefined) {
                thisContainer = [thisContainer];
            }
            for (var i = 0; i < names.length; ++ i) {
                for (var j = 0; j < thisContainer.length; ++ j) {
                    that.locate(names[i], thisContainer[j]);
                }
            }
        };
        
        return that;
    };
    
    /** Determines whether the supplied object can be treated as an array, by 
     * iterating an index towards its length. The test functions by detecting
     * a property named "length" which is of type "number", but excluding objects
     * which are themselves of type "string".
     */
    fluid.isArrayable = function(totest) {
        return typeof(totest) !== "string" && typeof(totest.length) === "number";
    }
    
    /**
     * Attaches the user's listeners to a set of events.
     * 
     * @param {Object} events a collection of named event firers
     * @param {Object} listeners optional listeners to add
     */
    fluid.mergeListeners = function (events, listeners) {
        if (listeners) {
            for (var key in listeners) {
                var value = listeners[key];
                var keydot = key.indexOf(".");
                var namespace;
                if (keydot !== -1) {
                    namespace = key.substring(keydot + 1);
                    key = key.substring(0, keydot);
                }
                if (!events[key]) {
                    events[key] = fluid.event.getEventFirer();
                }   
                var firer = events[key];
                if (typeof(value) === "function") {
                    firer.addListener(value, namespace);
                }
                else if (value && fluid.isArrayable(value)) {
                    for (var i = 0; i < value.length; ++ i) {
                        firer.addListener(value[i], namespace);
                    }
                }
            }
        }    
    };
    
    /**
     * Sets up a component's declared events.
     * Events are specified in the options object by name. There are three different types of events that can be
     * specified: 
     * 1. an ordinary multicast event, specified by "null. 
     * 2. a unicast event, which allows only one listener to be registered
     * 3. a preventable event
     * 
     * @param {Object} that the component
     * @param {Object} options the component's options structure, containing the declared event names and types
     */
    fluid.instantiateFirers = function (that, options) {
        that.events = {};
        if (options.events) {
            for (var event in options.events) {
                var eventType = options.events[event];
                that.events[event] = fluid.event.getEventFirer(eventType === "unicast", eventType === "preventable");
            }
        }
        fluid.mergeListeners(that.events, options.listeners);
    };
    
    /**
     * Merges the component's declared defaults, as obtained from fluid.defaults(),
     * with the user's specified overrides.
     * 
     * @param {Object} that the instance to attach the options to
     * @param {String} componentName the unique "name" of the component, which will be used
     * to fetch the default options from store. By recommendation, this should be the global
     * name of the component's creator function.
     * @param {Object} userOptions the user-specified configuration options for this component
     */
    fluid.mergeComponentOptions = function (that, componentName, userOptions) {
        var defaults = fluid.defaults(componentName); 
        that.options = fluid.merge(defaults? defaults.mergePolicy: null, {}, defaults, userOptions);    
    };
    
    
    /** Expect that an output from the DOM binder has resulted in a non-empty set of 
     * results. If none are found, this function will fail with a diagnostic message, 
     * with the supplied message prepended.
     */
    fluid.expectFilledSelector = function (result, message) {
        if (result && result.length === 0 && result.jquery) {
            fluid.fail(message + ": selector \"" + result.selector + "\" with name " + result.selectorName +
                       " returned no results in context " + fluid.dumpEl(result.context));
        }
    };
    
    /** 
     * The central initialiation method called as the first act of every Fluid
     * component. This function automatically merges user options with defaults,
     * attaches a DOM Binder to the instance, and configures events.
     * 
     * @param {String} componentName The unique "name" of the component, which will be used
     * to fetch the default options from store. By recommendation, this should be the global
     * name of the component's creator function.
     * @param {jQueryable} container A specifier for the single root "container node" in the
     * DOM which will house all the markup for this component.
     * @param {Object} userOptions The configuration options for this component.
     */
    fluid.initView = function (componentName, container, userOptions) {
        var that = {};
        fluid.expectFilledSelector(container, "Error instantiating component with name \"" + componentName); 
        fluid.mergeComponentOptions(that, componentName, userOptions);
        
        if (container) {
            that.container = fluid.container(container);
            fluid.initDomBinder(that);
        }
        fluid.instantiateFirers(that, that.options);

        return that;
    };
    
    /** A special "marker object" which is recognised as one of the arguments to 
     * fluid.initSubcomponents. This object is recognised by reference equality - 
     * where it is found, it is replaced in the actual argument position supplied
     * to the specific subcomponent instance, with the particular options block
     * for that instance attached to the overall "that" object.
     */
    fluid.COMPONENT_OPTIONS = {};
    
    /** Another special "marker object" representing that a distinguished 
     * (probably context-dependent) value should be substituted.
     */
    fluid.VALUE = {};
    
    /** Construct a dummy or "placeholder" subcomponent, that optionally provides empty
     * implementations for a set of methods.
     */
    fluid.emptySubcomponent = function (options) {
        var that = {};
        options = $.makeArray(options);
        for (var i = 0; i < options.length; ++ i) {
            that[options[i]] = function () {};
        }
        return that;
    };
    
    /**
     * Creates a new "little component": a that-ist object with options merged into it by the framework.
     * This method is a convenience for creating small objects that have options but don't require full
     * View-like features such as the DOM Binder or events
     * 
     * @param {Object} name the name of the little component to create
     * @param {Object} options user-supplied options to merge with the defaults
     */
    fluid.initLittleComponent = function(name, options) {
        var that = {};
        fluid.mergeComponentOptions(that, name, options);
        return that;
    };
    
    fluid.initSubcomponent = function (that, className, args) {
        return fluid.initSubcomponents(that, className, args)[0];
    };
    
    /** Initialise all the "subcomponents" which are configured to be attached to 
     * the supplied top-level component, which share a particular "class name".
     * @param {Component} that The top-level component for which sub-components are
     * to be instantiated. It contains specifications for these subcomponents in its
     * <code>options</code> structure.
     * @param {String} className The "class name" or "category" for the subcomponents to
     * be instantiated. A class name specifies an overall "function" for a class of 
     * subcomponents and represents a category which accept the same signature of
     * instantiation arguments.
     * @param {Array of Object} args The instantiation arguments to be passed to each 
     * constructed subcomponent. These will typically be members derived from the
     * top-level <code>that</code> or perhaps globally discovered from elsewhere. One
     * of these arguments may be <code>fluid.COMPONENT_OPTIONS</code> in which case this
     * placeholder argument will be replaced by instance-specific options configured
     * into the member of the top-level <code>options</code> structure named for the
     * <code>className</code>
     * @return {Array of Object} The instantiated subcomponents, one for each member
     * of <code>that.options[className]</code>.
     */
    
    fluid.initSubcomponents = function (that, className, args) {
        var entry = that.options[className];
        if (!entry) {
            return;
        }
        var entries = $.makeArray(entry);
        var optindex = -1;
        var togo = [];
        args = $.makeArray(args);
        for (var i = 0; i < args.length; ++ i) {
            if (args[i] === fluid.COMPONENT_OPTIONS) {
                optindex = i;
            }
        }
        for (i = 0; i < entries.length; ++ i) {
            entry = entries[i];
            if (optindex !== -1 && entry.options) {
                args[optindex] = entry.options;
            }
            if (typeof(entry) !== "function") {
                var entryType = typeof(entry) === "string"? entry : entry.type;
                var globDef = fluid.defaults(true, entryType);
                fluid.merge("reverse", that.options, globDef);
                togo[i] = entryType === "fluid.emptySubcomponent"?
                   fluid.emptySubcomponent(entry.options) : 
                   fluid.invokeGlobalFunction(entryType, args, {fluid: fluid});
            }
            else {
                togo[i] = entry.apply(null, args);
            }

            var returnedOptions = togo[i]? togo[i].returnedOptions : null;
            if (returnedOptions) {
                fluid.merge(that.options.mergePolicy, that.options, returnedOptions);
                if (returnedOptions.listeners) {
                    fluid.mergeListeners(that.events, returnedOptions.listeners);
                }
            }
        }
        return togo;
    };
    
    /**
     * Creates a new DOM Binder instance for the specified component and mixes it in.
     * 
     * @param {Object} that the component instance to attach the new DOM Binder to
     */
    fluid.initDomBinder = function (that) {
        that.dom = fluid.createDomBinder(that.container, that.options.selectors);
        that.locate = that.dom.locate;      
    };
    
    
    /** Returns true if the argument is a primitive type **/
    fluid.isPrimitive = function (value) {
        var valueType = typeof(value);
        return !value || valueType === "string" || valueType === "boolean" || valueType === "number" || valueType === "function";
    };
        
    function mergeImpl(policy, basePath, target, source) {
        var thisPolicy = policy && typeof(policy) !== "string"? policy[basePath] : policy;
        if (typeof(thisPolicy) === "function") {
            thisPolicy.apply(null, target, source);
            return target;
        }
        if (thisPolicy === "replace") {
            fluid.clear(target);
        }
      
        for (var name in source) {
            var path = (basePath? basePath + ".": "") + name;
            var thisTarget = target[name];
            var thisSource = source[name];
            var primitiveTarget = fluid.isPrimitive(thisTarget);
    
            if (thisSource !== undefined) {
                if (thisSource !== null && typeof thisSource === 'object' &&
                      !thisSource.nodeType && !thisSource.jquery && thisSource !== fluid.VALUE) {
                    if (primitiveTarget) {
                        target[name] = thisTarget = thisSource instanceof Array? [] : {};
                    }
                    mergeImpl(policy, path, thisTarget, thisSource);
                }
                else {
                    if (thisTarget === null || thisTarget === undefined || thisPolicy !== "reverse") {
                        target[name] = thisSource;
                    }
                }
            }
        }
        return target;
    }
    
    /** Merge a collection of options structures onto a target, following an optional policy.
     * This function is typically called automatically, as a result of an invocation of
     * <code>fluid.iniView</code>. The behaviour of this function is explained more fully on
     * the page http://wiki.fluidproject.org/display/fluid/Options+Merging+for+Fluid+Components .
     * @param policy {Object/String} A "policy object" specifiying the type of merge to be performed.
     * If policy is of type {String} it should take on the value "reverse" or "replace" representing
     * a static policy. If it is an
     * Object, it should contain a mapping of EL paths onto these String values, representing a
     * fine-grained policy. If it is an Object, the values may also themselves be EL paths 
     * representing that a default value is to be taken from that path.
     * @param target {Object} The options structure which is to be modified by receiving the merge results.
     * @param options1, options2, .... {Object} an arbitrary list of options structure which are to
     * be merged "on top of" the <code>target</code>. These will not be modified.    
     */
    
    fluid.merge = function (policy, target) {
        var path = "";
        
        for (var i = 2; i < arguments.length; ++i) {
            var source = arguments[i];
            if (source !== null && source !== undefined) {
                mergeImpl(policy, path, target, source);
            }
        }
        if (policy && typeof(policy) !== "string") {
            for (var key in policy) {
                var elrh = policy[key];
                if (typeof(elrh) === 'string' && elrh !== "replace") {
                    var oldValue = fluid.model.getBeanValue(target, key);
                    if (oldValue === null || oldValue === undefined) {
                        var value = fluid.model.getBeanValue(target, elrh);
                        fluid.model.setBeanValue(target, key, value);
                    }
                }
            }
        }
        return target;     
    };
    
    /** Return an empty container as the same type as the argument (either an
     * array or hash */
    fluid.freshContainer = function(tocopy) {
        return fluid.isArrayable(tocopy)? [] : {};   
    };
    
    /** Performs a deep copy (clone) of its argument **/
    
    fluid.copy = function (tocopy) {
        if (fluid.isPrimitive(tocopy)) {
            return tocopy;
        }
        return $.extend(true, fluid.freshContainer(tocopy), tocopy);
    };
    
    fluid.getGlobalValue = function(path, env) {
        env = env || fluid.environment;
        return fluid.model.getBeanValue(window, path, env);
    };
    
    /**
     * Allows for the calling of a function from an EL expression "functionPath", with the arguments "args", scoped to an framework version "environment".
     * @param {Object} functionPath - An EL expression
     * @param {Object} args - An array of arguments to be applied to the function, specified in functionPath
     * @param {Object} environment - (optional) The object to scope the functionPath to  (typically the framework root for version control)
     */
    fluid.invokeGlobalFunction = function (functionPath, args, environment) {
        var func = fluid.getGlobalValue(functionPath, environment);
        if (!func) {
            fluid.fail("Error invoking global function: " + functionPath + " could not be located");
        } else {
            return func.apply(null, args);
        }
    };
    
    /** Registers a new global function at a given path (currently assumes that
     * it lies within the fluid namespace)
     */
    
    fluid.registerGlobalFunction = function (functionPath, func, env) {
        env = env || fluid.environment;
        fluid.model.setBeanValue({}, functionPath, func, env);
    };
    
    // The Model Events system.
    
    fluid.event = {};
        
    var fluid_guid = 1;
    /** Construct an "event firer" object which can be used to register and deregister 
     * listeners, to which "events" can be fired. These events consist of an arbitrary
     * function signature. General documentation on the Fluid events system is at
     * http://wiki.fluidproject.org/display/fluid/The+Fluid+Event+System .
     * @param {Boolean} unicast If <code>true</code>, this is a "unicast" event which may only accept
     * a single listener.
     * @param {Boolean} preventable If <code>true</code> the return value of each handler will 
     * be checked for <code>false</code> in which case further listeners will be shortcircuited, and this
     * will be the return value of fire()
     */
    
    fluid.event.getEventFirer = function (unicast, preventable) {
        var log = fluid.log;
        var listeners = {};
        return {
            addListener: function (listener, namespace, predicate) {
                if (!listener) {
                    return;
                }
                if (unicast) {
                    namespace = "unicast";
                }
                if (!namespace) {
                    if (!listener.$$guid) {
                        listener.$$guid = fluid_guid++;
                    }
                    namespace = listener.$$guid;
                }

                listeners[namespace] = {listener: listener, predicate: predicate};
            },

            removeListener: function (listener) {
                if (typeof(listener) === 'string') {
                    delete listeners[listener];
                }
                else if (typeof(listener) === 'object' && listener.$$guid) {
                    delete listeners[listener.$$guid];
                }
            },
        
            fire: function () {
                for (var i in listeners) {
                    var lisrec = listeners[i];
                    var listener = lisrec.listener;
                    if (lisrec.predicate && !lisrec.predicate(listener, arguments)) {
                        continue;
                    }
                    try {
                        var ret = listener.apply(null, arguments);
                        if (preventable && ret === false) {
                            return false;
                        }
                    }
                    catch (e) {
                        log("FireEvent received exception " + e.message + " e " + e + " firing to listener " + i);
                        throw (e);       
                    }
                }
            }
        };
    };
    
    
    // Model functions
    
    fluid.model = {};
   
    /** Copy a source "model" onto a target **/
    fluid.model.copyModel = function (target, source) {
        fluid.clear(target);
        $.extend(true, target, source);
    };
    
    /** Parse an EL expression separated by periods (.) into its component segments.
     * @param {String} EL The EL expression to be split
     * @return {Array of String} the component path expressions.
     * TODO: This needs to be upgraded to handle (the same) escaping rules (as RSF), so that
     * path segments containing periods and backslashes etc. can be processed.
     */
    fluid.model.parseEL = function (EL) {
        return String(EL).split('.');
    };
    
    fluid.model.composePath = function (prefix, suffix) {
        return prefix === ""? suffix : prefix + "." + suffix;
    };

    fluid.model.getPenultimate = function (root, EL, environment, create) {
        var segs = fluid.model.parseEL(EL);
        for (var i = 0; i < segs.length - 1; ++i) {
            if (!root) {
                return root;
            }
            var segment = segs[i];
            if (environment && environment[segment]) {
                root = environment[segment];
                environment = null;
            }
            else {
                if (root[segment] === undefined && create) {
                    root[segment] = {};
                    }
                root = root[segment];
            }
        }
        return {root: root, last: segs[segs.length - 1]};
    };
    
    fluid.model.setBeanValue = function (root, EL, newValue, environment) {
        var pen = fluid.model.getPenultimate(root, EL, environment, true);
        pen.root[pen.last] = newValue;
    };
    
    /** Evaluates an EL expression by fetching a dot-separated list of members
     * recursively from a provided root.
     * @param root The root data structure in which the EL expression is to be evaluated
     * @param {string} EL The EL expression to be evaluated
     * @param environment An optional "environment" which, if it contains any members
     * at top level, will take priority over the root data structure.
     * @return The fetched data value.
     */
    
    fluid.model.getBeanValue = function (root, EL, environment) {
        if (EL === "" || EL === null || EL === undefined) {
            return root;
        }
        var pen = fluid.model.getPenultimate(root, EL, environment);
        return pen.root? pen.root[pen.last] : pen.root;
    };
    
    // Logging
    var logging;
    /** method to allow user to enable logging (off by default) */
    fluid.setLogging = function (enabled) {
        if (typeof enabled === "boolean") {
            logging = enabled;
        } else {
            logging = false;
        }
    };

    /** Log a message to a suitable environmental console. If the standard "console" 
     * stream is available, the message will be sent there - otherwise either the
     * YAHOO logger or the Opera "postError" stream will be used. Logging must first
     * be enabled with a call fo the fluid.setLogging(true) function.
     */
    fluid.log = function (str) {
        if (logging) {
            str = fluid.renderTimestamp(new Date()) + ":  " + str;
            if (typeof(console) !== "undefined") {
                if (console.debug) {
                    console.debug(str);
                } else {
                    console.log(str);
                }
            }
            else if (typeof(YAHOO) !== "undefined") {
                YAHOO.log(str);
            }
            else if (typeof(opera) !== "undefined") {
                opera.postError(str);
            }
        }
    };

    // DOM Utilities.
    
    /**
     * Finds the nearest ancestor of the element that passes the test
     * @param {Element} element DOM element
     * @param {Function} test A function which takes an element as a parameter and return true or false for some test
     */
    fluid.findAncestor = function (element, test) {
        element = fluid.unwrap(element);
        while (element) {
            if (test(element)) {
                return element;
            }
            element = element.parentNode;
        }
    };
    
    /**
     * Returns a jQuery object given the id of a DOM node. In the case the element
     * is not found, will return an empty list.
     */
    fluid.jById = function (id, dokkument) {
        dokkument = dokkument && dokkument.nodeType === 9? dokkument : document;
        var element = fluid.byId(id, dokkument);
        var togo = element? $(element) : [];
        togo.selector = "#" + id;
        togo.context = dokkument;
        return togo;
    };
    
    /**
     * Returns an DOM element quickly, given an id
     * 
     * @param {Object} id the id of the DOM node to find
     * @param {Document} dokkument the document in which it is to be found (if left empty, use the current document)
     * @return The DOM element with this id, or null, if none exists in the document.
     */
    fluid.byId = function (id, dokkument) {
        dokkument = dokkument && dokkument.nodeType === 9? dokkument : document;
        var el = dokkument.getElementById(id);
        if (el) {
            if (el.getAttribute("id") !== id) {
                fluid.fail("Problem in document structure - picked up element " +
                fluid.dumpEl(el) +
                " for id " +
                id +
                " without this id - most likely the element has a name which conflicts with this id");
            }
            return el;
        }
        else {
            return null;
        }
    };
    
    /**
     * Returns the id attribute from a jQuery or pure DOM element.
     * 
     * @param {jQuery||Element} element the element to return the id attribute for
     */
    fluid.getId = function (element) {
        return fluid.unwrap(element).getAttribute("id");
    };
    
    /** 
     * Allocate an id to the supplied element if it has none already, by a simple
     * scheme resulting in ids "fluid-id-nnnn" where nnnn is an increasing integer.
     */
    
    fluid.allocateSimpleId = function (element) {
        element = fluid.unwrap(element);
        if (!element.id) {
            element.id = "fluid-id-" + (fluid_guid++); 
        }
        return element.id;
    };
    
        
    // Functional programming utilities.
    
    function transformInternal(source, togo, key, args) {
        var transit = source[key];
            for (var j = 0; j < args.length - 1; ++ j) {
                transit = args[j + 1](transit, key);
            }
        togo[key] = transit; 
    }
    
    /** Return a list or hash of objects, transformed by one or more functions. Similar to
     * jQuery.map, only will accept an arbitrary list of transformation functions and also
     * works on non-arrays.
     * @param list {Array or Object} The initial container of objects to be transformed.
     * @param fn1, fn2, etc. {Function} An arbitrary number of optional further arguments,
     * all of type Function, accepting the signature (object, index), where object is the
     * list member to be transformed, and index is its list index. Each function will be
     * applied in turn to each list member, which will be replaced by the return value
     * from the function.
     * @return The finally transformed list, where each member has been replaced by the
     * original member acted on by the function or functions.
     */
    fluid.transform = function (source) {
        var togo = fluid.freshContainer(source);
        if (fluid.isArrayable(source)) {
            for (var i = 0; i < source.length; ++ i) {
                transformInternal(source, togo, i, arguments);
            }
        }
        else {
            for (var key in source) {
                transformInternal(source, togo, key, arguments);
            }
        }  
        return togo;
    };
    
    /** Scan through a list of objects, terminating on and returning the first member which
     * matches a predicate function.
     * @param list {Array} The list of objects to be searched.
     * @param fn {Function} A predicate function, acting on a list member. A predicate which
     * returns any value which is not <code>null</code> or <code>undefined</code> will terminate
     * the search. The function accepts (object, index).
     * @param deflt {Object} A value to be returned in the case no predicate function matches
     * a list member. The default will be the natural value of <code>undefined</code>
     * @return The first return value from the predicate function which is not <code>null</code>
     * or <code>undefined</code>
     */
    fluid.find = function (list, fn, deflt) {
        for (var i = 0; i < list.length; ++ i) {
            var transit = fn(list[i], i);
            if (transit !== null && transit !== undefined) {
                return transit;
            }
        }
        return deflt;
    };
    
    /** Scan through a list of objects, "accumulating" a value over them 
     * (may be a straightforward "sum" or some other chained computation).
     * @param list {Array} The list of objects to be accumulated over.
     * @param fn {Function} An "accumulation function" accepting the signature (object, total, index) where
     * object is the list member, total is the "running total" object (which is the return value from the previous function),
     * and index is the index number.
     * @param arg {Object} The initial value for the "running total" object.
     * @return {Object} the final running total object as returned from the final invocation of the function on the last list member.
     */
    fluid.accumulate = function (list, fn, arg) {
        for (var i = 0; i < list.length; ++ i) {
            arg = fn(list[i], arg, i);
        }
        return arg;
    };
    
    /** Can through a list of objects, removing those which match a predicate. Similar to
     * jQuery.grep, only acts on the list in-place by removal, rather than by creating
     * a new list by inclusion.
     * @param list {Array} The list of objects to be scanned over.
     * @param fn {Function} A predicate function determining whether an element should be
     * removed. This accepts the standard signature (object, index) and returns a "truthy"
     * result in order to determine that the supplied object should be removed from the list.
     * @return The list, transformed by the operation of removing the matched elements. The
     * supplied list is modified by this operation.
     */
    fluid.remove_if = function (list, fn) {
        for (var i = 0; i < list.length; ++ i) {
            if (fn(list[i], i)) {
                list.splice(i, 1);
                --i;
            }
        }
        return list;
    };

    
    // Other useful helpers.
    
    /**
     * Simple string template system. 
     * Takes a template string containing tokens in the form of "%value".
     * Returns a new string with the tokens replaced by the specified values.
     * Keys and values can be of any data type that can be coerced into a string. Arrays will work here as well.
     * 
     * @param {String}    template    a string (can be HTML) that contains tokens embedded into it
     * @param {object}    values        a collection of token keys and values
     */
    fluid.stringTemplate = function (template, values) {
        var newString = template;
        for (var key in values) {
            var searchStr = "%" + key;
            newString = newString.replace(searchStr, values[key]);
        }
        return newString;
    };
    
})(jQuery, fluid_1_2);
/*
Copyright 2008-2009 University of Cambridge
Copyright 2008-2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

// Declare dependencies.
/*global jQuery */

var fluid_1_2 = fluid_1_2 || {};

(function ($, fluid) {
    
    fluid.dom = fluid.dom || {};
    
    // Node walker function for iterateDom.
    var getNextNode = function (iterator) {
        if (iterator.node.firstChild) {
            iterator.node = iterator.node.firstChild;
            iterator.depth += 1;
            return iterator;
        }
        while (iterator.node) {
            if (iterator.node.nextSibling) {
                iterator.node = iterator.node.nextSibling;
                return iterator;
            }
            iterator.node = iterator.node.parentNode;
            iterator.depth -= 1;
        }
        return iterator;
    };
    
    /**
     * Walks the DOM, applying the specified acceptor function to each element.
     * There is a special case for the acceptor, allowing for quick deletion of elements and their children.
     * Return "delete" from your acceptor function if you want to delete the element in question.
     * Return "stop" to terminate iteration.
     * 
     * @param {Element} node the node to start walking from
     * @param {Function} acceptor the function to invoke with each DOM element
     * @param {Boolean} allnodes Use <code>true</code> to call acceptor on all nodes, 
     * rather than just element nodes (type 1)
     */
    fluid.dom.iterateDom = function (node, acceptor, allNodes) {
        var currentNode = {node: node, depth: 0};
        var prevNode = node;
        var condition;
        while (currentNode.node !== null && currentNode.depth >= 0 && currentNode.depth < fluid.dom.iterateDom.DOM_BAIL_DEPTH) {
            condition = null;
            if (currentNode.node.nodeType === 1 || allNodes) {
                condition = acceptor(currentNode.node, currentNode.depth);
            }
            if (condition) {
                if (condition === "delete") {
                    currentNode.node.parentNode.removeChild(currentNode.node);
                    currentNode.node = prevNode;
                }
                else if (condition === "stop") {
                    return currentNode.node;
                }
            }
            prevNode = currentNode.node;
            currentNode = getNextNode(currentNode);
        }
    };
    
    // Work around IE circular DOM issue. This is the default max DOM depth on IE.
    // http://msdn2.microsoft.com/en-us/library/ms761392(VS.85).aspx
    fluid.dom.iterateDom.DOM_BAIL_DEPTH = 256;
    
    /**
     * Checks if the sepcified container is actually the parent of containee.
     * 
     * @param {Element} container the potential parent
     * @param {Element} containee the child in question
     */
    fluid.dom.isContainer = function (container, containee) {
        for (; containee; containee = containee.parentNode) {
            if (container === containee) {
                return true;
            }
        }
        return false;
    };
       
    /** Return the element text from the supplied DOM node as a single String */
    fluid.dom.getElementText = function(element) {
        var nodes = element.childNodes;
        var text = "";
        for (var i = 0; i < nodes.length; ++ i) {
          var child = nodes[i];
          if (child.nodeType == 3) {
            text = text + child.nodeValue;
            }
          }
        return text; 
    };
    
})(jQuery, fluid_1_2);
/*
Copyright 2008-2009 University of Cambridge
Copyright 2008-2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery*/
/*global fluid_1_2*/

fluid_1_2 = fluid_1_2 || {};

(function ($, fluid) {
      
  var unUnicode = /(\\u[\dabcdef]{4}|\\x[\dabcdef]{2})/g;
  
  fluid.unescapeProperties = function (string) {
    string = string.replace(unUnicode, function(match) {
      var code = match.substring(2);
      var parsed = parseInt(code, 16);
      return String.fromCharCode(parsed);
      }
    );
    var pos = 0;
    while (true) {
        var backpos = string.indexOf("\\", pos);
        if (backpos === -1) {
            break;
        }
        if (backpos === string.length - 1) {
          return [string.substring(0, string.length - 1), true];
        }
        var replace = string.charAt(backpos + 1);
        if (replace === "n") replace = "\n";
        if (replace === "r") replace = "\r";
        if (replace === "t") replace = "\t";
        string = string.substring(0, backpos) + replace + string.substring(backpos + 2);
        pos = backpos + 1;
    }
    return [string, false];
  };
  
  var breakPos = /[^\\][\s:=]/;
  
  fluid.parseJavaProperties = function(text) {
    // File format described at http://java.sun.com/javase/6/docs/api/java/util/Properties.html#load(java.io.Reader)
    var togo = {};
    text = text.replace(/\r\n/g, "\n");
    text = text.replace(/\r/g, "\n");
    lines = text.split("\n");
    var contin, key, valueComp, valueRaw, valueEsc;
    for (var i = 0; i < lines.length; ++ i) {
      var line = $.trim(lines[i]);
      if (!line || line.charAt(0) === "#" || line.charAt(0) === '!') {
          continue;
      }
      if (!contin) {
        valueComp = "";
        var breakpos = line.search(breakPos);
        if (breakpos === -1) {
          key = line;
          valueRaw = "";
          }
        else {
          key = $.trim(line.substring(0, breakpos + 1)); // +1 since first char is escape exclusion
          valueRaw = $.trim(line.substring(breakpos + 2));
          if (valueRaw.charAt(0) === ":" || valueRaw.charAt(0) === "=") {
            valueRaw = $.trim(valueRaw.substring(1));
          }
        }
      
        key = fluid.unescapeProperties(key)[0];
        valueEsc = fluid.unescapeProperties(valueRaw);
      }
      else {
        valueEsc = fluid.unescapeProperties(line);
      }

      contin = valueEsc[1];
      if (!valueEsc[1]) { // this line was not a continuation line - store the value
        togo[key] = valueComp + valueEsc[0];
      }
      else {
        valueComp += valueEsc[0];
      }
    }
    return togo;
  };
      
    /** 
     * Expand a message string with respect to a set of arguments, following a basic
     * subset of the Java MessageFormat rules. 
     * http://java.sun.com/j2se/1.4.2/docs/api/java/text/MessageFormat.html
     * 
     * The message string is expected to contain replacement specifications such
     * as {0}, {1}, {2}, etc.
     * @param messageString {String} The message key to be expanded
     * @param args {String/Array of String} An array of arguments to be substituted into the message.
     * @return The expanded message string. 
     */
    fluid.formatMessage = function (messageString, args) {
        if (!args) {
            return messageString;
        } 
        if (typeof(args) === "string") {
            args = [args];
        }
        for (var i = 0; i < args.length; ++ i) {
            messageString = messageString.replace("{" + i + "}", args[i]);
        }
        return messageString;
    };
      
})(jQuery, fluid_1_2);
  /*
Copyright 2007-2009 University of Cambridge
Copyright 2007-2009 University of Toronto
Copyright 2007-2009 University of California, Berkeley

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

// Declare dependencies.
/*global jQuery, YAHOO, opera*/

var fluid_1_2 = fluid_1_2 || {};
var fluid = fluid || fluid_1_2;

(function ($, fluid) {
       
    fluid.renderTimestamp = function (date) {
        var zeropad = function (num, width) {
             if (!width) width = 2;
             var numstr = (num == undefined? "" : num.toString());
             return "00000".substring(5 - width + numstr.length) + numstr;
             }
        return zeropad(date.getHours()) + ":" + zeropad(date.getMinutes()) + ":" + zeropad(date.getSeconds()) + "." + zeropad(date.getMilliseconds(), 3);
    };
    
        
    /** 
     * Dumps a DOM element into a readily recognisable form for debugging - produces a
     * "semi-selector" summarising its tag name, class and id, whichever are set.
     * 
     * @param {jQueryable} element The element to be dumped
     * @return A string representing the element.
     */
    fluid.dumpEl = function (element) {
        var togo;
        
        if (!element) {
            return "null";
        }
        if (element.nodeType === 3 || element.nodeType === 8) {
            return "[data: " + element.data + "]";
        } 
        if (element.nodeType === 9) {
            return "[document: location " + element.location + "]";
        }
        if (!element.nodeType && fluid.isArrayable(element)) {
            togo = "[";
            for (var i = 0; i < element.length; ++ i) {
                togo += fluid.dumpEl(element[i]);
                if (i < element.length - 1) {
                    togo += ", ";
                }
            }
            return togo + "]";
        }
        element = $(element);
        togo = element.get(0).tagName;
        if (element.attr("id")) {
            togo += "#" + element.attr("id");
        }
        if (element.attr("class")) {
            togo += "." + element.attr("class");
        }
        return togo;
    };
        
})(jQuery, fluid_1_2);
    /*
Copyright 2008-2009 University of Cambridge
Copyright 2008-2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery*/
/*global fluid_1_2*/

fluid_1_2 = fluid_1_2 || {};

(function ($, fluid) {
    
    fluid.VALUE = {};
    
    fluid.BINDING_ROOT_KEY = "fluid-binding-root";
    
    /** Recursively find any data stored under a given name from a node upwards
     * in its DOM hierarchy **/
     
    fluid.findData = function(elem, name) {
        while (elem) {
            var data = $.data(elem, name);
            if (data) {return data;}
            elem = elem.parentNode;
            }
        };
  
    fluid.bindFossils = function(node, data, fossils) {
        $.data(node, fluid.BINDING_ROOT_KEY, {data: data, fossils: fossils});
        };
  
    fluid.findForm = function (node) {
      return fluid.findAncestor(node, 
          function(element) {return element.nodeName.toLowerCase() === "form";});
    };
    
    /** A generalisation of jQuery.val to correctly handle the case of acquiring and
     * setting the value of clustered radio button/checkbox sets, potentially, given
     * a node corresponding to just one element.
     */
    fluid.value = function (nodeIn, newValue) {
        var node = fluid.unwrap(nodeIn);
        var multiple = false;
        if (node.nodeType === undefined && node.length > 1) {
            node = node[0];
            multiple = true;
        }
        var jNode = $(node);
        if ("input" !== node.nodeName.toLowerCase()
           || ! /radio|checkbox/.test(node.type)) {return $(node).val(newValue);}
        var name = node.name;
        if (name === undefined) {
            fluid.fail("Cannot acquire value from node " + fluid.dumpEl(node) + " which does not have name attribute set");
        }
        var elements;
        if (multiple) {
            elements = nodeIn;
        }
        else {
            var elements = document.getElementsByName(name);
            var scope = fluid.findForm(node);
            elements = $.grep(elements, 
              function(element) {
                if (element.name !== name) {return false;}
                return !scope || fluid.dom.isContainer(scope, element);
              });
        }
        if (newValue !== undefined) {
            if (typeof(newValue) === "boolean") {
                newValue = (newValue? "true" : "false");
            }
          // jQuery gets this partially right, but when dealing with radio button array will
          // set all of their values to "newValue" rather than setting the checked property
          // of the corresponding control. 
            $.each(elements, function() {
               this.checked = (newValue instanceof Array? 
                 $.inArray(this.value, newValue) !== -1 : newValue === this.value);
            });
        }
        else { // this part jQuery will not do - extracting value from <input> array
            var checked = $.map(elements, function(element) {
                return element.checked? element.value : null;
            });
            return node.type === "radio"? checked[0] : checked;
            }
       };
    
    /** "Automatically" apply to whatever part of the data model is
     * relevant, the changed value received at the given DOM node*/
    fluid.applyChange = function(node, newValue, applier) {
        node = fluid.unwrap(node);
        if (newValue === undefined) {
            newValue = fluid.value(node);
        }
        if (node.nodeType === undefined && node.length > 0) {node = node[0];} // assume here that they share name and parent
        var root = fluid.findData(node, fluid.BINDING_ROOT_KEY);
        if (!root) {
            fluid.fail("Bound data could not be discovered in any node above " + fluid.dumpEl(node));
        }
        var name = node.name;
        var fossil = root.fossils[name];
        if (!fossil) {
            fluid.fail("No fossil discovered for name " + name + " in fossil record above " + fluid.dumpEl(node));
        }
        if (typeof(fossil.oldvalue) === "boolean") { // deal with the case of an "isolated checkbox"
            newValue = newValue[0]? true: false;
        }
        var EL = root.fossils[name].EL;
        if (applier) {
            applier.fireChangeRequest({path: EL, value: newValue, source: node.id});
        }
        else {
            fluid.model.setBeanValue(root.data, EL, newValue);
        }    
        };
   
    fluid.pathUtil = {};
   
    var getPathSegmentImpl = function(accept, path, i) {
        var segment = null; // TODO: rewrite this with regexes and replaces
        if (accept) {
            segment = "";
        }
        var escaped = false;
        var limit = path.length;
        for (; i < limit; ++i) {
            var c = path.charAt(i);
            if (!escaped) {
                if (c === '.') {
                    break;
                    }
                else if (c === '\\') {
                    escaped = true;
                    }
                else if (segment !== null) {
                    segment += c;
                }
            }
            else {
                escaped = false;
                if (segment !== null)
                    accept += c;
                }
            }
        if (segment !== null) {
            accept[0] = segment;
        }
        return i;
        };
    
    var globalAccept = []; // reentrancy risk
    
    fluid.pathUtil.getPathSegment = function(path, i) {
        getPathSegmentImpl(globalAccept, path, i);
        return globalAccept[0];
        }; 
  
    fluid.pathUtil.getHeadPath = function(path) {
        return fluid.pathUtil.getPathSegment(path, 0);
        };
  
    fluid.pathUtil.getFromHeadPath = function(path) {
        var firstdot = getPathSegmentImpl(null, path, 0);
        return firstdot === path.length ? null
            : path.substring(firstdot + 1);
        };
    
    function lastDotIndex(path) {
        // TODO: proper escaping rules
        return path.lastIndexOf(".");
        }
    
    fluid.pathUtil.getToTailPath = function(path) {
        var lastdot = lastDotIndex(path);
        return lastdot == -1 ? null : path.substring(0, lastdot);
        };

  /** Returns the very last path component of a bean path */
    fluid.pathUtil.getTailPath = function(path) {
        var lastdot = lastDotIndex(path);
        return fluid.pathUtil.getPathSegment(path, lastdot + 1);
        };
    
    var composeSegment = function(prefix, toappend) {
        for (var i = 0; i < toappend.length; ++i) {
            var c = toappend.charAt(i);
            if (c === '.' || c === '\\' || c === '}') {
                prefix += '\\';
            }
            prefix += c;
        }
        return prefix;
    };
    
    /**
     * Compose a prefix and suffix EL path, where the prefix is already escaped.
     * Prefix may be empty, but not null. The suffix will become escaped.
     */
    fluid.pathUtil.composePath = function(prefix, suffix) {
        if (prefix.length !== 0) {
            prefix += '.';
        }
        return composeSegment(prefix, suffix);
        };    
   
    fluid.pathUtil.matchPath = function(spec, path) {
        var togo = "";
        while (true) {
          if (!spec) {break;}
          if (!path) {return null;}
          var spechead = fluid.pathUtil.getHeadPath(spec);
          var pathhead = fluid.pathUtil.getHeadPath(path);
          // if we fail to match on a specific component, fail.
          if (spechead !== "*" && spechead !== pathhead) {
              return null;
          }
          togo = fluid.pathUtil.composePath(togo, pathhead);
          spec = fluid.pathUtil.getFromHeadPath(spec);
          path = fluid.pathUtil.getFromHeadPath(path);
        }
        return togo;
      };
  
  
    fluid.model.applyChangeRequest = function(model, request) {
        if (request.type === "ADD") {
            fluid.model.setBeanValue(model, request.path, request.value);
            }
        else if (request.type === "DELETE") {
            var totail = fluid.pathUtil.getToTailPath(request.path);
            var tail = fluid.pathUtil.getTailPath(request.path);
            var penult = fluid.model.getBeanValue(model, penult);
            delete penult[tail];
        }
    };
  
    fluid.model.bindRequestChange = function(that) {
        that.requestChange = function(path, value, type) {
            var changeRequest = {
                path: path,
                value: value,
                type: type
            };
        that.fireChangeRequest(changeRequest);
        }
    };
  
    fluid.makeChangeApplier = function(model) {
        var baseEvents = {
            guards: fluid.event.getEventFirer(false, true),
            modelChanged: fluid.event.getEventFirer(false, false)
        };
        var that = {
            model: model
        };
        function makePredicate(listenerMember, requestIndex) {
          return function(listener, args) {
                var changeRequest = args[requestIndex];
                return fluid.pathUtil.matchPath(listener[listenerMember], changeRequest.path);
            };
        }
        function adaptListener(that, name, listenerMember, requestIndex) {
            var predicate = makePredicate(listenerMember, requestIndex);
            that[name] = {
                addListener: function(pathSpec, listener, namespace) {
                    listener[listenerMember] = pathSpec;
                    baseEvents[name].addListener(listener, namespace, predicate);
                },
                removeListener: function(listener) {
                    baseEvents[name].removeListener(listener);
                }
            };
        }
        
        adaptListener(that, "guards", "guardedPathSpec", 1);
        adaptListener(that, "modelChanged", "triggerPathSpec", 2);
        that.fireChangeRequest = function(changeRequest) {
            if (!changeRequest.type) {
                changeRequest.type = "ADD";
            }
            var prevent = baseEvents.guards.fire(model, changeRequest);
            if (prevent === false) {
                return;
            }
            var oldModel = {};
            fluid.model.copyModel(oldModel, model);
            fluid.model.applyChangeRequest(model, changeRequest);
            baseEvents.modelChanged.fire(model, oldModel, changeRequest);
        };
        fluid.model.bindRequestChange(that);
        
        return that;
    };
    
    fluid.makeSuperApplier = function() {
        var subAppliers = [];
        var that = {};
        that.addSubApplier = function(path, subApplier) {
            subAppliers.push({path: path, subApplier: subApplier});
        };
        that.fireChangeRequest = function(request) {
            for (var i = 0; i < subAppliers.length; ++ i) {
                var path = subAppliers[i].path;
                if (request.path.indexOf(path) === 0) {
                    var subpath = request.path.substring(path.length + 1);
                    var subRequest = fluid.copy(request);
                    subRequest.path = subpath;
                    // TODO: Deal with the as yet unsupported case of an EL rvalue DAR
                    subAppliers[i].subApplier.fireChangeRequest(subRequest);
                }
            }
        };
        return that;
    };
    
    fluid.attachModel = function(baseModel, path, model) {
        var segs = fluid.model.parseEL(path);
        for (var i = 0; i < segs.length - 1; ++ i) {
            var seg = segs[i];
            var subModel = baseModel[seg];
            if (!subModel) {
                baseModel[seg] = subModel = {};
            }
            baseModel = subModel;
        }
        baseModel[segs[segs.length - 1]] = model;
    };
    
    fluid.assembleModel = function (modelSpec) {
       var model = {};
       var superApplier = fluid.makeSuperApplier();
       var togo = {model: model, applier: superApplier};
       for (path in modelSpec) {
           var rec = modelSpec[path];
           fluid.attachModel(model, path, rec.model);
           if (rec.applier) {
              superApplier.addSubApplier(path, rec.applier);
           }
       }
       return togo;
    };

})(jQuery, fluid_1_2);
/*
Copyright 2008-2009 University of Cambridge
Copyright 2008-2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery*/

var fluid_1_2 = fluid_1_2 || {};
var fluid = fluid || fluid_1_2;

(function ($, fluid) {

    // $().fluid("selectable", args)
    // $().fluid("selectable".that()
    // $().fluid("pager.pagerBar", args)
    // $().fluid("reorderer", options)

/** Create a "bridge" from code written in the Fluid standard "that-ist" style,
 *  to the standard JQuery UI plugin architecture specified at http://docs.jquery.com/UI/Guidelines .
 *  Every Fluid component corresponding to the top-level standard signature (JQueryable, options)
 *  will automatically convert idiomatically to the JQuery UI standard via this adapter. 
 *  Any return value which is a primitive or array type will become the return value
 *  of the "bridged" function - however, where this function returns a general hash
 *  (object) this is interpreted as forming part of the Fluid "return that" pattern,
 *  and the function will instead be bridged to "return this" as per JQuery standard,
 *  permitting chaining to occur. However, as a courtesy, the particular "this" returned
 *  will be augmented with a function that() which will allow the original return
 *  value to be retrieved if desired.
 *  @param {String} name The name under which the "plugin space" is to be injected into
 *  JQuery
 *  @param {Object} peer The root of the namespace corresponding to the peer object.
 */

    fluid.thatistBridge = function (name, peer) {

        var togo = function(funcname) {
            var segs = funcname.split(".");
            var move = peer;
            for (var i = 0; i < segs.length; ++i) {
                move = move[segs[i]];
            }
            var args = [this];
            if (arguments.length === 2) {
                args = args.concat($.makeArray(arguments[1]));
            }
            var ret = move.apply(null, args);
            this.that = function() {
                return ret;
            }
            var type = typeof(ret);
            return !ret || type === "string" || type === "number" || type === "boolean"
              || ret && ret.length !== undefined? ret: this;
        };
        $.fn[name] = togo;
        return togo;
    };

    fluid.thatistBridge("fluid", fluid);
    fluid.thatistBridge("fluid_1_2", fluid_1_2);

    // Private constants.
    var NAMESPACE_KEY = "fluid-keyboard-a11y";

    /**
     * Gets stored state from the jQuery instance's data map.
     */
    var getData = function(target, key) {
        var data = $(target).data(NAMESPACE_KEY);
        return data ? data[key] : undefined;
    };

    /**
     * Stores state in the jQuery instance's data map. Unlike jQuery's version,
     * accepts multiple-element jQueries.
     */
    var setData = function(target, key, value) {
        $(target).each(function() {
            var data = $.data(this, NAMESPACE_KEY) || {};
            data[key] = value;

            $.data(this, NAMESPACE_KEY, data);
        });
    };
/** Global focus manager - makes use of jQuery delegate plugin if present,
 * detecting presence of "focusin" event.
 */

    var lastFocusedElement = "disabled";
    
    if ($.event.special["focusin"]) {
        lastFocusedElement = null;
        $(document).bind("focusin", function(event){
            lastFocusedElement = event.target;
        });
    }
    
    fluid.getLastFocusedElement = function () {
        if (lastFocusedElement === "disabled") {
           fluid.fail("Focus manager not enabled - please include jquery.delegate.js or equivalent for support of 'focusin' event");
        }
        return lastFocusedElement;
    }

/*************************************************************************
 * Tabindex normalization - compensate for browser differences in naming
 * and function of "tabindex" attribute and tabbing order.
 */

    // -- Private functions --
    
    
    var normalizeTabindexName = function() {
        return $.browser.msie ? "tabIndex" : "tabindex";
    };

    var canHaveDefaultTabindex = function(elements) {
       if (elements.length <= 0) {
           return false;
       }

       return $(elements[0]).is("a, input, button, select, area, textarea, object");
    };
    
    var getValue = function(elements) {
        if (elements.length <= 0) {
            return undefined;
        }

        if (!fluid.tabindex.hasAttr(elements)) {
            return canHaveDefaultTabindex(elements) ? Number(0) : undefined;
        }

        // Get the attribute and return it as a number value.
        var value = elements.attr(normalizeTabindexName());
        return Number(value);
    };

    var setValue = function(elements, toIndex) {
        return elements.each(function(i, item) {
            $(item).attr(normalizeTabindexName(), toIndex);
        });
    };
    
    // -- Public API --
    
    /**
     * Gets the value of the tabindex attribute for the first item, or sets the tabindex value of all elements
     * if toIndex is specified.
     * 
     * @param {String|Number} toIndex
     */
    fluid.tabindex = function(target, toIndex) {
        target = $(target);
        if (toIndex !== null && toIndex !== undefined) {
            return setValue(target, toIndex);
        } else {
            return getValue(target);
        }
    };

    /**
     * Removes the tabindex attribute altogether from each element.
     */
    fluid.tabindex.remove = function(target) {
        target = $(target);
        return target.each(function(i, item) {
            $(item).removeAttr(normalizeTabindexName());
        });
    };

    /**
     * Determines if an element actually has a tabindex attribute present.
     */
    fluid.tabindex.hasAttr = function(target) {
        target = $(target);
        if (target.length <= 0) {
            return false;
        }
        var togo = target.map(
            function() {
                var attributeNode = this.getAttributeNode(normalizeTabindexName());
                return attributeNode ? attributeNode.specified : false;
            }
            );
        return togo.length === 1? togo[0] : togo;
    };

    /**
     * Determines if an element either has a tabindex attribute or is naturally tab-focussable.
     */
    fluid.tabindex.has = function(target) {
        target = $(target);
        return fluid.tabindex.hasAttr(target) || canHaveDefaultTabindex(target);
    };

    var ENABLEMENT_KEY = "enablement";

    /** Queries or sets the enabled status of a control. An activatable node
     * may be "disabled" in which case its keyboard bindings will be inoperable
     * (but still stored) until it is reenabled again.
     */
     
    fluid.enabled = function(target, state) {
        target = $(target);
        if (state === undefined) {
            return getData(target, ENABLEMENT_KEY) !== false;
        }
        else {
            $("*", target).each(function() {
                if (getData(this, ENABLEMENT_KEY) !== undefined) {
                    setData(this, ENABLEMENT_KEY, state);
                }
                else if (/select|textarea|input/i.test(this.nodeName)) {
                    $(this).attr("disabled", !state);
                }
            });
            setData(target, ENABLEMENT_KEY, state);
        }
    };
    

// Keyboard navigation
    // Public, static constants needed by the rest of the library.
    fluid.a11y = $.a11y || {};

    fluid.a11y.orientation = {
        HORIZONTAL: 0,
        VERTICAL: 1,
        BOTH: 2
    };

    var UP_DOWN_KEYMAP = {
        next: $.ui.keyCode.DOWN,
        previous: $.ui.keyCode.UP
    };

    var LEFT_RIGHT_KEYMAP = {
        next: $.ui.keyCode.RIGHT,
        previous: $.ui.keyCode.LEFT
    };

    // Private functions.
    var unwrap = function(element) {
        return element.jquery ? element[0] : element; // Unwrap the element if it's a jQuery.
    };


    var makeElementsTabFocussable = function(elements) {
        // If each element doesn't have a tabindex, or has one set to a negative value, set it to 0.
        elements.each(function(idx, item) {
            item = $(item);
            if (!item.fluid("tabindex.has") || item.fluid("tabindex") < 0) {
                item.fluid("tabindex", 0);
            }
        });
    };

    // Public API.
    /**
     * Makes all matched elements available in the tab order by setting their tabindices to "0".
     */
    fluid.tabbable = function(target) {
        target = $(target);
        makeElementsTabFocussable(target);
    };

    /*********************************************************************** 
     * Selectable functionality - geometrising a set of nodes such that they
     * can be navigated (by setting focus) using a set of directional keys
     */

    var CONTEXT_KEY = "selectionContext";
    var NO_SELECTION = -32768;

    var cleanUpWhenLeavingContainer = function(selectionContext) {
        if (selectionContext.options.onLeaveContainer) {
            selectionContext.options.onLeaveContainer(
              selectionContext.selectables[selectionContext.activeItemIndex]);
        } else if (selectionContext.options.onUnselect) {
            selectionContext.options.onUnselect(
            selectionContext.selectables[selectionContext.activeItemIndex]);
        }

        if (!selectionContext.options.rememberSelectionState) {
            selectionContext.activeItemIndex = NO_SELECTION;
        }
    };

    /**
     * Does the work of selecting an element and delegating to the client handler.
     */
    var drawSelection = function(elementToSelect, handler) {
        if (handler) {
            handler(elementToSelect);
        }
    };

    /**
     * Does does the work of unselecting an element and delegating to the client handler.
     */
    var eraseSelection = function(selectedElement, handler) {
        if (handler && selectedElement) {
            handler(selectedElement);
        }
    };

    var unselectElement = function(selectedElement, selectionContext) {
        eraseSelection(selectedElement, selectionContext.options.onUnselect);
    };

    var selectElement = function(elementToSelect, selectionContext) {
        // It's possible that we're being called programmatically, in which case we should clear any previous selection.
        unselectElement(selectionContext.selectedElement(), selectionContext);

        elementToSelect = unwrap(elementToSelect);
        var newIndex = selectionContext.selectables.index(elementToSelect);

        // Next check if the element is a known selectable. If not, do nothing.
        if (newIndex === -1) {
           return;
        }

        // Select the new element.
        selectionContext.activeItemIndex = newIndex;
        drawSelection(elementToSelect, selectionContext.options.onSelect);
    };

    var selectableFocusHandler = function(selectionContext) {
        return function(evt) {
            selectElement(evt.target, selectionContext);

            // Force focus not to bubble on some browsers.
            return evt.stopPropagation();
        };
    };

    var selectableBlurHandler = function(selectionContext) {
        return function(evt) {
            unselectElement(evt.target, selectionContext);

            // Force blur not to bubble on some browsers.
            return evt.stopPropagation();
        };
    };

    var reifyIndex = function(sc_that) {
        var elements = sc_that.selectables;
        if (sc_that.activeItemIndex >= elements.length) {
            sc_that.activeItemIndex = 0;
        }
        if (sc_that.activeItemIndex < 0 && sc_that.activeItemIndex !== NO_SELECTION) {
            sc_that.activeItemIndex = elements.length - 1;
        }
        if (sc_that.activeItemIndex >= 0) {
            $(elements[sc_that.activeItemIndex]).focus();
        }
    };

    var prepareShift = function(selectionContext) {
        unselectElement(selectionContext.selectedElement(), selectionContext);
        if (selectionContext.activeItemIndex === NO_SELECTION) {
          selectionContext.activeItemIndex = -1;
        }
    };

    var focusNextElement = function(selectionContext) {
        prepareShift(selectionContext);
        ++selectionContext.activeItemIndex;
        reifyIndex(selectionContext);
    };

    var focusPreviousElement = function(selectionContext) {
        prepareShift(selectionContext);
        --selectionContext.activeItemIndex;
        reifyIndex(selectionContext);
    };

    var arrowKeyHandler = function(selectionContext, keyMap, userHandlers) {
        return function(evt) {
            if (evt.which === keyMap.next) {
                focusNextElement(selectionContext);
                evt.preventDefault();
            } else if (evt.which === keyMap.previous) {
                focusPreviousElement(selectionContext);
                evt.preventDefault();
            }
        };
    };

    var getKeyMapForDirection = function(direction) {
        // Determine the appropriate mapping for next and previous based on the specified direction.
        var keyMap;
        if (direction === fluid.a11y.orientation.HORIZONTAL) {
            keyMap = LEFT_RIGHT_KEYMAP;
        } 
        else if (direction === fluid.a11y.orientation.VERTICAL) {
            // Assume vertical in any other case.
            keyMap = UP_DOWN_KEYMAP;
        }

        return keyMap;
    };

    var tabKeyHandler = function(selectionContext) {
        return function(evt) {
            if (evt.which !== $.ui.keyCode.TAB) {
                return;
            }
            cleanUpWhenLeavingContainer(selectionContext);

            // Catch Shift-Tab and note that focus is on its way out of the container.
            if (evt.shiftKey) {
                selectionContext.focusIsLeavingContainer = true;
            }
        };
    };

    var containerFocusHandler = function(selectionContext) {
        return function(evt) {
            var shouldOrig = selectionContext.options.autoSelectFirstItem;
            var shouldSelect = typeof(shouldOrig) === "function" ? 
                 shouldOrig() : shouldOrig;

            // Override the autoselection if we're on the way out of the container.
            if (selectionContext.focusIsLeavingContainer) {
                shouldSelect = false;
            }

            // This target check works around the fact that sometimes focus bubbles, even though it shouldn't.
            if (shouldSelect && evt.target === selectionContext.container.get(0)) {
                if (selectionContext.activeItemIndex === NO_SELECTION) {
                    selectionContext.activeItemIndex = 0;
                }
                $(selectionContext.selectables[selectionContext.activeItemIndex]).focus();
            }

           // Force focus not to bubble on some browsers.
           return evt.stopPropagation();
        };
    };

    var containerBlurHandler = function(selectionContext) {
        return function(evt) {
            selectionContext.focusIsLeavingContainer = false;

            // Force blur not to bubble on some browsers.
            return evt.stopPropagation();
        };
    };

    var makeElementsSelectable = function(container, defaults, userOptions) {

        var options = $.extend(true, {}, defaults, userOptions);

        var keyMap = getKeyMapForDirection(options.direction);

        var selectableElements = options.selectableElements? options.selectableElements :
              container.find(options.selectableSelector);
          
        // Context stores the currently active item(undefined to start) and list of selectables.
        var that = {
            container: container,
            activeItemIndex: NO_SELECTION,
            selectables: selectableElements,
            focusIsLeavingContainer: false,
            options: options
        };

        that.selectablesUpdated = function(focusedItem) {
          // Remove selectables from the tab order and add focus/blur handlers
            if (typeof(that.options.selectablesTabindex) === "number") {
                that.selectables.fluid("tabindex", that.options.selectablesTabindex);
            }
            that.selectables.unbind("focus." + NAMESPACE_KEY);
            that.selectables.unbind("blur." + NAMESPACE_KEY);
            that.selectables.bind("focus."+ NAMESPACE_KEY, selectableFocusHandler(that));
            that.selectables.bind("blur." + NAMESPACE_KEY, selectableBlurHandler(that));
            if (focusedItem) {
                selectElement(focusedItem, that);
            }
            else {
                reifyIndex(that);
            }
        };

        that.refresh = function() {
            if (!that.options.selectableSelector) {
                throw("Cannot refresh selectable context which was not initialised by a selector");
            }
            that.selectables = container.find(options.selectableSelector);
            that.selectablesUpdated();
        };
        
        that.selectedElement = function() {
            return that.activeItemIndex < 0? null : that.selectables[that.activeItemIndex];
        };
        
        // Add various handlers to the container.
        if (keyMap) {
            container.keydown(arrowKeyHandler(that, keyMap));
        }
        container.keydown(tabKeyHandler(that));
        container.focus(containerFocusHandler(that));
        container.blur(containerBlurHandler(that));
        
        that.selectablesUpdated();

        return that;
    };

    /**
     * Makes all matched elements selectable with the arrow keys.
     * Supply your own handlers object with onSelect: and onUnselect: properties for custom behaviour.
     * Options provide configurability, including direction: and autoSelectFirstItem:
     * Currently supported directions are jQuery.a11y.directions.HORIZONTAL and VERTICAL.
     */
    fluid.selectable = function(target, options) {
        target = $(target);
        var that = makeElementsSelectable(target, fluid.selectable.defaults, options);
        setData(target, CONTEXT_KEY, that);
        return that;
    };

    /**
     * Selects the specified element.
     */
    fluid.selectable.select = function(target, toSelect) {
        $(toSelect).focus();
    };

    /**
     * Selects the next matched element.
     */
    fluid.selectable.selectNext = function(target) {
        target = $(target);
        focusNextElement(getData(target, CONTEXT_KEY));
    };

    /**
     * Selects the previous matched element.
     */
    fluid.selectable.selectPrevious = function(target) {
        target = $(target);
        focusPreviousElement(getData(target, CONTEXT_KEY));
    };

    /**
     * Returns the currently selected item wrapped as a jQuery object.
     */
    fluid.selectable.currentSelection = function(target) {
        target = $(target);
        var that = getData(target, CONTEXT_KEY);
        return $(that.selectedElement());
    };

    fluid.selectable.defaults = {
        direction: fluid.a11y.orientation.VERTICAL,
        selectablesTabindex: -1,
        autoSelectFirstItem: true,
        rememberSelectionState: true,
        selectableSelector: ".selectable",
        selectableElements: null,
        onSelect: null,
        onUnselect: null,
        onLeaveContainer: null
    };

    /********************************************************************
     *  Activation functionality - declaratively associating actions with 
     * a set of keyboard bindings.
     */

    var checkForModifier = function(binding, evt) {
        // If no modifier was specified, just return true.
        if (!binding.modifier) {
            return true;
        }

        var modifierKey = binding.modifier;
        var isCtrlKeyPresent = modifierKey && evt.ctrlKey;
        var isAltKeyPresent = modifierKey && evt.altKey;
        var isShiftKeyPresent = modifierKey && evt.shiftKey;

        return isCtrlKeyPresent || isAltKeyPresent || isShiftKeyPresent;
    };

    /** Constructs a raw "keydown"-facing handler, given a binding entry. This
     *  checks whether the key event genuinely triggers the event and forwards it
     *  to any "activateHandler" registered in the binding. 
     */
    var makeActivationHandler = function(binding) {
        return function(evt) {
            var target = evt.target;
            if (!fluid.enabled(evt.target)) {
                return;
            }
// The following 'if' clause works in the real world, but there's a bug in the jQuery simulation
// that causes keyboard simulation to fail in Safari, causing our tests to fail:
//     http://ui.jquery.com/bugs/ticket/3229
// The replacement 'if' clause works around this bug.
// When this issue is resolved, we should revert to the original clause.
//            if (evt.which === binding.key && binding.activateHandler && checkForModifier(binding, evt)) {
            var code = evt.which? evt.which : evt.keyCode;
            if (code === binding.key && binding.activateHandler && checkForModifier(binding, evt)) {
                var event = $.Event("fluid-activate");
                $(evt.target).trigger(event, [binding.activateHandler]);
                if (event.isDefaultPrevented()) {
                    evt.preventDefault();
                }
            }
        };
    };

    var makeElementsActivatable = function(elements, onActivateHandler, defaultKeys, options) {
        // Create bindings for each default key.
        var bindings = [];
        $(defaultKeys).each(function(index, key) {
            bindings.push({
                modifier: null,
                key: key,
                activateHandler: onActivateHandler
            });
        });

        // Merge with any additional key bindings.
        if (options && options.additionalBindings) {
            bindings = bindings.concat(options.additionalBindings);
        }

        setData(elements, ENABLEMENT_KEY, true);

        // Add listeners for each key binding.
        for (var i = 0; i < bindings.length; ++ i) {
            var binding = bindings[i];
            elements.keydown(makeActivationHandler(binding));
        }
        elements.bind("fluid-activate", function(evt, handler) {
            handler = handler || onActivateHandler;
            return handler? handler(evt): null;
        });
    };

    /**
     * Makes all matched elements activatable with the Space and Enter keys.
     * Provide your own handler function for custom behaviour.
     * Options allow you to provide a list of additionalActivationKeys.
     */
    fluid.activatable = function(target, fn, options) {
        target = $(target);
        makeElementsActivatable(target, fn, fluid.activatable.defaults.keys, options);
    };

    /**
     * Activates the specified element.
     */
    fluid.activate = function(target) {
        $(target).trigger("fluid-activate");
    };

    // Public Defaults.
    fluid.activatable.defaults = {
        keys: [$.ui.keyCode.ENTER, $.ui.keyCode.SPACE]
    };

  
  })(jQuery, fluid_1_2);
// =========================================================================
//
// tinyxmlsax.js - an XML SAX parser in JavaScript compressed for downloading
//
// version 3.1
//
// =========================================================================
//
// Copyright (C) 2000 - 2002, 2003 Michael Houghton (mike@idle.org), Raymond Irving and David Joham (djoham@yahoo.com)
//
// This library is free software; you can redistribute it and/or
// modify it under the terms of the GNU Lesser General Public
// License as published by the Free Software Foundation; either
// version 2.1 of the License, or (at your option) any later version.

// This library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
// Lesser General Public License for more details.

// You should have received a copy of the GNU Lesser General Public
// License along with this library; if not, write to the Free Software
// Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
//
// Visit the XML for <SCRIPT> home page at http://xmljs.sourceforge.net
//

/*
The zlib/libpng License

Copyright (c) 2000 - 2002, 2003 Michael Houghton (mike@idle.org), Raymond Irving and David Joham (djoham@yahoo.com)

This software is provided 'as-is', without any express or implied
warranty. In no event will the authors be held liable for any damages
arising from the use of this software.

Permission is granted to anyone to use this software for any purpose,
including commercial applications, and to alter it and redistribute it
freely, subject to the following restrictions:

    1. The origin of this software must not be misrepresented; you must not
    claim that you wrote the original software. If you use this software
    in a product, an acknowledgment in the product documentation would be
    appreciated but is not required.

    2. Altered source versions must be plainly marked as such, and must not be
    misrepresented as being the original software.

    3. This notice may not be removed or altered from any source
    distribution.
 */

XMLP = function(strXML) { 

    this.m_xml = strXML; 
    this.m_iP = 0;
    this.m_iState = XMLP._STATE_PROLOG; 
    this.m_stack = [];
    this.m_attributes = {};
    this.m_emitSynthetic = false; // state used for emitting synthetic tags used to correct broken markup (IE)
    };
    
// List of closed HTML tags, taken from JQuery 1.2.3
XMLP.closedTags = {
    abbr: true, br: true, col: true, img: true, input: true,
    link: true, meta: true, param: true, hr: true, area: true, embed:true
    };
        
XMLP._NONE = 0;
XMLP._ELM_B = 1;
XMLP._ELM_E = 2;
XMLP._ELM_EMP = 3; 
XMLP._ATT = 4;
XMLP._TEXT = 5;
XMLP._ENTITY = 6; 
XMLP._PI = 7;
XMLP._CDATA = 8;
XMLP._COMMENT = 9; 
XMLP._DTD = 10;
XMLP._ERROR = 11;
 
XMLP._CONT_XML = 0; 
XMLP._CONT_ALT = 1; 
XMLP._ATT_NAME = 0; 
XMLP._ATT_VAL = 1;

XMLP._STATE_PROLOG = 1;
XMLP._STATE_DOCUMENT = 2; 
XMLP._STATE_MISC = 3;

XMLP._errs = [];
XMLP._errs[XMLP.ERR_CLOSE_PI = 0 ] = "PI: missing closing sequence"; 
XMLP._errs[XMLP.ERR_CLOSE_DTD = 1 ] = "DTD: missing closing sequence"; 
XMLP._errs[XMLP.ERR_CLOSE_COMMENT = 2 ] = "Comment: missing closing sequence"; 
XMLP._errs[XMLP.ERR_CLOSE_CDATA = 3 ] = "CDATA: missing closing sequence"; 
XMLP._errs[XMLP.ERR_CLOSE_ELM = 4 ] = "Element: missing closing sequence"; 
XMLP._errs[XMLP.ERR_CLOSE_ENTITY = 5 ] = "Entity: missing closing sequence"; 
XMLP._errs[XMLP.ERR_PI_TARGET = 6 ] = "PI: target is required"; 
XMLP._errs[XMLP.ERR_ELM_EMPTY = 7 ] = "Element: cannot be both empty and closing"; 
XMLP._errs[XMLP.ERR_ELM_NAME = 8 ] = "Element: name must immediatly follow \"<\""; 
XMLP._errs[XMLP.ERR_ELM_LT_NAME = 9 ] = "Element: \"<\" not allowed in element names"; 
XMLP._errs[XMLP.ERR_ATT_VALUES = 10] = "Attribute: values are required and must be in quotes"; 
XMLP._errs[XMLP.ERR_ATT_LT_NAME = 11] = "Element: \"<\" not allowed in attribute names"; 
XMLP._errs[XMLP.ERR_ATT_LT_VALUE = 12] = "Attribute: \"<\" not allowed in attribute values"; 
XMLP._errs[XMLP.ERR_ATT_DUP = 13] = "Attribute: duplicate attributes not allowed"; 
XMLP._errs[XMLP.ERR_ENTITY_UNKNOWN = 14] = "Entity: unknown entity"; 
XMLP._errs[XMLP.ERR_INFINITELOOP = 15] = "Infinite loop"; 
XMLP._errs[XMLP.ERR_DOC_STRUCTURE = 16] = "Document: only comments, processing instructions, or whitespace allowed outside of document element"; 
XMLP._errs[XMLP.ERR_ELM_NESTING = 17] = "Element: must be nested correctly"; 

XMLP.prototype._checkStructure = function(iEvent) {
    var stack = this.m_stack; 
    if (XMLP._STATE_PROLOG == this.m_iState) {
        // disabled original check for text node in prologue
        this.m_iState = XMLP._STATE_DOCUMENT;
        }

    if (XMLP._STATE_DOCUMENT === this.m_iState) {
        if ((XMLP._ELM_B == iEvent) || (XMLP._ELM_EMP == iEvent)) { 
            this.m_stack[stack.length] = this.getName();
            }
        if ((XMLP._ELM_E == iEvent) || (XMLP._ELM_EMP == iEvent)) {
            if (stack.length === 0) {
                //return this._setErr(XMLP.ERR_DOC_STRUCTURE);
                return XMLP._NONE;
                }
            var strTop = stack[stack.length - 1];
            this.m_stack.length--;
            if (strTop === null || strTop !== this.getName()) { 
                return this._setErr(XMLP.ERR_ELM_NESTING);
                }
            }

        // disabled original check for text node in epilogue - "MISC" state is disused
    }
return iEvent;
};
    
    
XMLP.prototype.getColumnNumber = function() { 
    return SAXStrings.getColumnNumber(this.m_xml, this.m_iP);
    };
    
XMLP.prototype.getContent = function() { 
    return (this.m_cSrc == XMLP._CONT_XML) ? this.m_xml : this.m_cAlt;
    };
    
XMLP.prototype.getContentBegin = function() { return this.m_cB;};
XMLP.prototype.getContentEnd = function() { return this.m_cE;};

XMLP.prototype.getLineNumber = function() { 
    return SAXStrings.getLineNumber(this.m_xml, this.m_iP);
    };
    
XMLP.prototype.getName = function() { 
    return this.m_name;
    };
    
XMLP.prototype.next = function() { 
    return this._checkStructure(this._parse());
    };
    
XMLP.prototype._parse = function() {
    var iP = this.m_iP;
    var xml = this.m_xml; 
    if (iP === xml.length) { return XMLP._NONE;}
    var c = xml.charAt(iP);
    if (c === '<') {
        var c2 = xml.charAt(iP + 1);
        if (c2 === '?') {
            return this._parsePI (iP + 2);
            }
        else if (c2 === '!') {
            if (iP === xml.indexOf("<!DOCTYPE", iP)) { 
                return this._parseDTD (iP + 9);
                }
            else if (iP === xml.indexOf("<!--", iP)) { 
                return this._parseComment(iP + 4);
                }
            else if (iP === xml.indexOf("<![CDATA[", iP)) { 
                return this._parseCDATA (iP + 9);
                }
            }
        else {
            return this._parseElement(iP + 1);
            }
        }
    else {
        return this._parseText (iP);
        }
    };

(function() { // guarding closure to preserve global namespace

nameRegex = /([^\s\/>]+)/g;
attrStartRegex = /\s*([\w:_][\w:_\-\.]*)/gm;
attrValRegex = /\"([^\"]*)\"\s*/gm; // "normal" XHTML attribute values
attrValIERegex = /([^\>\s]+)\s*/gm; // "stupid" unquoted IE attribute values (sometimes)
closeRegex = /\s*<\//g;

XMLP.prototype._parseElement = function(iB) {
    var iE, iDE, iRet; 
    var iType, strN, iLast; 
    iDE = iE = this.m_xml.indexOf(">", iB); 
    if (iE == -1) { 
        return this._setErr(XMLP.ERR_CLOSE_ELM);
        }
    if (this.m_xml.charAt(iB) == "/") { 
        iType = XMLP._ELM_E; 
        iB++;
        } 
    else { 
        iType = XMLP._ELM_B;
        }
    if (this.m_xml.charAt(iE - 1) == "/") { 
        if (iType == XMLP._ELM_E) { 
            return this._setErr(XMLP.ERR_ELM_EMPTY);
            }
        iType = XMLP._ELM_EMP; iDE--;
        }

    nameRegex.lastIndex = iB;
    var nameMatch = nameRegex.exec(this.m_xml);
    if (!nameMatch) {
        return this._setErr(XMLP.ERR_ELM_NAME);
        }
    strN = nameMatch[1].toLowerCase();
    // This branch is specially necessary for broken markup in IE. If we see an li
    // tag apparently directly nested in another, first emit a synthetic close tag
    // for the earlier one without advancing the pointer, and set a flag to ensure
    // doing this just once.
    if ("li" === strN && iType !== XMLP._ELM_E && this.m_stack.length > 0 && 
        this.m_stack[this.m_stack.length - 1] === "li" && !this.m_emitSynthetic) {
        this.m_name = "li";
        this.m_emitSynthetic = true;
        return XMLP._ELM_E;
    }
    // We have acquired the tag name, now set about parsing any attribute list
    this.m_attributes = {};
    this.m_cAlt = ""; 

    if (nameRegex.lastIndex < iDE) {
        this.m_iP = nameRegex.lastIndex;
        while (this.m_iP < iDE) {
            attrStartRegex.lastIndex = this.m_iP;
            var attrMatch = attrStartRegex.exec(this.m_xml);
            if (!attrMatch) {
                return this._setErr(XMLP.ERR_ATT_VALUES);
                }
            var attrname = attrMatch[1].toLowerCase();
            var attrval;
            if (this.m_xml.charCodeAt(attrStartRegex.lastIndex) === 61) { // = 
                var valRegex = this.m_xml.charCodeAt(attrStartRegex.lastIndex + 1) === 34? attrValRegex : attrValIERegex; // "
                valRegex.lastIndex = attrStartRegex.lastIndex + 1;
                attrMatch = valRegex.exec(this.m_xml);
                if (!attrMatch) {
                    return this._setErr(XMLP.ERR_ATT_VALUES);
                    }
                attrval = attrMatch[1];
                }
            else { // accommodate insanity on unvalued IE attributes
                attrval = attrname;
                valRegex = attrStartRegex;
                }
            if (!this.m_attributes[attrname]) {
                this.m_attributes[attrname] = attrval;
                }
            else { 
                return this._setErr(XMLP.ERR_ATT_DUP);
            }
            this.m_iP = valRegex.lastIndex;
                
            }
        }
    if (strN.indexOf("<") != -1) { 
        return this._setErr(XMLP.ERR_ELM_LT_NAME);
        }

    this.m_name = strN; 
    this.m_iP = iE + 1;
    // Check for corrupted "closed tags" from innerHTML
    if (XMLP.closedTags[strN]) {
        closeRegex.lastIndex = iE + 1;
        var closeMatch = closeRegex.exec;
        if (closeMatch) {
            var matchclose = this.m_xml.indexOf(strN, closeMatch.lastIndex);
            if (matchclose === closeMatch.lastIndex) {
                return iType; // bail out, a valid close tag is separated only by whitespace
            }
            else {
                return XMLP._ELM_EMP;
            }
        }
    }
    this.m_emitSynthetic = false;
    return iType;
    };
})();
    
XMLP.prototype._parseCDATA = function(iB) { 
    var iE = this.m_xml.indexOf("]]>", iB); 
    if (iE == -1) { return this._setErr(XMLP.ERR_CLOSE_CDATA);}
    this._setContent(XMLP._CONT_XML, iB, iE); 
    this.m_iP = iE + 3; 
    return XMLP._CDATA;
    };
    
XMLP.prototype._parseComment = function(iB) { 
    var iE = this.m_xml.indexOf("-" + "->", iB); 
    if (iE == -1) { 
        return this._setErr(XMLP.ERR_CLOSE_COMMENT);
        }
    this._setContent(XMLP._CONT_XML, iB - 4, iE + 3); 
    this.m_iP = iE + 3; 
    return XMLP._COMMENT;
    };
    
XMLP.prototype._parseDTD = function(iB) { 
    var iE, strClose, iInt, iLast; 
    iE = this.m_xml.indexOf(">", iB); 
    if (iE == -1) { 
        return this._setErr(XMLP.ERR_CLOSE_DTD);
        }
    iInt = this.m_xml.indexOf("[", iB); 
    strClose = ((iInt != -1) && (iInt < iE)) ? "]>" : ">"; 
    while (true) { 
        if (iE == iLast) { 
            return this._setErr(XMLP.ERR_INFINITELOOP);
            }
        iLast = iE; 
        iE = this.m_xml.indexOf(strClose, iB); 
        if(iE == -1) { 
            return this._setErr(XMLP.ERR_CLOSE_DTD);
            }
        if (this.m_xml.substring(iE - 1, iE + 2) != "]]>") { break;}
        }
    this.m_iP = iE + strClose.length; 
    return XMLP._DTD;
    };
    
XMLP.prototype._parsePI = function(iB) { 
    var iE, iTB, iTE, iCB, iCE; 
    iE = this.m_xml.indexOf("?>", iB); 
    if (iE == -1) { return this._setErr(XMLP.ERR_CLOSE_PI);}
    iTB = SAXStrings.indexOfNonWhitespace(this.m_xml, iB, iE); 
    if (iTB == -1) { return this._setErr(XMLP.ERR_PI_TARGET);}
    iTE = SAXStrings.indexOfWhitespace(this.m_xml, iTB, iE); 
    if (iTE == -1) { iTE = iE;}
    iCB = SAXStrings.indexOfNonWhitespace(this.m_xml, iTE, iE); 
    if (iCB == -1) { iCB = iE;}
    iCE = SAXStrings.lastIndexOfNonWhitespace(this.m_xml, iCB, iE); 
    if (iCE == -1) { iCE = iE - 1;}
    this.m_name = this.m_xml.substring(iTB, iTE); 
    this._setContent(XMLP._CONT_XML, iCB, iCE + 1); 
    this.m_iP = iE + 2; 
    return XMLP._PI;
    };
    
XMLP.prototype._parseText = function(iB) { 
    var iE = this.m_xml.indexOf("<", iB);
    if (iE == -1) { iE = this.m_xml.length;}
    this._setContent(XMLP._CONT_XML, iB, iE); 
    this.m_iP = iE; 
    return XMLP._TEXT;
    };
    
XMLP.prototype._setContent = function(iSrc) { 
    var args = arguments; 
    if (XMLP._CONT_XML == iSrc) { 
        this.m_cAlt = null; 
        this.m_cB = args[1]; 
        this.m_cE = args[2];
        } 
    else { 
        this.m_cAlt = args[1]; 
        this.m_cB = 0; 
        this.m_cE = args[1].length;
        }
        
    this.m_cSrc = iSrc;
    };
    
XMLP.prototype._setErr = 
    function(iErr) { 
    var strErr = XMLP._errs[iErr]; 
    this.m_cAlt = strErr; 
    this.m_cB = 0; 
    this.m_cE = strErr.length; 
    this.m_cSrc = XMLP._CONT_ALT; 
    return XMLP._ERROR;
    };
    


SAXStrings = {};

SAXStrings.WHITESPACE = " \t\n\r"; 
SAXStrings.QUOTES = "\"'"; 
SAXStrings.getColumnNumber = function (strD, iP) { 
    if (!strD) { return -1;}
    iP = iP || strD.length; 
    var arrD = strD.substring(0, iP).split("\n"); 
    arrD.length--; 
    var iLinePos = arrD.join("\n").length; 
    return iP - iLinePos;
    };
    
SAXStrings.getLineNumber = function (strD, iP) { 
    if (!strD) { return -1;}
    iP = iP || strD.length; 
    return strD.substring(0, iP).split("\n").length;
    };
    
SAXStrings.indexOfNonWhitespace = function (strD, iB, iE) {
    if (!strD) return -1;
    iB = iB || 0; 
    iE = iE || strD.length; 
    
    for (var i = iB; i < iE; ++ i) { 
        var c = strD.charAt(i);
        if (c !== ' ' && c !== '\t' && c !== '\n' && c !== '\r') return i;
        }
    return -1;
    };
    
    
SAXStrings.indexOfWhitespace = function (strD, iB, iE) { 
    if (!strD) { return -1;}
        iB = iB || 0; 
        iE = iE || strD.length; 
        for (var i = iB; i < iE; i++) { 
            if (SAXStrings.WHITESPACE.indexOf(strD.charAt(i)) != -1) { return i;}
        }
    return -1;
    };
    
    
SAXStrings.lastIndexOfNonWhitespace = function (strD, iB, iE) { 
        if (!strD) { return -1;}
        iB = iB || 0; iE = iE || strD.length; 
        for (var i = iE - 1; i >= iB; i--) { 
        if (SAXStrings.WHITESPACE.indexOf(strD.charAt(i)) == -1) { 
            return i;
            }
        }
    return -1;
    };
    
SAXStrings.replace = function(strD, iB, iE, strF, strR) { 
    if (!strD) { return "";}
    iB = iB || 0; 
    iE = iE || strD.length; 
    return strD.substring(iB, iE).split(strF).join(strR);
    };
/*
Copyright 2008-2009 University of Cambridge
Copyright 2008-2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery*/
/*global fluid_1_2*/

fluid_1_2 = fluid_1_2 || {};

(function ($, fluid) {
    
  fluid.parseTemplate = function(template, baseURL, scanStart, cutpoints_in, opts) {
      opts = opts || {};
    
      var t;
      var parser;
      var tagstack;
      var lumpindex = 0;
      var nestingdepth = 0;
      var justended = false;
      
      var defstart = -1;
      var defend = -1;   
      
      var parseOptions = opts;
      
      var baseURL;
      
      var debugMode = false;
      
      var cutpoints = []; // list of selector, tree, id
      
      var cutstatus = [];
      
      XMLLump = function (lumpindex, nestingdepth) {
          return {
            //rsfID: "",
            //text: "",
            //downmap: {},
            //attributemap: {},
            //finallump: {},
            nestingdepth: nestingdepth,
            lumpindex: lumpindex,
            parent: t
          };
        };
      
      function init(baseURLin, debugModeIn, cutpointsIn) {
        t.rootlump = XMLLump(0, -1);
        tagstack = [t.rootlump];
        lumpindex = 0;
        nestingdepth = 0;
        justended = false;
        defstart = -1;
        defend = -1;
        baseURL = baseURLin;
        debugMode = debugModeIn;
        cutpoints = cutpointsIn;
        if (cutpoints) {
          for (var i = 0; i < cutpoints.length; ++ i) {
            cutstatus[i] = [];
            cutpoints[i].tree = fluid.parseSelector(cutpoints[i].selector);
            }
          }
        }
      
      function findTopContainer() {
        for (var i = tagstack.length - 1; i >= 0; --i ) {
          var lump = tagstack[i];
          if (lump.rsfID !== undefined) {
            return lump;
          }
        }
        return t.rootlump;
      }
      
      function newLump() {
          var togo = XMLLump(lumpindex, nestingdepth);
          if (debugMode) {
              togo.line = parser.getLineNumber();
              togo.column = parser.getColumnNumber();
          }
          //togo.parent = t;
          t.lumps[lumpindex] = togo;
          ++lumpindex;
          return togo;
      }
      
      function addLump(mmap, ID, lump) {
          var list = mmap[ID];
              if (!list) {
                  list = [];
                  mmap[ID] = list;
              }
              list[list.length] = lump;
          }
        
      function checkContribute(ID, lump) {
          if (ID.indexOf("scr=contribute-") !== -1) {
              var scr = ID.substring("scr=contribute-".length);
              addLump(t.collectmap, scr, lump);
              }
          }
      
      function debugLump(lump) {
        // TODO expand this to agree with the Firebug "self-selector" idiom
          return "<" + lump.tagname + ">";
          }
      
      function hasCssClass(clazz, totest) {
        if (!totest) {
            return false;
        }
        // algorithm from JQuery
        return (" " + totest + " ").indexOf(" " + clazz + " ") !== -1;
        }
      
      function matchNode(term, headlump) {
        if (term.predList) {
          for (var i = 0; i < term.predList.length; ++ i) {
            var pred = term.predList[i];
            if (pred.id && headlump.attributemap.id !== pred.id) {return false;}
            if (pred.clazz && !hasCssClass(pred.clazz, headlump.attributemap["class"])) {return false;}
            if (pred.tag && headlump.tagname !== pred.tag) {return false;}
            }
          return true;
          }
        }
      
      function tagStartCut(headlump) {
        var togo = undefined;
        if (cutpoints) {
          for (var i = 0; i < cutpoints.length; ++ i) {
            var cut = cutpoints[i];
            var cutstat = cutstatus[i];
            var nextterm = cutstat.length; // the next term for this node
            if (nextterm < cut.tree.length) {
              var term = cut.tree[nextterm];
              if (nextterm > 0) {
                if (cut.tree[nextterm - 1].child && 
                  cutstat[nextterm - 1] !== headlump.nestingdepth - 1) {
                  continue; // it is a failure to match if not at correct nesting depth 
                  }
                }
              var isMatch = matchNode(term, headlump);
              if (isMatch) {
                cutstat[cutstat.length] = headlump.nestingdepth;
                if (cutstat.length === cut.tree.length) {
                  if (togo !== undefined) {
                    fluid.fail("Cutpoint specification error - node " +
                      debugLump(headlump) +
                      " has already matched with rsf:id of " + togo);
                    }
                  if (cut.id === undefined || cut.id === null) {
                      fluid.fail("Error in cutpoints list - entry at position " + i + " does not have an id set");
                  }
                  togo = cut.id;
                  }
                }
              }
            }
          }
        return togo;
        }
        
      function tagEndCut() {
        if (cutpoints) {
          for (var i = 0; i < cutpoints.length; ++ i) {
            var cutstat = cutstatus[i];
            if (cutstat.length > 0 && cutstat[cutstat.length - 1] === nestingdepth) {
              cutstat.length--;
              }
            }
          }
        }
      
      function processTagStart(isempty, text) {
        ++nestingdepth;
        if (justended) {
          justended = false;
          var backlump = newLump();
          backlump.nestingdepth--;
        }
        if (t.firstdocumentindex === -1) {
          t.firstdocumentindex = lumpindex;
        }
        var headlump = newLump();
        var stacktop = tagstack[tagstack.length - 1];
        headlump.uplump = stacktop;
        var tagname = parser.getName();
        headlump.tagname = tagname;
        // NB - attribute names and values are now NOT DECODED!!
        var attrs = headlump.attributemap = parser.m_attributes;
        var ID = attrs[fluid.ID_ATTRIBUTE];
        if (ID === undefined) {
          ID = tagStartCut(headlump);
          }
        for (var attrname in attrs) {
          var attrval = attrs[attrname];
          if (ID === undefined) {
            if (/href|src|codebase|action/.test(attrname)) {
              ID = "scr=rewrite-url";
              }
              // port of TPI effect of IDRelationRewriter
            else if (ID === undefined && /for|headers/.test(attrname)) {
              ID = "scr=null";
              }
            }
          }
    
        if (ID) {
          // TODO: ensure this logic is correct on RSF Server
          if (ID.charCodeAt(0) === 126) { // "~"
            ID = ID.substring(1);
            headlump.elide = true;
          }
          checkContribute(ID, headlump);
          headlump.rsfID = ID;
          var downreg = findTopContainer();
          if (!downreg.downmap) {
            downreg.downmap = {};
            }
          addLump(downreg.downmap, ID, headlump);
          addLump(t.globalmap, ID, headlump);
          var colpos = ID.indexOf(":");
          if (colpos !== -1) {
          var prefix = ID.substring(0, colpos);
          if (!stacktop.finallump) {
            stacktop.finallump = {};
            }
          stacktop.finallump[prefix] = headlump;
          }
        }
        
        // TODO: accelerate this by grabbing original template text (requires parser
        // adjustment) as well as dealing with empty tags
        headlump.text = "<" + tagname + fluid.dumpAttributes(attrs) + ">";
        tagstack[tagstack.length] = headlump;
        if (isempty) {
          processTagEnd();
        }
      }
      
      function processTagEnd() {
        tagEndCut();
        var endlump = newLump();
        --nestingdepth;
        endlump.text = "</" + parser.getName() + ">";
        var oldtop = tagstack[tagstack.length - 1];
        oldtop.close_tag = t.lumps[lumpindex - 1];
        tagstack.length --;
        justended = true;
      }
      
      function processDefaultTag() {
        if (defstart !== -1) {
          if (t.firstdocumentindex === -1) {
            t.firstdocumentindex = lumpindex;
            }
          var text = parser.getContent().substr(defstart, defend - defstart);
          justended = false;
          var newlump = newLump();
          newlump.text = text; 
          defstart = -1;
        }
      }
   
   /** ACTUAL BODY of fluid.parseTemplate begins here **/
      
    t = fluid.XMLViewTemplate();
    
    init(baseURL, opts.debugMode, cutpoints_in);

    var idpos = template.indexOf(fluid.ID_ATTRIBUTE);
    if (scanStart) {
      var brackpos = template.indexOf('>', idpos);
      parser = new XMLP(template.substring(brackpos + 1));
    }
    else {
      parser = new XMLP(template); 
      }

    parseloop: while(true) {
      var iEvent = parser.next();
      switch(iEvent) {
        case XMLP._ELM_B:
          processDefaultTag();
          //var text = parser.getContent().substr(parser.getContentBegin(), parser.getContentEnd() - parser.getContentBegin());
          processTagStart(false, "");
          break;
        case XMLP._ELM_E:
          processDefaultTag();
          processTagEnd();
          break;
        case XMLP._ELM_EMP:
          processDefaultTag();
          //var text = parser.getContent().substr(parser.getContentBegin(), parser.getContentEnd() - parser.getContentBegin());    
          processTagStart(true, "");
          break;
        case XMLP._PI:
        case XMLP._DTD:
          defstart = -1;
          continue; // not interested in reproducing these
        case XMLP._TEXT:
        case XMLP._ENTITY:
        case XMLP._CDATA:
        case XMLP._COMMENT:
          if (defstart === -1) {
            defstart = parser.m_cB;
            }
          defend = parser.m_cE;
          break;
        case XMLP._ERROR:
          fluid.setLogging(true);
          var message = "Error parsing template: " + parser.m_cAlt + 
          " at line " + parser.getLineNumber(); 
          fluid.log(message);
          fluid.log("Just read: " + parser.m_xml.substring(parser.m_iP - 30, parser.m_iP));
          fluid.log("Still to read: " + parser.m_xml.substring(parser.m_iP, parser.m_iP + 30));
          fluid.fail(message);
          break parseloop;
        case XMLP._NONE:
          break parseloop;
        }
      }
    processDefaultTag();
    var excess = tagstack.length - 1; 
    if (excess) {
        fluid.fail("Error parsing template - unclosed tag(s) of depth " + (excess) + 
           ": " + fluid.transform(tagstack.splice(1, excess), function(lump) {return debugLump(lump);}).join(", "));
    }
    return t;
    };
  
    fluid.debugLump = function(lump) {
        var togo = lump.text;
        togo += " at ";
        togo += "lump line " + lump.line + " column " + lump.column +" index " + lump.lumpindex;
        togo += lump.parent.href === null? "" : " in file " + lump.parent.href;
        return togo;
    };
  
  // Public definitions begin here
  
  fluid.ID_ATTRIBUTE = "rsf:id";
  
  fluid.getPrefix = function(id) {
   var colpos = id.indexOf(':');
   return colpos === -1? id : id.substring(0, colpos);
   };
  
  fluid.SplitID = function(id) {
    var that = {};
    var colpos = id.indexOf(':');
    if (colpos === -1) {
      that.prefix = id;
      }
    else {
      that.prefix = id.substring(0, colpos);
      that.suffix = id.substring(colpos + 1);
     }
     return that;
  };
  
  fluid.XMLViewTemplate = function() {
    return {
      globalmap: {},
      collectmap: {},
      lumps: [],
      firstdocumentindex: -1
    };
  };
  
  /** Accepts a hash of structures with free keys, where each entry has either
   * href or nodeId set - on completion, callback will be called with the populated
   * structure with fetched resource text in the field "resourceText" for each
   * entry.
   */
  fluid.fetchResources = function(resourceSpecs, callback) {
    var resourceCallback = function (thisSpec) {
      return {
        success: function(response) {
          thisSpec.resourceText = response;
          thisSpec.resourceKey = thisSpec.href;
          thisSpec.queued = false; 
          fluid.fetchResources(resourceSpecs, callback);
          },
        error: function(response, textStatus, errorThrown) {
          thisSpec.fetchError = {
            status: response.status,
            textStatus: response.textStatus,
            errorThrown: errorThrown
            };
          thisSpec.queued = false;
          fluid.fetchResources(resourceSpecs, callback);
          }
          
        };
      };
    
    var complete = true;
    for (var key in resourceSpecs) {
      var resourceSpec = resourceSpecs[key];
      if (resourceSpec.href && !(resourceSpec.resourceKey || resourceSpec.fetchError)) {
         if (!resourceSpec.queued) {
           var thisCallback = resourceCallback(resourceSpec);
           var options = {url: resourceSpec.href, success: thisCallback.success, error: thisCallback.error}; 
           $.extend(true, options, resourceSpec.options);
           resourceSpec.queued = true;
           $.ajax(options);
         }
         if (resourceSpec.queued) {
           complete = false;
         }             
        }
      else if (resourceSpec.nodeId && !resourceSpec.resourceText) {
        var node = document.getElementById(resourceSpec.nodeId);
        // upgrade this to somehow detect whether node is "armoured" somehow
        // with comment or CDATA wrapping
        resourceSpec.resourceText = fluid.dom.getElementText(node);
        resourceSpec.resourceKey = resourceSpec.nodeId;
      }
    }
    if (complete && !resourceSpecs.callbackCalled) {
      resourceSpecs.callbackCalled = true;
      if ($.browser.mozilla) {
      // Defer this callback to avoid debugging problems on Firefox
      setTimeout(function() {
          callback(resourceSpecs);
          }, 1);
      }
      else {
          callback(resourceSpecs)
      }
    }
  };
  
    // TODO: find faster encoder
  fluid.XMLEncode = function (text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); 
    };
  
  fluid.dumpAttributes = function(attrcopy) {
    var togo = "";
    for (var attrname in attrcopy) {
      var attrvalue = attrcopy[attrname];
      if (attrvalue !== null && attrvalue !== undefined) {
          togo += " " + attrname + "=\"" + attrvalue + "\"";
          }
      }
    return togo;
    };
  
  fluid.aggregateMMap = function (target, source) {
    for (var key in source) {
      var targhas = target[key];
      if (!targhas) {
        target[key] = [];
      }
      target[key] = target[key].concat(source[key]);
    }
  };

  
  
  /** Returns a "template structure", with globalmap in the root, and a list
   * of entries {href, template, cutpoints} for each parsed template.
   */
  fluid.parseTemplates = function(resourceSpec, templateList, opts) {
    var togo = [];
    opts = opts || {};
    togo.globalmap = {};
    for (var i = 0; i < templateList.length; ++ i) {
      var resource = resourceSpec[templateList[i]];
      var lastslash = resource.href.lastIndexOf("/");
      var baseURL = lastslash === -1? "" : resource.href.substring(0, lastslash + 1);
        
        var template = fluid.parseTemplate(resource.resourceText, baseURL, 
          opts.scanStart && i === 0, resource.cutpoints, opts);
        if (i === 0) {
          fluid.aggregateMMap(togo.globalmap, template.globalmap);
        }
        template.href = resource.href;
        template.baseURL = baseURL;
        template.resourceKey = resource.resourceKey;

        togo[i] = template;
        fluid.aggregateMMap(togo.globalmap, template.rootlump.downmap);
      }
      return togo;
    };

  // ******* SELECTOR ENGINE *********  
    
  // selector regexps copied from JQuery
  var chars = "(?:[\\w\u0128-\uFFFF*_-]|\\\\.)";
  var quickChild = new RegExp("^>\\s*(" + chars + "+)");
  var quickID = new RegExp("^(" + chars + "+)(#)(" + chars + "+)");
  var selSeg = new RegExp("^\s*([#.]?)(" + chars + "*)");

  var quickClass = new RegExp("([#.]?)(" + chars + "+)", "g");
  var childSeg = new RegExp("\\s*(>)?\\s*", "g");
  var whiteSpace = new RegExp("^\\w*$");

  fluid.parseSelector = function(selstring) {
    var togo = [];
    selstring = $.trim(selstring);
    //ws-(ss*)[ws/>]
    quickClass.lastIndex = 0;
    var lastIndex = 0;
    while (true) {
      var atNode = []; // a list of predicates at a particular node
      while (true) {
        var segMatch = quickClass.exec(selstring);
        if (!segMatch || segMatch.index !== lastIndex) {
          break;
          }
        var thisNode = {};
        var text = segMatch[2];
        if (segMatch[1] === "") {
          thisNode.tag = text;
        }
        else if (segMatch[1] === "#"){
          thisNode.id = text;
          }
        else if (segMatch[1] === ".") {
          thisNode.clazz = text;
          }
        atNode[atNode.length] = thisNode;
        lastIndex = quickClass.lastIndex;
        }
      childSeg.lastIndex = lastIndex;
      var fullAtNode = {predList: atNode};
      var childMatch = childSeg.exec(selstring);
      if (!childMatch || childMatch.index !== lastIndex) {
        var remainder = selstring.substring(lastIndex);
        fluid.fail("Error in selector string - can not match child selector expression at " + remainder);
        }
      if (childMatch[1] === ">") {
        fullAtNode.child = true;
        }
      togo[togo.length] = fullAtNode;
      // >= test here to compensate for IE bug http://blog.stevenlevithan.com/archives/exec-bugs
      if (childSeg.lastIndex >= selstring.length) {
        break;
        }
      lastIndex = childSeg.lastIndex;
      quickClass.lastIndex = childSeg.lastIndex; 
      }
    return togo;
    };
    
})(jQuery, fluid_1_2);
/*
Copyright 2008-2009 University of Cambridge
Copyright 2008-2009 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery*/
/*global fluid_1_2*/

fluid_1_2 = fluid_1_2 || {};

(function ($, fluid) {
  
  function debugPosition(component) {
      return "as child of " + (component.parent.fullID? "component with full ID " + component.parent.fullID : "root");
  }
  
  function computeFullID(component) {
      var togo = "";
      var move = component;
      if (component.children === undefined) { // not a container
          // unusual case on the client-side, since a repetitive leaf may have localID blasted onto it.
          togo = component.ID + (component.localID !== undefined? component.localID : "");
          move = component.parent;
          }
      while (move.parent) {
          var parent = move.parent;
          if (move.fullID !== undefined) {
              togo = move.fullID + togo;
              return togo;
          }
          if (move.noID === undefined) {
              var ID = move.ID;
              if (ID === undefined) {
                  fluid.fail("Error in component tree - component found with no ID " +
                    debugPosition(parent) + ": please check structure");
              }
              var colpos = ID.indexOf(":");        
              var prefix = colpos === -1? ID : ID.substring(0, colpos);
              togo = prefix + ":" + (move.localID === undefined ? "" : move.localID) + ":" + togo;
          }
          move = parent;
      }
      return togo;
  }

  var renderer = {};
  
  renderer.isBoundPrimitive = function(value) {
      return fluid.isPrimitive(value) || value instanceof Array 
             && (value.length === 0 || typeof(value[0]) === "string");
  }
  
  function processChild(value, key) {
      if (renderer.isBoundPrimitive(value)) {
          return {componentType: "UIBound", value: value, ID: key};
          }
      else {
          var unzip = unzipComponent(value);
          if (unzip.ID) {
              return {ID: key, componentType: "UIContainer", children: [unzip]};
          }
          else {
              unzip.ID = key;
              return unzip;
          } 
      }    
  }
  
  function fixChildren(children) {
      if (!(children instanceof Array)) {
          var togo = [];
          for (var key in children) {
              var value = children[key];
              if (value instanceof Array) {
                  for (var i = 0; i < value.length; ++ i) {
                      var processed = processChild(value[i], key);
          //            if (processed.componentType === "UIContainer" &&
          //              processed.localID === undefined) {
          //              processed.localID = i;
          //            }
                      togo[togo.length] = processed;
                      }
                }
                else {
                    togo[togo.length] = processChild(value, key);
                } 
            }
            return togo;
        }
        else {return children;}
    }
  
  function fixupValue(uibound, model) {
      if (uibound.value === undefined && uibound.valuebinding !== undefined) {
          if (!model) {
              fluid.fail("Cannot perform value fixup for valuebinding " 
                + uibound.valuebinding + " since no model was supplied to rendering");
          }
          uibound.value = fluid.model.getBeanValue(model, uibound.valuebinding);
      }
  }
  
  function upgradeBound(holder, property, model) {
      if (holder[property] !== undefined) {
          if (renderer.isBoundPrimitive(holder[property])) {
              holder[property] = {value: holder[property]};
          }
          else if (holder[property].messagekey) {
              holder[property].componentType = "UIMessage";
          }
      }
      else {
          holder[property] = {value: null};
      }
      fixupValue(holder[property], model);
  }
  
  var duckMap = {children: "UIContainer", 
        value: "UIBound", valuebinding: "UIBound", messagekey: "UIMessage", 
        markup: "UIVerbatim", selection: "UISelect", target: "UILink",
        choiceindex: "UISelectChoice", functionname: "UIInitBlock"};
  
  renderer.inferComponentType = function(component) {
      for (var key in duckMap) {
          if (component[key] !== undefined) {
              component.componentType = duckMap[key];
              break;
          }
      }
      if (component.componentType === undefined && component.ID !== undefined) {
          component.componentType = "UIBound";
      }
  }    
  
  function unzipComponent(component, model) {
      if (component) {
          renderer.inferComponentType(component);
      }
      if (!component || component.componentType === undefined) {
          var decorators = component.decorators;
          if (decorators) {delete component.decorators;}
          component = {componentType: "UIContainer", children: component};
          component.decorators = decorators;
      }
      var cType = component.componentType;
      if (cType === "UIContainer") {
          component.children = fixChildren(component.children);
      }
      else if (cType === "UISelect") {
          upgradeBound(component, "selection", model);
          upgradeBound(component, "optionlist", model);
          upgradeBound(component, "optionnames", model);
      }
      else if (cType === "UILink") {
          upgradeBound(component, "target", model);
          upgradeBound(component, "linktext", model);
      }
      else if (cType === "UIVerbatim") {
          upgradeBound(component, "markup", model);
      }
      
      return component;
  }
  
  // When a component
  function assignSubmittingName(component, defaultname) {
      if (component.submittingname === undefined && component.willinput !== false) {
          component.submittingname = defaultname? defaultname: component.fullID;
      }
      return component.submittingname;
  }
  
  function fixupTree(tree, model) {
    if (tree.componentType === undefined) {
      tree = unzipComponent(tree, model);
      }
    if (tree.componentType !== "UIContainer" && !tree.parent) {
      tree = {children: [tree]};
    }
    
    if (tree.children) {
       tree.childmap = {};
      for (var i = 0; i < tree.children.length; ++ i) {
        var child = tree.children[i];
        if (child.componentType === undefined) {
          child = unzipComponent(child, model);
          tree.children[i] = child;
          }
        child.parent = tree;
        if (child.ID === undefined) {
           fluid.fail("Error in component tree: component found with no ID " + debugPosition(child));
        }
        tree.childmap[child.ID] = child;
        var colpos = child.ID.indexOf(":"); 
        if (colpos === -1) {
        //  tree.childmap[child.ID] = child; // moved out of branch to allow
        // "relative id expressions" to be easily parsed
        }
        else {
          var prefix = child.ID.substring(0, colpos);
          var childlist = tree.childmap[prefix]; 
          if (!childlist) {
            childlist = [];
            tree.childmap[prefix] = childlist;
          }
          if (child.localID === undefined && childlist.length !== 0) {
              child.localID = childlist.length;
          }
          childlist[childlist.length] = child;
        }
        child.fullID = computeFullID(child);

        var componentType = child.componentType;
        if (componentType == "UISelect") {
          child.selection.fullID = child.fullID + "-selection";
        }
        else if (componentType == "UIInitBlock") {
          var call = child.functionname + '(';
          for (var j = 0; j < child.arguments.length; ++ j) {
            if (child.arguments[j] instanceof fluid.ComponentReference) {
              // TODO: support more forms of id reference
              child.arguments[j] = child.parent.fullID + child.arguments[j].reference;
            }
            call += JSON.stringify(child.arguments[j]); 
            if (j < child.arguments.length - 1) {
              call += ", ";
            }
          }
          child.markup = {value: call + ")\n"};
          child.componentType = "UIVerbatim";
          }
        else if (componentType == "UIBound") {
            fixupValue(child, model);
            }
        fixupTree(child, model);
        }
      }
    return tree;
    }
    
  fluid.NULL_STRING = "\u25a9null\u25a9";
  
  var LINK_ATTRIBUTES = {
      a: "href", link: "href", img: "src", frame: "src", script: "src", style: "src", input: "src", embed: "src",
      form: "action",
      applet: "codebase", object: "codebase"
  };
  
  fluid.renderer = function(templates, tree, options, fossilsIn) {
    
      options = options || {};
      tree = tree || {};
      debugMode = options.debugMode;
      if (!options.messageLocator && options.messageSource) {
          options.messageLocator = fluid.resolveMessageSource(options.messageSource);
      }
      options.document = options.document || document;
      
      var directFossils = fossilsIn || {}; // map of submittingname to {EL, submittingname, oldvalue}
    
      var globalmap = {};
      var branchmap = {};
      var rewritemap = {}; // map of rewritekey (for original id in template) to full ID 
      var seenset = {};
      var collected = {};
      var out = "";
      var renderOptions = options;
      var decoratorQueue = [];
      
      var renderedbindings = {}; // map of fullID to true for UISelects which have already had bindings written
      
      var that = {};
      
      function getRewriteKey(template, parent, id) {
          return template.resourceKey + parent.fullID + id;
      }
      // returns: lump
      function resolveInScope(searchID, defprefix, scope, child) {
          var deflump;
          var scopelook = scope? scope[searchID] : null;
          if (scopelook) {
              for (var i = 0; i < scopelook.length; ++ i) {
                  var scopelump = scopelook[i];
                  if (!deflump && scopelump.rsfID == defprefix) {
                      deflump = scopelump;
                  }
                  if (scopelump.rsfID == searchID) {
                      return scopelump;
                  }
              }
          }
          return deflump;
      }
      // returns: lump
      function resolveCall(sourcescope, child) {
          var searchID = child.jointID? child.jointID : child.ID;
          var split = fluid.SplitID(searchID);
          var defprefix = split.prefix + ':';
          var match = resolveInScope(searchID, defprefix, sourcescope.downmap, child);
          if (match) {return match;}
          if (child.children) {
              match = resolveInScope(searchID, defprefix, globalmap, child);
              if (match) {return match;}
          }
          return null;
      }
      
      function noteCollected(template) {
          if (!seenset[template.href]) {
              fluid.aggregateMMap(collected, template.collectmap);
              seenset[template.href] = true;
          }
      }
      
      function resolveRecurse(basecontainer, parentlump) {
          for (var i = 0; i < basecontainer.children.length; ++ i) {
              var branch = basecontainer.children[i];
              if (branch.children) { // it is a branch
                  var resolved = resolveCall(parentlump, branch);
                  if (resolved) {
                      branchmap[branch.fullID] = resolved;
                      var id = resolved.attributemap.id;
                      if (id !== undefined) {
                        rewritemap[getRewriteKey(parentlump.parent, basecontainer, id)] = branch.fullID;
                      }
                      // on server-side this is done separately
                      noteCollected(resolved.parent);
                      resolveRecurse(branch, resolved);
                  }
              }
          }
          // collect any rewritten ids for the purpose of later rewriting
          if (parentlump.downmap) {
              for (var id in parentlump.downmap) {
                //if (id.indexOf(":") === -1) {
                  var lumps = parentlump.downmap[id];
                  for (var i = 0; i < lumps.length; ++ i) {
                      var lump = lumps[i];
                      var lumpid = lump.attributemap.id;
                      if (lumpid !== undefined && lump.rsfID !== undefined) {
                          var resolved = fetchComponent(basecontainer, lump.rsfID);
                          if (resolved !== null) {
                              var resolveID = resolved.fullID;
                              if (resolved.componentType === "UISelect") {
                                resolveID = resolveID + "-selection";
                              }
                              rewritemap[getRewriteKey(parentlump.parent, basecontainer,
                                  lumpid)] = resolveID;
                          }
                      }
                  }
              //  }
              } 
          }
          
      }
      
      function resolveBranches(globalmapp, basecontainer, parentlump) {
          branchmap = {};
          rewritemap = {};
          seenset = {};
          collected = {};
          globalmap = globalmapp;
          branchmap[basecontainer.fullID] = parentlump;
          resolveRecurse(basecontainer, parentlump);
      }
      
      function dumpBranchHead(branch, targetlump) {
          if (targetlump.elide) {
              return;
          }
          var attrcopy = {};
          $.extend(true, attrcopy, targetlump.attributemap);
          adjustForID(attrcopy, branch);
          outDecorators(branch, attrcopy);
          out += "<" + targetlump.tagname + " ";
          out += fluid.dumpAttributes(attrcopy);
          out += ">";
      }
      
      function dumpTillLump(lumps, start, limit) {
          for (; start < limit; ++ start) {
              var text = lumps[start].text;
              if (text) { // guard against "undefined" lumps from "justended"
                  out += lumps[start].text;
              }
          }
      }
    
      function dumpScan(lumps, renderindex, basedepth, closeparent, insideleaf) {
          var start = renderindex;
          while (true) {
              if (renderindex === lumps.length) {
                  break;
              }
              var lump = lumps[renderindex];
              if (lump.nestingdepth < basedepth) {
                  break;
              }
              if (lump.rsfID !== undefined) {
                if (!insideleaf) {break;}
                if (insideleaf && lump.nestingdepth > basedepth + (closeparent?0:1) ) {
                  fluid.log("Error in component tree - leaf component found to contain further components - at " +
                      lump.toString());
                }
                else {break;}
              }
              // target.print(lump.text);
              ++renderindex;
          }
          // ASSUMPTIONS: close tags are ONE LUMP
          if (!closeparent && (renderindex == lumps.length || !lumps[renderindex].rsfID)) {
              --renderindex;
          }
          
          dumpTillLump(lumps, start, renderindex);
          //target.write(buffer, start, limit - start);
          return renderindex;
      }
      // In RSF Client, this is a "flyweight" "global" object that is reused for every tag, 
      // to avoid generating garbage. In RSF Server, it is an argument to the following rendering
      // methods of type "TagRenderContext".
      
      var trc = {};
      
      /*** TRC METHODS ***/
      
      function openTag() {
          if (!trc.iselide) {
              out += "<" + trc.uselump.tagname;
          }
      }
      
      function closeTag() {
          if (!trc.iselide) {
              out += "</" + trc.uselump.tagname + ">";
          }
      }
    
      function renderUnchanged() {
          // TODO needs work since we don't keep attributes in text
          dumpTillLump(trc.uselump.parent.lumps, trc.uselump.lumpindex + 1,
              trc.close.lumpindex + (trc.iselide ? 0 : 1));
      }
      
      function replaceAttributes() {
          if (!trc.iselide) {
              out += fluid.dumpAttributes(trc.attrcopy);
          }
          dumpTemplateBody();
      }
    
      function replaceAttributesOpen() {
          if (trc.iselide) {
              replaceAttributes();
          }
          else {
              out += fluid.dumpAttributes(trc.attrcopy);
              // TODO: the parser does not ever produce empty tags
              out += // trc.endopen.lumpindex === trc.close.lumpindex ? "/>" :
                    ">";
        
              trc.nextpos = trc.endopen.lumpindex;
          }
      }
    
      function dumpTemplateBody() {
          // TODO: Think about bringing fastXmlPull into version management
          if (trc.endopen.lumpindex === trc.close.lumpindex && XMLP.closedTags[trc.uselump.tagname]) {
              if (!trc.iselide) {
                  out += "/>";
              }
          }
          else {
              if (!trc.iselide) {
                  out += ">";
              }
          dumpTillLump(trc.uselump.parent.lumps, trc.endopen.lumpindex,
              trc.close.lumpindex + (trc.iselide ? 0 : 1));
          }
      }
    
      function rewriteLeaf(value) {
          if (isValue(value)) {
              replaceBody(value);
          }
          else {
              replaceAttributes();
          }
      }
    
      function rewriteLeafOpen(value) {
          if (trc.iselide) {
              rewriteLeaf(trc.value);
          }
          else {
              if (isValue(value)) { 
                  replaceBody(value);
              }
              else {
                  replaceAttributesOpen();
              }
          }
      }
      
      function replaceBody(value) {
          out += fluid.dumpAttributes(trc.attrcopy);
          if (!trc.iselide) {
              out += ">";
          }
          out += fluid.XMLEncode(value.toString());
          closeTag();
      }
      
      /*** END TRC METHODS**/
      
      function isValue(value) {
          return value !== null && value !== undefined && !isPlaceholder(value);
      }
      
      function isPlaceholder(value) {
          // TODO: equivalent of server-side "placeholder" system
          return false;
      }
      
      function rewriteUrl(template, url) {
          if (renderOptions.urlRewriter) {
              var rewritten = renderOptions.urlRewriter(url);
              if (rewritten) {
                  return rewritten;
              }
          }
          if (!renderOptions.rebaseURLs) {
              return url;
          }
          var protpos = url.indexOf(":/");
          if (url.charAt(0) === '/' || protpos !== -1 && protpos < 7) {
              return url;
          }
          else {
              return renderOptions.baseURL + url;
          }
      }
      
      function dumpHiddenField(/** UIParameter **/ todump) {
          out += "<input type=\"hidden\" ";
          var isvirtual = todump.virtual;
          var outattrs = {};
          outattrs[isvirtual? "id" : "name"] = todump.name;
          outattrs.value = todump.value;
          out += fluid.dumpAttributes(outattrs);
          out += " />\n";
      }
      
      function applyAutoBind(torender, finalID) {
          var tagname = trc.uselump.tagname;
          var applier = renderOptions.applier;
          function applyFunc() {
              fluid.applyChange(fluid.byId(finalID), undefined, applier);
              }
          if (renderOptions.autoBind && /input|select|textarea/.test(tagname) 
                && !renderedbindings[finalID]) {
              var decorators = [{jQuery: ["change", applyFunc]}];
              // Work around bug 193: http://webbugtrack.blogspot.com/2007/11/bug-193-onchange-does-not-fire-properly.html
              if ($.browser.msie && tagname === "input" 
                  && /radio|checkbox/.test(trc.attrcopy.type)) {
                  decorators.push({jQuery: ["click", applyFunc]});
              }
              if ($.browser.safari && tagname === "input" && trc.attrcopy.type === "radio") {
                  decorators.push({jQuery: ["keyup", applyFunc]});
              }
              outDecoratorsImpl(torender, decorators, trc.attrcopy, finalID);
          }    
      }
      
      function dumpBoundFields(/** UIBound**/ torender, parent) {
          if (torender) {
              var holder = parent? parent : torender;
              if (directFossils && holder.submittingname && holder.valuebinding) {
                // TODO: this will store multiple times for each member of a UISelect
                  directFossils[holder.submittingname] = {
                    name: holder.submittingname,
                    EL: holder.valuebinding,
                    oldvalue: holder.value};
                // But this has to happen multiple times
                  applyAutoBind(torender, torender.fullID);
              }
              if (torender.fossilizedbinding) {
                  dumpHiddenField(torender.fossilizedbinding);
              }
              if (torender.fossilizedshaper) {
                  dumpHiddenField(torender.fossilizedshaper);
              }
          }
      }
      
      function dumpSelectionBindings(uiselect) {
          if (!renderedbindings[uiselect.selection.fullID]) {
              renderedbindings[uiselect.selection.fullID] = true; // set this true early so that selection does not autobind twice
              dumpBoundFields(uiselect.selection);
              dumpBoundFields(uiselect.optionlist);
              dumpBoundFields(uiselect.optionnames);
          }
      }
        
      function isSelectedValue(torender, value) {
          var selection = torender.selection;
          return selection.value && typeof(selection.value) !== "string" && typeof(selection.value.length) === "number" ? 
                $.inArray(value, selection.value, value) !== -1 :
                   selection.value === value;
      }
      
      function getRelativeComponent(component, relativeID) {
          component = component.parent;
          while (relativeID.indexOf("..::") === 0) {
              relativeID = relativeID.substring(4);
              component = component.parent;
          }
          return component.childmap[relativeID];
      }
      
      function explodeDecorators(decorators) {
          var togo = [];
          if (decorators.type) {
              togo[0] = decorators;
          }
          else {
              for (var key in decorators) {
                  if (key === "$") {key = "jQuery";}
                  var value = decorators[key];
                  var decorator = {
                    type: key
                  };
                  if (key === "jQuery") {
                      decorator.func = value[0];
                      decorator.args = value.slice(1);
                  }
                  else if (key === "addClass" || key === "removeClass") {
                      decorator.classes = value;
                  }
                  else if (key === "attrs") {
                      decorator.attributes = value;
                  }
                  else if (key === "identify") {
                      decorator.key = value;
                  }
                  togo[togo.length] = decorator;
              }
          }
          return togo;
      }
      
      function outDecoratorsImpl(torender, decorators, attrcopy, finalID) {
          renderOptions.idMap = renderOptions.idMap || {};
          for (var i = 0; i < decorators.length; ++ i) {
              var decorator = decorators[i];
              var type = decorator.type;
              if (!type) {
                  var explodedDecorators = explodeDecorators(decorator);
                  outDecoratorsImpl(torender, explodedDecorators, attrcopy, finalID);
                  continue;
              }
              if (type === "$") {type = decorator.type = "jQuery";}
              if (type === "jQuery" || type === "event" || type === "fluid") {
                  var id = adjustForID(attrcopy, torender, true, finalID);
                  decorator.id = id;
                  decoratorQueue[decoratorQueue.length] = decorator;
              }
              // honour these remaining types immediately
              else if (type === "attrs") {
                  $.extend(true, attrcopy, decorator.attributes);
              }
              else if (type === "addClass" || type === "removeClass") {
                  var fakeNode = {
                    nodeType: 1,
                    className: attrcopy["class"] || ""
                  };
                  $(fakeNode)[type](decorator.classes);
                  attrcopy["class"] = fakeNode.className;
              }
              else if (type === "identify") {
                  var id = adjustForID(attrcopy, torender, true, finalID);
                  renderOptions.idMap[decorator.key] = id;
              }
              else {
                  fluid.log("Unrecognised decorator of type " + type + " found at component of ID " + finalID);
              }
          }
      }
      
      function outDecorators(torender, attrcopy) {
          if (!torender.decorators) {return;}
          if (torender.decorators.length === undefined) {
              torender.decorators = explodeDecorators(torender.decorators);
          }
          outDecoratorsImpl(torender, torender.decorators, attrcopy);
      }
      
      function resolveArgs(args) {
          if (!args) {return args};
          return fluid.transform(args, function(arg, index) {
              upgradeBound(args, index, renderOptions.model);
              return args[index].value;
          });
      }
      
      function degradeMessage(torender) {
          if (torender.componentType === "UIMessage") {
              // degrade UIMessage to UIBound by resolving the message
              torender.componentType = "UIBound";
              if (!renderOptions.messageLocator) {
                 torender.value = "[No messageLocator is configured in options - please consult documentation on options.messageSource]";
              }
              else {
                 upgradeBound(torender, "messagekey", renderOptions.model);
                 var resArgs = resolveArgs(torender.args);
                 torender.value = renderOptions.messageLocator(torender.messagekey.value, resArgs);
              }
          }
      }  
      
        
      function renderComponent(torender) {
          var attrcopy = trc.attrcopy;
          var lumps = trc.uselump.parent.lumps;
          var lumpindex = trc.uselump.lumpindex;
          
          degradeMessage(torender);
          var componentType = torender.componentType;
          var tagname = trc.uselump.tagname;
          
          outDecorators(torender, attrcopy);
          
          function makeFail(torender, end) {
              fluid.fail("Error in component tree - UISelectChoice with id " + torender.fullID + end);
          } 
          
          if (componentType === "UIBound" || componentType === "UISelectChoice") {
              var parent;
              if (torender.choiceindex !== undefined) {
                  if (torender.parentFullID) {
                      parent = getAbsoluteComponent(view, torender.parentFullID);
                      if (!parent) {
                          makeFail(torender, " has parentFullID of " + torender.parentFullID + " which cannot be resolved");
                      }
                  }
                  else if (torender.parentRelativeID !== undefined){
                      parent = getRelativeComponent(torender, torender.parentRelativeID);
                      if (!parent) {
                          makeFail(torender, " has parentRelativeID of " + torender.parentRelativeID + " which cannot be resolved");
                      }
                  }
                  else {
                      makeFail(torender, " does not have either parentFullID or parentRelativeID set");
                  }
                  assignSubmittingName(parent.selection);
                  dumpSelectionBindings(parent);
              }
      
              var submittingname = parent? parent.selection.submittingname : torender.submittingname;
              if (tagname === "input" || tagname === "textarea") {
                  if (!parent) {
                      submittingname = assignSubmittingName(torender);
                  }
                  if (submittingname !== undefined) {
                      attrcopy.name = submittingname;
                      }
                  }
              // this needs to happen early on the client, since it may cause the allocation of the
              // id in the case of a "deferred decorator". However, for server-side bindings, this 
              // will be an inappropriate time, unless we shift the timing of emitting the opening tag.
              dumpBoundFields(torender, parent? parent.selection : null);
        
              if (typeof(torender.value) === 'boolean' || attrcopy.type === "radio" 
                     || attrcopy.type === "checkbox") {
                  var underlyingValue;
                  var directValue = torender.value;
                  
                  if (torender.choiceindex !== undefined) {
                      if (!parent.optionlist.value) {
                          fluid.fail("Error in component tree - selection control with full ID " + parent.fullID + " has no values");
                      }
                      underlyingValue = parent.optionlist.value[torender.choiceindex];
                      directValue = isSelectedValue(parent, underlyingValue);
                  }
                  if (isValue(directValue)) {
                      if (directValue) {
                          attrcopy.checked = "checked";
                          }
                      else {
                          delete attrcopy.checked;
                          }
                      }
                  attrcopy.value = underlyingValue? underlyingValue: "true";
                  rewriteLeaf(null);
              }
              else if (torender.value instanceof Array) {
                  // Cannot be rendered directly, must be fake
                  renderUnchanged();
              }
              else { // String value
                  var value = parent? 
                      parent[tagname === "textarea" || tagname === "input" ? "optionlist" : "optionnames"].value[torender.choiceindex] : 
                        torender.value;
                  if (tagname === "textarea") {
                      if (isPlaceholder(value) && torender.willinput) {
                        // FORCE a blank value for input components if nothing from
                        // model, if input was intended.
                        value = "";
                      }
                    rewriteLeaf(value);
                  }
                  else if (tagname === "input") {
                      if (torender.willinput || isValue(value)) {
                          attrcopy.value = value;
                      }
                      rewriteLeaf(null);
                  }
                  else {
                      delete attrcopy.name;
                      rewriteLeafOpen(value);
                  }
              }
          }
          else if (componentType === "UISelect") {
              // need to do this first to see whether we need to write out an ID or not
              applyAutoBind(torender, torender.selection.fullID);
              //if (attrcopy.id) {
                // TODO: This is an irregularity, should probably remove for 0.8
                //attrcopy.id = torender.selection.fullID;
                //}
              var ishtmlselect = tagname === "select";
              var ismultiple = false;
        
              if (torender.selection.value instanceof Array) {
                  ismultiple = true;
                  if (ishtmlselect) {
                      attrcopy.multiple = "multiple";
                      }
                  }
              // since in HTML this name may end up in a global namespace, we make sure to take account
              // of any uniquifying done by adjustForID upstream of applyAutoBind
              assignSubmittingName(torender.selection, attrcopy.id);
              if (ishtmlselect) {
                  // The HTML submitted value from a <select> actually corresponds
                  // with the selection member, not the top-level component.
                  if (torender.selection.willinput !== false) {
                    attrcopy.name = torender.selection.submittingname;
                  }
              }
              out += fluid.dumpAttributes(attrcopy);
              if (ishtmlselect) {
                  out += ">";
                  var values = torender.optionlist.value;
                  var names = torender.optionnames === null || torender.optionnames === undefined || !torender.optionnames.value ? values: torender.optionnames.value;
                  if (!names || !names.length) {
                      fluid.fail("Error in component tree - UISelect component with fullID " 
                          + torender.fullID + " does not have optionnames set");
                  }
                  for (var i = 0; i < names.length; ++i) {
                      out += "<option value=\"";
                      var value = values[i];
                      if (value === null) {
                          value = fluid.NULL_STRING;
                      }
                      out += fluid.XMLEncode(value);
                      if (isSelectedValue(torender, value)) {
                          out += "\" selected=\"selected";
                          }
                      out += "\">";
                      out += fluid.XMLEncode(names[i]);
                      out += "</option>\n";
                  }
                  closeTag();
              }
              else {
                dumpTemplateBody();
              }
              dumpSelectionBindings(torender);
          }
          else if (componentType === "UILink") {
              var attrname = LINK_ATTRIBUTES[tagname];
              if (attrname) {
                  degradeMessage(torender.target);
                  var target = torender.target.value;
                  if (!isValue(target)) {
                      target = attrcopy[attrname];
                  }
                  target = rewriteUrl(trc.uselump.parent, target);
                  attrcopy[attrname] = target;
              }
              var value;
              if (torender.linktext) { 
                  degradeMessage(torender.linktext);
                  var value = torender.linktext.value;
              }
              if (!isValue(value)) {
                  replaceAttributesOpen();
              }
              else {
                  rewriteLeaf(value);
              }
          }
          
          else if (torender.markup !== undefined) { // detect UIVerbatim
              degradeMessage(torender.markup);
              var rendered = torender.markup.value;
              if (rendered === null) {
                // TODO, doesn't quite work due to attr folding cf Java code
                  out += fluid.dumpAttributes(attrcopy);
                  out +=">";
                  renderUnchanged(); 
              }
              else {
                  if (!trc.iselide) {
                      out += fluid.dumpAttributes(attrcopy);
                      out += ">";
                  }
                  out += rendered;
                  closeTag();
                  }
              }
          else {
                
          }
      }
      
      function adjustForID(attrcopy, component, late, forceID) {
          if (!late) {
              delete attrcopy["rsf:id"];
          }
          if (forceID !== undefined) {
              attrcopy.id = forceID;
          }
          else {
              if (attrcopy.id || late) {
                  attrcopy.id = component.fullID;
              }
          }
          var count = 1;
          var baseid = attrcopy.id;
          while (renderOptions.document.getElementById(attrcopy.id)) {
              attrcopy.id = baseid + "-" + (count++); 
          }
          return attrcopy.id;
      }
      
      function rewriteIDRelation(context) {
          var attrname;
          var attrval = trc.attrcopy["for"];
          if (attrval !== undefined) {
               attrname = "for";
          }
          else {
              attrval = trc.attrcopy.headers;
              if (attrval !== undefined) {
                  attrname = "headers";
              }
          }
          if (!attrname) {return;}
          var tagname = trc.uselump.tagname;
          if (attrname === "for" && tagname !== "label") {return;}
          if (attrname === "headers" && tagname !== "td" && tagname !== "th") {return;}
          var rewritten = rewritemap[getRewriteKey(trc.uselump.parent, context, attrval)];
          if (rewritten !== undefined) {
              trc.attrcopy[attrname] = rewritten;
          }
      }
      
      function renderComment(message) {
          out += ("<!-- " + fluid.XMLEncode(message) + "-->");
      }
      
      function renderDebugMessage(message) {
          out += "<span style=\"background-color:#FF466B;color:white;padding:1px;\">";
          out += message;
          out += "</span><br/>";
      }
      
      function reportPath(/*UIComponent*/ branch) {
          var path = branch.fullID;
          return !path ? "component tree root" : "full path " + path;
      }
      
      function renderComponentSystem(context, torendero, lump) {
        var lumpindex = lump.lumpindex;
        var lumps = lump.parent.lumps;
        var nextpos = -1;
        var outerendopen = lumps[lumpindex + 1];
        var outerclose = lump.close_tag;
    
        nextpos = outerclose.lumpindex + 1;
    
        var payloadlist = lump.downmap? lump.downmap["payload-component"] : null;
        var payload = payloadlist? payloadlist[0] : null;
        
        var iselide = lump.rsfID.charCodeAt(0) === 126; // "~"
        
        var endopen = outerendopen;
        var close = outerclose;
        var uselump = lump;
        var attrcopy = {};
        $.extend(true, attrcopy, (payload === null? lump : payload).attributemap);
        
        trc.attrcopy = attrcopy;
        trc.uselump = uselump;
        trc.endopen = endopen;
        trc.close = close;
        trc.nextpos = nextpos;
        trc.iselide = iselide;
        
        rewriteIDRelation(context);
        
        if (torendero === null) {
            if (lump.rsfID.indexOf("scr=") === (iselide? 1 : 0)) {
                var scrname = lump.rsfID.substring(4 + (iselide? 1 : 0));
                if (scrname === "ignore") {
                    nextpos = trc.close.lumpindex + 1;
                }
                else if (scrname === "rewrite-url") {
                    torendero = {componentType: "UILink", target: {}};
                }
                else {
                    openTag();
                    replaceAttributesOpen();
                    nextpos = trc.endopen.lumpindex;
                }
            }
        }
        if (torendero !== null) {
          // else there IS a component and we are going to render it. First make
          // sure we render any preamble.
    
          if (payload) {
            trc.endopen = lumps[payload.lumpindex + 1];
            trc.close = payload.close_tag;
            trc.uselump = payload;
            dumpTillLump(lumps, lumpindex, payload.lumpindex);
            lumpindex = payload.lumpindex;
          }
    
          adjustForID(attrcopy, torendero);
          //decoratormanager.decorate(torendero.decorators, uselump.getTag(), attrcopy);
    
          
          // ALWAYS dump the tag name, this can never be rewritten. (probably?!)
          openTag();
    
          renderComponent(torendero);
          // if there is a payload, dump the postamble.
          if (payload !== null) {
            // the default case is initialised to tag close
            if (trc.nextpos === nextpos) {
              dumpTillLump(lumps, trc.close.lumpindex + 1, outerclose.lumpindex + 1);
            }
          }
          nextpos = trc.nextpos;
          }
      return nextpos;
      }
      
      function renderContainer(child, targetlump) {
          var t2 = targetlump.parent;
          var firstchild = t2.lumps[targetlump.lumpindex + 1];
          if (child.children !== undefined) {
              dumpBranchHead(child, targetlump);
          }
          else {
              renderComponentSystem(child.parent, child, targetlump);
          }
          renderRecurse(child, targetlump, firstchild);
      }
      
      function fetchComponent(basecontainer, id, lump) {
          if (id.indexOf("msg=") === 0) {
              var key = id.substring(4);
              return {componentType: "UIMessage", messagekey: key};
          }
          while (basecontainer) {
              var togo = basecontainer.childmap[id];
              if (togo) {
                  return togo;
              }
              basecontainer = basecontainer.parent;
          }
          return null;
      }
    
      function fetchComponents(basecontainer, id) {
          var togo;
          while (basecontainer) {
              togo = basecontainer.childmap[id];
              if (togo) {
                  break;
              }
              basecontainer = basecontainer.parent;
          }
          return togo;
      }
    
      function findChild(sourcescope, child) {
          var split = fluid.SplitID(child.ID);
          var headlumps = sourcescope.downmap[child.ID];
          if (headlumps === null) {
              headlumps = sourcescope.downmap[split.prefix + ":"];
          }
          return headlumps === null ? null : headlumps[0];
      }
      
      function renderRecurse(basecontainer, parentlump, baselump) {
        var renderindex = baselump.lumpindex;
        var basedepth = parentlump.nestingdepth;
        var t1 = parentlump.parent;
        if (debugMode) {
            var rendered = {};
        }
        while (true) {
          renderindex = dumpScan(t1.lumps, renderindex, basedepth, !parentlump.elide, false);
          if (renderindex === t1.lumps.length) { 
            break;
          }
          var lump = t1.lumps[renderindex];      
          var id = lump.rsfID;
          // new stopping rule - we may have been inside an elided tag
          if (lump.nestingdepth < basedepth || id === undefined) {
            break;
          } 
    
          if (id.charCodeAt(0) === 126) { // "~"
            id = id.substring(1);
          }
          
          //var ismessagefor = id.indexOf("message-for:") === 0;
          
          if (id.indexOf(':') !== -1) {
            var prefix = fluid.getPrefix(id);
            var children = fetchComponents(basecontainer, prefix);
            
            var finallump = lump.uplump.finallump[prefix];
            var closefinal = finallump.close_tag;
            
            if (children) {
              for (var i = 0; i < children.length; ++ i) {
                var child = children[i];
                if (child.children) { // it is a branch 
                  if (debugMode) {
                      rendered[child.fullID] = true;
                  }
                  var targetlump = branchmap[child.fullID];
                  if (targetlump) {
                      if (debugMode) {
                          renderComment("Branching for " + child.fullID + " from "
                              + fluid.debugLump(lump) + " to " + fluid.debugLump(targetlump));
                      }
                      
                      renderContainer(child, targetlump);
                      
                      if (debugMode) {
                          renderComment("Branch returned for " + child.fullID
                              + fluid.debugLump(lump) + " to " + fluid.debugLump(targetlump));
                    }
                  }
                  else if (debugMode){
                        renderDebugMessage(
                          "No matching template branch found for branch container with full ID "
                              + child.fullID
                              + " rendering from parent template branch "
                              + fluid.debugLump(baselump));
                  }
                }
                else { // repetitive leaf
                  var targetlump = findChild(parentlump, child);
                  if (!targetlump) {
                      if (debugMode) {
                          renderDebugMessage(
                            "Repetitive leaf with full ID " + child.fullID
                            + " could not be rendered from parent template branch "
                            + fluid.debugLump(baselump));
                      }
                    continue;
                  }
                  var renderend = renderComponentSystem(basecontainer, child, targetlump);
                  var wasopentag = renderend < t1.lumps.lengtn && t1.lumps[renderend].nestingdepth >= targetlump.nestingdepth;
                  var newbase = child.children? child : basecontainer;
                  if (wasopentag) {
                    renderRecurse(newbase, targetlump, t1.lumps[renderend]);
                    renderend = targetlump.close_tag.lumpindex + 1;
                  }
                  if (i !== children.length - 1) {
                    // TODO - fix this bug in RSF Server!
                    if (renderend < closefinal.lumpindex) {
                      dumpScan(t1.lumps, renderend, targetlump.nestingdepth - 1, false, false);
                    }
                  }
                  else {
                    dumpScan(t1.lumps, renderend, targetlump.nestingdepth, true, false);
                  }
                }
              } // end for each repetitive child
            }
            else {
                if (debugMode) {
                    renderDebugMessage("No branch container with prefix "
                        + prefix + ": found in container "
                        + reportPath(basecontainer)
                        + " rendering at template position " + fluid.debugLump(baselump)
                        + ", skipping");
                }
            }
            
            renderindex = closefinal.lumpindex + 1;
            if (debugMode) {
                renderComment("Stack returned from branch for ID " + id + " to "
                  + fluid.debugLump(baselump) + ": skipping from " + fluid.debugLump(lump)
                  + " to " + fluid.debugLump(closefinal));
              }
          }
          else {
            var component;
            if (id) {
                component = fetchComponent(basecontainer, id, lump);
                if (debugMode && component) {
                    rendered[component.fullID] = true;
                }
            }
            if (component && component.children !== undefined) {
              renderContainer(component);
              renderindex = lump.close_tag.lumpindex + 1;
            }
            else {
              renderindex = renderComponentSystem(basecontainer, component, lump);
            }
          }
          if (renderindex === t1.lumps.length) {
            break;
          }
        }
        if (debugMode) {
          var children = basecontainer.children;
          for (var key = 0; key < children.length; ++key) {
            var child = children[key];
            if (!rendered[child.fullID]) {
                renderDebugMessage("Component "
                  + child.componentType + " with full ID "
                  + child.fullID + " could not be found within template "
                  + fluid.debugLump(baselump));
            }
          }
        }  
        
      }
      
      function renderCollect(collump) {
          dumpTillLump(collump.parent.lumps, collump.lumpindex, collump.close_tag.lumpindex + 1);
      }
      
      // Let us pray
      function renderCollects() {
          for (var key in collected) {
              var collist = collected[key];
              for (var i = 0; i < collist.length; ++ i) {
                  renderCollect(collist[i]);
              }
          }
      }
      
      function processDecoratorQueue() {
          for (var i = 0; i < decoratorQueue.length; ++ i) {
              var decorator = decoratorQueue[i];
              var node = fluid.byId(decorator.id, renderOptions.document);
              if (!node) {
                fluid.fail("Error during rendering - component with id " + decorator.id 
                 + " which has a queued decorator was not found in the output markup");
              }
              if (decorator.type === "jQuery") {
                  var jnode = $(node);
                  jnode[decorator.func].apply(jnode, $.makeArray(decorator.args));
              }
              else if (decorator.type === "fluid") {
                  var args = decorator.args;
                  if (!args) {
                      if (!decorator.container) {
                          decorator.container = node;
                      }
                      args = [decorator.container, decorator.options];
                  }
                  var that = fluid.invokeGlobalFunction(decorator.func, args, fluid);
                  decorator.that = that;
              }
              else if (decorator.type === "event") {
                node[decorator.event] = decorator.handler; 
              }
          }
      }

      that.renderTemplates = function() {
          tree = fixupTree(tree, options.model);
          var template = templates[0];
          resolveBranches(templates.globalmap, tree, template.rootlump);
          renderedbindings = {};
          renderCollects();
          renderRecurse(tree, template.rootlump, template.lumps[template.firstdocumentindex]);
          return out;
      };  
      
      that.processDecoratorQueue = function() {
          processDecoratorQueue();
      }
      return that;
      
  };
  
  jQuery.extend(true, fluid.renderer, renderer);

  fluid.ComponentReference = function(reference) {
      this.reference = reference;
  };
  
  // Explodes a raw "hash" into a list of UIOutput/UIBound entries
  fluid.explode = function(hash, basepath) {
      var togo = [];
      for (var key in hash) {
          var binding = basepath === undefined? key : basepath + "." + key;
          togo[togo.length] = {ID: key, value: hash[key], valuebinding: binding};
      }
      return togo;
    };
    
    
   /**
    * A common utility function to make a simple view of rows, where each row has a selection control and a label
    * @param {Object} optionlist An array of the values of the options in the select
    * @param {Object} opts An object with this structure: {
            selectID: "",         
            rowID: "",            
            inputID: "",
            labelID: ""
        }
    */ 
   fluid.explodeSelectionToInputs = function(optionlist, opts) {
       return fluid.transform(optionlist, function(option, index) {
            return {
              ID: opts.rowID, 
              children: [
                   {ID: opts.inputID, parentRelativeID: "..::" + opts.selectID, choiceindex: index},
                   {ID: opts.labelID, parentRelativeID: "..::" + opts.selectID, choiceindex: index}]
             };
         });
    };
  
      
    /** Converts a data structure consisting of a mapping of keys to message strings,
     * into a "messageLocator" function which maps an array of message codes, to be 
     * tried in sequence until a key is found, and an array of substitution arguments,
     * into a substituted message string.
     */
    fluid.messageLocator = function (messageBase, resolveFunc) {
        resolveFunc = resolveFunc || fluid.stringTemplate;
        return function (messagecodes, args) {
            if (typeof(messagecodes) === "string") {
                messagecodes = [messagecodes];
            }
            for (var i = 0; i < messagecodes.length; ++ i) {
                var code = messagecodes[i];
                var message = messageBase[code];
                if (message === undefined) {
                    continue;
                }
                return resolveFunc(message, args);
            }
            return "[Message string for key " + messagecodes[0] + " not found]";
        };
    };
  
    fluid.resolveMessageSource = function (messageSource) {
        if (messageSource.type === "data") {
            if (messageSource.url === undefined) {
                return fluid.messageLocator(messageSource.messages, messageSource.resolveFunc);
            }
            else {
              // TODO: fetch via AJAX, and convert format if necessary
            }
        }
    };
    
    fluid.renderTemplates = function(templates, tree, options, fossilsIn) {
        var renderer = fluid.renderer(templates, tree, options, fossilsIn);
        var rendered = renderer.renderTemplates();
        return rendered;
    };
    /** A driver to render and bind an already parsed set of templates onto
     * a node. See documentation for fluid.selfRender.
     * @param templates A parsed template set, as returned from fluid.selfRender or 
     * fluid.parseTemplates.
     */
  
    fluid.reRender = function(templates, node, tree, options) {
        options = options || {};
              // Empty the node first, to head off any potential id collisions when rendering
        node = fluid.unwrap(node);
        var lastFocusedElement = fluid.getLastFocusedElement? fluid.getLastFocusedElement() : null;
        var lastId;
        if (lastFocusedElement && fluid.dom.isContainer(node, lastFocusedElement)) {
            lastId = lastFocusedElement.id;
        }
        if ($.browser.msie) {
            $(node).empty(); //- this operation is very slow.
        }
        else {
            node.innerHTML = "";
        }
        var fossils = {};
        var renderer = fluid.renderer(templates, tree, options, fossils);
        var rendered = renderer.renderTemplates();
        if (options.renderRaw) {
            rendered = fluid.XMLEncode(rendered);
            rendered = rendered.replace(/\n/g, "<br/>");
            }
        if (options.model) {
            fluid.bindFossils(node, options.model, fossils);
            }
        if ($.browser.msie) {
          $(node).html(rendered);
        }
        else {
          node.innerHTML = rendered;
        }
        renderer.processDecoratorQueue();
        if (lastId) {
            var element = fluid.byId(lastId);
            if (element) {
                $(element).focus();
            }      
        }
          
        return templates;
    };
  
    function findNodeValue(rootNode) {
        var node = fluid.dom.iterateDom(rootNode, function(node) {
          // NB, in Firefox at least, comment and cdata nodes cannot be distinguished!
            return node.nodeType === 8 || node.nodeType === 4? "stop" : null;
            }, true);
        var value = node.nodeValue;
        if (value.indexOf("[CDATA[") === 0) {
            return value.substring(6, value.length - 2);
        }
        else {
            return value;
        }
    }
  
    fluid.extractTemplate = function(node, armouring) {
        if (!armouring) {
            return node.innerHTML;
        }
        else {
          return findNodeValue(node);
        }
    };
    /** A slightly generalised version of fluid.selfRender that does not assume that the
     * markup used to source the template is within the target node.
     * @param source Either a structure {node: node, armouring: armourstyle} or a string
     * holding a literal template
     * @param target The node to receive the rendered markup
     * @param tree, options, return as for fluid.selfRender
     */
    fluid.render = function(source, target, tree, options) {
        options = options || {};
        var template = source;
        if (typeof(source) === "object") {
            template = fluid.extractTemplate(fluid.unwrap(source.node), source.armouring);
        }
        target = fluid.unwrap(target);
        var resourceSpec = {base: {resourceText: template, 
                            href: ".", resourceKey: ".", cutpoints: options.cutpoints}
                            };
        var templates = fluid.parseTemplates(resourceSpec, ["base"], options);
        return fluid.reRender(templates, target, tree, options);    
    };
    
    /** A simple driver for single node self-templating. Treats the markup for a
     * node as a template, parses it into a template structure, renders it using
     * the supplied component tree and options, then replaces the markup in the 
     * node with the rendered markup, and finally performs any required data
     * binding. The parsed template is returned for use with a further call to
     * reRender.
     * @param node The node both holding the template, and whose markup is to be
     * replaced with the rendered result.
     * @param tree The component tree to be rendered.
     * @param options An options structure to configure the rendering and binding process.
     * @return A templates structure, suitable for a further call to fluid.reRender or
     * fluid.renderTemplates.
     */  
     fluid.selfRender = function(node, tree, options) {
         options = options || {};
         return fluid.render({node: node, armouring: options.armouring}, node, tree, options);
     };

})(jQuery, fluid_1_2);
