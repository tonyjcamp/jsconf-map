"@import nucleo/core";
"@import nucleo/string";
"@import nucleo/ajax";


(function() {

    /**
     *
     * NUCLEO RECORD OBJECT
     *
     * destroy - remove this record from model and send destroy request to server
     * diff    - output only the changed columns
     * get     - return a single column
     * isNew   - boolean result of whether or not the record has changed
     * reset   - undo any changes by restoring the record with the previous values
     * save    - send changed columns to the server
     * set     - change the value of a single column
     * toParam - output the columns as an object
     *
     */
    var Record = {

        changedFields: {},

        cid: _.uniqueId("c"),

        columns: function() {
            return this.model.columns;
        },

        destroy: function(options) {
            if (!this.fields.id) {
                return false;
            }
            return this.model.destroy(this.fields.id, options);
        },

        diff: function() {
            var column,
                output = {};
            if (!this.isChanged) {
                return output;
            }
            for (column in this.changedFields) {
                if (!this.changedFields.hasOwnProperty(column)) continue;
                output[column] = this.fields[column];
            }
            return output;
        },

        get: function(column) {
            return this.fields[column];
        },

        isNew: function() {
            return this.fields.id==null;
        },

        reset: function() {
            this.fields = this.changedFields;
            this.changedFields = {};
            this.isChanged = false;
            return this;
        },

        save: function(options) {
            var method = this.isNew() ? "create" : "update";
            this.model.save(this, method, options);
        },

        set: function(changes, ignoreChanges) {
            ignoreChanges = ignoreChanges || false;
            //this.validate(this.fields, options);
            for (var column in changes) {
                // TODO: Should be looking at the model's column array to keep data clean.
                if (!changes.hasOwnProperty(column)) {
                    continue;
                } else
                //if (this.model.validate && !this.model.validate(column, value)) {
                //    console.warn(column + " doesn't pass validation");
                //}
                if (!ignoreChanges) {
                    this.changedFields[column] = this.fields[column];
                    if (!this.isChanged) this.isChanged = true;
                } else {
                    delete this.changedFields[column];
                    if (this.isChanged) this.isChanged = false;
                }
                this.fields[column] = changes[column];
            }
            return this;
        },

        toParam: function() {
            var output = {};
            output = this.fields;
            return output;
        }

    };



    var Model = {
        
        all: function() {
            return this.findAll();
        },

        clean: function() {
            this.records = [];
        },

        comparator: function(record) {
            return record.get(this.options.sortBy);
        },

        count: function() {
            return this.records.length;
        },

        create: function(data) {
            var record = this.createRecord(this, data);
            if ("recordMethods" in this.options) {
                Nucleo.extend(record, this.options.recordMethods);
            }
            this.records.push(record);
            this.sort();
            this.byCid[record.cid] = record;
            if (data.id) {
                this.byId[data.id] = record;
            }
            return record;
        },

        created: function(topic, data) {
            var cid = Object.keys(data).join(""),
                record = this.byCid[cid];
            record.set(data[cid]);
            this.byId[data[cid].id] = record;
            this.sort();
        },

        createCommand: function(action, params, options) {
            if (!(action && params)) return false;
            var command, forceFlush = false;
            if ("forceFlush" in options) forceFlush = options.forceFlush;
            command = Nucleo.Command.register(action, this, params, options);
            //topic = command.getTopic();
            //if (!_.contains(this.subscriptions, commandTopic)) {
            //    this.subscribe(commandTopic, callback);
            //} else {
            //    console.warn("Model already has topic", commandTopic);
            //}
            Nucleo.xhrQueue.addCommand(command, forceFlush);

        },

        createRecord: function(model, data, options) {
            options = options || {};
            // Create a new record with an empty fields object.
            var record = Object.create(Record);
            record.fields = {};
            // Create a pointer to the model object.
            record.model = model;
            // If we have data, copy the fields to record.
            if (data) {
                record.set(data, true);
            }
            // Return self for chaining.
            return record;
        },

        destroy: function(id, options) {
            options = options || {};
            var destroyed = this.destroyed,
                failure,
                success;
            if ("success" in options) {
                success = options.success;
                options.success = function(topic, data) {
                    console.log("destroy success", topic, "data", data);
                    destroyed(data);
                    success(topic, data);
                };
            }
            if ("failure" in options) {
                failure = options.failure;
                options.failure = function(topic, data) {
                    failure(topic, data);
                };
            }
            this.createCommand("destroy", { id: id }, options);
        },

        destroyed: function(result) {
            var record = this.byId[result];
            this.records.splice(_.indexOf(this.records, record), 1);
            if (result in this.byId) delete this.byId[result];
            if (record.cid in this.byCid) delete this.byCid[record.cid];
        },

        error: function(topic, data) {
            console.warn(" (!) MODEL ERROR (!) ", arguments);
        },

        fetch: function(params, options) {
            options = options || {};
            var fetched = this.fetched,
                failure,
                success;
            if ("success" in options) {
                success = options.success;
                options.success = function(topic, data) {
                    var records = fetched(data);
                    success(topic, records);
                };
            }
            if ("failure" in options) {
                failure = options.failure;
                options.failure = function(topic, data) {
                    failure(topic, data);
                };
            }
            this.createCommand("list", params, options);
        },

        fetched: function(result) {
            var data,
                i,
                len,
                record,
                records = [];
            for (i=0, len=result.length; i<len; i++) {
                data = result[i];
                record = this.find(data.id);
                if (record) {
                    //console.log(" [+]  set record for", data.id);
                    record.set(data);
                } else {
                    //console.log(" [+]  create record for", data.id);
                    this.create(data);
                }
                this.records.push(record);
                var count = this.records.length;
                console.log("fetched count", count);
                records.push(record);
            }
            return records;
        },

        find: function(id) {
            return this.byId[id];
        },

        findAll: function() {
            return this.records;
        },

        initialize: function(options) {
            _.bindAll(this, "comparator", "created", "destroyed", "error", "fetched", "updated", "success");
            this.byId = {};
            this.byCid = {};
            if ("className" in options) {
                this.className = options.className;
            }
            this.name = options.name;
            this.records = [];
            this.options = options;
            if (options.columns) this.columns = _.keys(options.columns);
        },

        save: function(record, action, options) {
            options = options || {};
            var modelFailure,
                modelSuccess,
                params = {},
                viewFailure,
                viewSuccess;
            if (action=="update") {
                modelSuccess = this.updated;
                params.id = record.get("id");
                params.fields = record.diff();
            } else {
                modelSuccess = this.created;
                params.clientId = record.cid;
                params.fields = record.toParams();
            }
            modelFailure = this.error;
            if ("success" in options) {
                viewSuccess = options.success;
                options.success = function(topic, data) {
                    var record = modelSuccess(data);
                    viewSuccess(topic, record);
                };
            } else {
                options.success = modelSuccess;
            }
            if ("failure" in options) {
                viewFailure = options.failure;
                options.failure = function(topic, data) {
                    viewFailure(topic, data);
                };
            } else {
                options.failure = modelFailure;
            }
            this.createCommand(action, params, options);
        },

        saveFailed: function(data) {
            var record = this.byId[data.id];
            record.reset();
        },

        seed: function(data) {
            var record;
            for (var i=0, len=data.length; i<len; i++) {
                record = this.create(data[i]);
                delete data[i];
            }
            this.publish(this.name + "Seeded", this.findAll());
        },

        sort: function() {
            //console.log("SORT BEFORE", this, this.records);
            if (this.options.sortBy) {
                this.records = _.sortBy(this.records, this.comparator);
            }
            //console.log("SORT AFTER", this, this.records);
        },

        success: function(topic, data) {
            console.log("Model", "Default Success", arguments);

            //this.publish();
        },

        updated: function(data) {
            console.log("UPDATED", arguments);
            //var record = this.byId[data.id];
            //record.set(data, true);
            this.sort();
        },

        /*  TEMPORARILY ADDING OBSERVER */

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

        topics:[],

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


    Nucleo.Models = {};


    Nucleo.App.registerModel = function(name, columns, methods, options) {
        options = options || {};
        var model;
        options.columns = columns || {};
        options.name = name;
        name = Nucleo.string(name).classize();
        model = Nucleo.Models[name] = Object.create(Model);
        Nucleo.extend(model, methods);
        Nucleo.Object.extend(model);
        model.initialize(options);
    };

})();
