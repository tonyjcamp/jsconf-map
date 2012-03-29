"@import nucleo/nucleo";


(function() {

    var Command = {

        getTopic: function() {
            return [this.clientId, this.action, "completed"].join("-");
        },

        set: function(key, value) {
            if (key !== "data" && _.contains(["function", "object"], typeof value)) {
                console.warn("A cmd value must be set to string.", key, value);
                return;
            }
            key = Nucleo.string(key).capitalize();
            this.params["cmd" + key] = value;
        },

        /**
         * Set custom per instance fields
         * @param key
         * @param value
         */
        setDataField: function(key, value) {
            this.data[key] = value;
        },

        /**
         * Supply custom toJSON() for JSON.stringify()
         */
        toJSON: function() {
            /*var cmdData = {
             id: this.recordId,
             model: this.model.className
             };
             if (this.recordCid) {
             cmdData.clientId = this.recordCid;
             }*/
            if (!_.isEmpty(this.data)) {
                this.set("data", this.data);
            }
            return this.params;
        }

    };


    Nucleo.Commands = {

        addTo: function(command, params) {
            //var command = new Nucleo.Command("add_to", model, topic);
            // params: [fromModel, fromIds, toModel, toIds]
            command.setDataField("addModel", params.addModel);
            command.setDataField("addIds", params.addIds);
            command.setDataField("toModel", params.toModel);
            command.setDataField("toIds", params.toIds);
            return command;
        },

        create: function(command, params) {
            command.clientId = params.clientId;
            command.setDataField("model", command.model.className);
            command.setDataField("fields", params.fields);
            return command;
        },

        copyTo: function(command, params) {
            command.setDataField("copyIds", params.copyIds);
            command.setDataField("copyModel", params.copyModel);
            command.setDataField("toIds", params.toIds);
            command.setDataField("toModel", params.toModel);
            command.setDataField("insertAt", params.insertAt);
            return command;
        },

        destroy: function(command, params) {
            command.set("action", "delete");
            command.setDataField("model", command.model.className);
            command.setDataField("id", params.id);
            //command.setDataField("ids", params.id);
            return command;
        },

        list: function(command, params) {
            command.setDataField("model", command.model.className);
            if (params.hasOwnProperty("containerId")) {
                command.setDataField("containerId", params.containerId);
                delete params.containerId;
            }
            command.setDataField("options", params);
            return command;
        },

        moveTo: function(command, params) {
            for (var param in params) {
                if (params.hasOwnProperty(param) && params[param]) {
                    command.setDataField(param, params[param]);
                }
            }
            //command.setDataField("moveModel", params.moveModel);
            //command.setDataField("toId", params.toId);
            //command.setDataField("toModel", params.toModel);
            return command;
        },

        register: function(action, model, params, options) {

            if (!action || !model) console.warn("There is either no action or model for this command.", action, model);
            else if (!options) console.warn("There's no options for", action, model.className);
            else console.log("Sending", model.className, action, "to", options);

            var command = Object.create(Command);

            command.data = {};
            command.params = {};

            command.action = action;
            command.id = _.uniqueId();
            command.clientId = "c" + command.id;
            command.model = model;

            command.failure = options.failure;
            command.success = options.success;

            command.set("action", action);
            command.set("id", command.id);

            action = Nucleo.string(action).camelize();

            return this[action](command, params);

        },

        update: function(command, params) {
            console.log("UpdateCommand", params);
            command.setDataField("id", params.id);
            delete params.id;
            command.setDataField("model", command.model.className);
            command.setDataField("fields", params.fields);
            return command;
        },

        updateDisplayOrder: function(command, params) {
            command.setDataField("model", command.model.className);
            for (var param in params) {
                if (params.hasOwnProperty(param)) {
                    command.setDataField(param, params[param]);
                }
            }
            return command;
        }

    };

})();