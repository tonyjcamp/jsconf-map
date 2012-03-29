"@import vendor/underscore";
"@import vendor/jquery";
"@import vendor/handlebars";


/**
 * Nucleo Architecture Library
 *   Copyright (c) 2011, Ryan Gasparini
 *   Nucleo may be freely distributed under the "Don't use it for evil" license.
 *   Don't take my word for it, learn more at:
 *   http://github.com/rxgx/nucleo.git
 *
 * Heavily influenced by Backbone.js
 *   (c) 2010 Jeremy Ashkenas, DocumentCloud Inc.
 *   Backbone may be freely distributed under the MIT license.
 *   For all details and documentation:
 *   http://documentcloud.github.com/backbone
 */

(function(undefined) {


    var _ = this._,
        slice = Array.prototype.slice;

    
    var Nucleo = (function() {

        return {

            // TODO: Not necessary if we're including the Underscore library.
            has: function(object, property) {
                if (typeof property==="string") {
                    return object.hasOwnProperty(property) && this.exists(object[property]);
                } else {
                    for (var i=0, len=property.length; i<len; i++) {
                        if (!object.hasOwnProperty(property[i]) || !this.exists(object[property])) {
                            return false;
                        }
                    }
                }
            },

            exists: function(object) {
                return object !== "" && object !== null && object !== undefined;
            },
            
            extend: function(destination, source) {
                for (var property in source) {
                    if (source.hasOwnProperty(property)) {
                        destination[property] = source[property];
                    }
                }
                return destination;
            }
            
        };

    })();

    this.Nucleo = Nucleo;



    /**
     *
     * NUCLEO OBJECT
     *
     * Not a class; an object. This is JavaScript! (^_^)
     *
     * get:
     * set:
     *   Project:  SproutCore Metal
     *   Copyright: ©2011 Strobe Inc. and contributors.
     *   License:   Licensed under MIT license
     *
     */
    Nucleo.Object = {

        after: function(scope, origFunc, afterFunc) {
            var params = slice.call(arguments, 3);
            scope[origFunc] = function() {
                var output = origFunc.call(scope, params.concat(slice.call(arguments)));
                afterFunc.call(scope);
                return output;
            };
        },

        before: function(scope, origFunc, beforeFunc) {
             var params = slice.call(arguments, 3);
             scope[origFunc] = function() {
                 beforeFunc.call(scope);
                 return origFunc.call(scope, params.concat(slice.call(arguments)));
             };
         },

        extend: function(object) {

            var self = this;

            object.after = function() {
                var params = slice.call(arguments, 2);
                self.after.call(object, params.unshift(object));
            };

            object.before = function() {
                var params = slice.call(arguments, 2);
                self.before.call(object, params.unshift(object));
            };

            object.get = function(name) {
                return self.get(object, name);
            };

            object.set = function(name, value) {
                self.set(object, name, value);
                return object;
            };

        },

        get: function get(obj, keyName) {
            if (keyName === undefined && 'string' === typeof obj) {
                keyName = obj;
                obj = Nucleo;
            }
            if (!obj) return undefined;
            var ret = obj[keyName];
            if (ret === undefined && 'function' === typeof obj.unknownProperty) {
                ret = obj.unknownProperty(keyName);
            }
            return ret;
        },

        set: function set(obj, keyName, value) {
            if (('object' === typeof obj) && !(keyName in obj)) {
                if ('function' === typeof obj.setUnknownProperty) {
                    obj.setUnknownProperty(keyName, value);
                } else if ('function' === typeof obj.unknownProperty) {
                    obj.unknownProperty(keyName, value);
                } else obj[keyName] = value;
            } else {
                obj[keyName] = value;
            }
            return value;
        }
         
    };



    /**
     * 
     * NUCLEO OBSERVER
     *
     * Provides publish (trigger) and subscribe (listen) functions.
     *
     */
    Nucleo.Observer = (function() {

        var lastUid = -1,
            publish,
            subscriptions = {};

        publish = function(moduleId, topic, params, scope) {
            //console.log("observer.publish", topic, moduleId);
            if (!subscriptions.hasOwnProperty(topic)) {
                return false;
            }
            if (subscriptions)
            var notify = function() {
                var subscribers = subscriptions[topic],
                    throwException = function(e) {
                        return function() {
                            throw e;
                        }
                    };
                for (var moduleId in subscribers) {
                    var callbacks = subscribers[moduleId];
                    for (var i=0, len=callbacks.length; i<len; i++) {
                    //try {
                        if (scope) {
                            callbacks[i].callback.call(scope, topic, params);
                        } else {
                            callbacks[i].callback(topic, params);
                        }
                    /*} catch(e) {
                        console.warn(e);
                        //setTimeout(throwException(e), 0);
                    }*/
                    }
                }
            };
            setTimeout(notify, 0);
            return true;
        };

        return {
            /*
            extend: function(object) {

                var that = this;

                // TODO: This is causing an infinite loop!
                object.publish = function(topic, args, scope) {
                    console.log(" PUBLISH? ", arguments.callee);
                    return this.publish(this.name, topic, args, scope);
                };

                object.subscriptions = [];
                
                object.subscribe = function(topic, callback) {
                    this.subscriptions.push(topic);
                    return that.subscribe(this.name, topic, callback);
                };

                object.unsubscribe = function(topic) {
                    this.subscriptions = _.without(this.subscriptions, topic);
                    return that.unsubscribe(this.name, topic);
                };

                object.unsubscribeAll = function() {
                    this.subscriptions = [];
                    return this.unsubscribeAll();
                };
                
            },*/
            
            getTopics: function() {
                return subscriptions;
            },

            publish: function(moduleId, topic, params, scope) {
                return publish(moduleId, topic, params, scope);
            },

            subscribe: function(moduleId, topic, callback) {
                //console.log("observer.subscribe", topic, moduleId);
                if (!callback || typeof callback !== "function") {
                    console.warn("WARNING!", topic, "callback is not a function in ", moduleId);
                    return false;
                }
                if (!subscriptions.hasOwnProperty(topic)) {
                    subscriptions[topic] = {};
                }
                var token = (++lastUid).toString();
                if (subscriptions[topic][moduleId]) {
                    console.warn("WARNING!", topic, "is already set for", moduleId);
                    return token;
                } else {
                    subscriptions[topic][moduleId] = [];
                }
                subscriptions[topic][moduleId].push({
                    callback: callback,
                    priority: 10,
                    token: token
                });
                return token;
            },

            unsubscribe: function(moduleId, topics) {
                var i, id, len, modules, topic;
                if (typeof topics === "string") {
                    topics = [topics];
                }
                for (i=0, len=topics.length; i<len; i++) {
                    topic = topics[i];
                    if (subscriptions.hasOwnProperty(topic) && subscriptions[topic].hasOwnProperty(moduleId)) {
                        delete subscriptions[topic][moduleId];
                    }
                }
            },

            unsubscribeAll: function() {
                subscriptions = {};
            }

        };

    })();



    /**
     * 
     * NUCLEO MODULE (deprecated from sandbox and renamed to module)
     *
     * A single instance per module to:
     *   provide pub/sub
     *   manage state
     *   interact with DOM
     *   provide services
     *   manage views
     *
     * A sandbox is passed into a views to provide the actions and values necessary for the views to function.
     *
     */
    var Module = {

        addView: function(name, options) {
            options = options || {};
            var obj,
                view;
            obj = Nucleo.App.getView(name);
            if (!obj) {
                return false;
            }
            view = Object.create(obj);
            if (!view.className) {
                view.className = view.name + "-view";
            }
            if (view.selector) {
                view.element = $(view.selector);
            }
            if (!view.element) {
                view.element = document.createElement(view.tagName || "div");
                view.element = $(view.element);
            }
            view.element.addClass(view.className);
            if (options.module) {
                view.module = options.module;
            }
            if (options.name) {
                view.name = options.name;
            }
            if (options.record) {
                view.record = options.record;
                view.record.view = view;
            }
            if (!_.isEmpty(view.events)) {
                view.delegateEvents();
            }
            if (options.container) {
                view.container = options.container;
            }
            view.initialize();
            return view;
        },

        createTopic: function(topic) {
            return this.id + "-" + topic;
        },

        getId: function() {
            return this.id;
        },

        getOption: function(property) {
            if (this.options.hasOwnProperty(property)) {
                return this.options[property];
            } else {
                return null;
            }
        },

        getOptions: function() {
            return this.options;
        },

        getSubscribers: function(topic) {
            return this.topics[topic];
        },

        getModel: function(name) {
            return Nucleo.Models[name];
        },

        publish:function (topic, args, scope) {
            Nucleo.Observer.publish(this.id, topic, args, scope);
        },

        subscribe:function (topic, callback) {
            this.topics.push(topic);
            if (typeof topic !== "string") {
                console.warn("subscribe topic not a string", this.id, topic);
            }
            return Nucleo.Observer.subscribe(this.id, topic, callback);
        },

        topics: [],

        unsubscribe:function (topic) {
            this.topics = _.without(this.topics, topic);
            return Nucleo.Observer.unsubscribe(this.id, topic);
        },

        unsubscribeAll:function () {
            if (this.topics.length < 1) return;
            var temp = this.topics;
            this.topics = [];
            return Nucleo.Observer.unsubscribe(this.id, temp);
        }

    };



    /**
     *
     * Nucleo.View
     *
     * ---------------------
     *
     * Controls the DOM behavior for a module. Each views has assumed methods following a convention:
     *
     *   destroy:    does the same as remove but also sends a DELETE request via the Model
     *   initialize: what to do when a views is instantiated, also known as the constructor
     *   render:     either creates a specified empty tag or renders a template that share's the views's name
     *   empty:      remove everything in the views except the containing element and collect garbage
     *   remove:     remove the entire views and perform garbage collection
     *
     * ---------------------
     *
     */
    var View = {

        isActive: false,
        isVisible: false,
        name: "untitled",

        // TODO: Does this still work?
        // Is "cloning" a good term for elements? Each one must be unique or there are UI problems.
        // View will have same template and perhaps same model attributes, but element must be new or unique.
        clone: function() {
             return new this.constructor({ name: this.name, model: this.record });
        },

        // TODO: Set this up as a wrapper for pub and sub?
        delegateEvents: function(events) {
            events = events || this.events;
            if (_.isEmpty(events)) return;
            // TODO: Backbone removes delegateEvents handler here.
            var callback,
                event,
                matches,
                name,
                selector;
            for (name in events) {
                callback = this[events[name]];
                if (!callback) {
                    // TODO: Try/Catch
                    console.warn("Event '" + events[name] + "' doesn't exist.");
                }
                matches = name.match(/^(\S+)\s*(.*)$/);
                event = matches[1];
                selector = matches[2];
                callback = _.bind(callback, this);
                event += ".delegateEvents" + this.cid;
                if (selector === "") {
                    $(this.element).bind(event, callback);
                } else {
                    $(this.element).delegate(selector, event, callback);
                }
            }
        },

        destroy: function() {
            // TODO: Is the UI providing a confirmation?
            if (this.record) {
                this.record.destroy();
            }
            this.remove();
        },

        empty: function() {
            this.element.empty();
            return this;
        },

        findElements: function() {
            var element = this.element,
                elements = {},
                selectors = this.selectors;
            if (!selectors) {
                return false;
            }
            _.each(selectors, function(selector, name) {
                elements[name] = element.find(selector);
            });
            this.elements = elements;
        },

        getElement: function(name) {
            return name ? this.elements[name] : this.element;
        },

        getTemplate: function(state, data) {
            state = state || "default";
            data = data || this.recordToParams();
            var html = "",
                i,
                len,
                source = this.templates[state],
                template;
                //template = this.template;
            // TODO: Is there a better way to import and call Handlebars?
            // TODO: How to make this better configurable?
            if (!source) {
                template = Handlebars.compile(this.element.html());
            } else {
                template = Handlebars.compile(source);
            }
            if (!Array.isArray(data)) {
                data = [data];
            }
            for (i = 0, len = data.length; i < len; i++) {
                html += template(data[i]);
            }
            return html;
        },

        hide: function() {
            this.element.addClass("hide");
            this.isVisible = false;
        },

        hideElement: function(name) {
            var element = this.getElement(name);
            element.addClass("hide");
            return element;
        },

        initialize: function() {},

        mouseOver: function() {
            this.element.addClass(Nucleo.classes.over);
        },

        mouseOut: function() {
            this.element.removeClass(Nucleo.classes.over);
        },
        
        remove: function() {
            this.element.remove();
            this.isActive = false;
            this.isVisible = false;
            // TODO: For when we use Dojo.
            /*for (var name in this.handlers) {
                if (this.handlers.hasOwnProperty(name)) {
                    dojo.disconnect(this.handlers[name]);
                }
            }*/
            // TODO: Remove from a collection of views? delete Nucleo.Views[clientId];
            return this;
        },

        recordToParams: function() {
            return {};
        },

        render: function() {
            var container = this.container || false,
                method = this.method || "append",
                template = this.getTemplate();
            this.element.html(template);
            if (container) {
                container[method](this.element);
            }
            this.findElements();
            this.isActive = true;
            this.isVisible = true;
            return this;
        },

        show: function() {
            this.element.removeClass("hide");
            this.isVisible = true;
        },

        showElement: function(name) {
            var element = this.getElement(name);
            element.removeClass("hide");
            return element;
        }

    };





    /**
     *
     * Nucleo.App
     *
     * -------------
     *
     * This object handles the registering, starting and stopping modules.
     *
     * -------------
     *
     */
    Nucleo.App = (function() {

        var counter = 0,
            instances = {},
            modules = {},
            views = {};

        return {

            getModule: function(name) {
                return modules[name];
            },

            getView: function(name) {
                if (!views[name]) {
                    return false;
                }
                return views[name];
            },

            initialize: function() {},

            loaded: function() {},

            register: function(name, object) {
                if (!name) return false;
                if (!modules[name]) {
                    object.templates = {};
                    modules[name] = object || {};
                } else {
                    console.warn("You are trying to override an existing module called", name);
                }
            },

            registerView: function(name, object) {
                object = object || {};
                views[name] = Object.create(View);
                var view = views[name];
                Nucleo.extend(view, object);
                view.clientId = _.uniqueId("c");
                view.name = name;
            },

            setTemplate: function(name, template, state) {
                state = state || "default";
                var view = this.getView(name);
                if (view) {
                    if (!view.templates) {
                        view.templates = {};
                    }
                    view.templates[state] = template;
                    //view.template = template;
                }
            },

            start: function(name, options) {
                options = options || {};
                var instance,
                    instanceId = "module-" + counter + "-" + name,
                    module = this.getModule(name);
                if (!module) {
                    return false;
                }
                counter += 1;
                instance = Object.create(Module);
                Nucleo.Object.extend(instance);
                Nucleo.extend(instance, module);
                instances[instanceId] = instance;
                instance.initialize(options);
                instance.id = instanceId;
                return instanceId;
            },

            startAll: function() {
                if (_.isEmptyObject(modules)) {
                    return false;
                }
                for (var name in modules) {
                    if (modules.hasOwnProperty(name)) {
                        this.start(name);
                    }
                }
                return true;
            },

            stop: function(moduleId) {
                if (!moduleId in instances) {
                    return false;
                }
                var instance = instances[moduleId];
                // TODO: Is it necessary to tell the module when it's being terminated?
                if ("shutdown" in instance) {
                    instance.shutdown();
                }
                delete instances[moduleId];
                return true;
            },

            stopAll: function() {
                if (_.isEmpty(instances)) {
                    return false;
                }
                // TODO: If the below is expensive, use a vanilla for loop.
                for (var moduleId in instances) {
                    if (instances.hasOwnProperty(moduleId)) {
                        this.stop(moduleId);
                    }
                }
                return true;
            }

        }

    })();


})();
