
(function() {
    
    /**
     * Sample Command Queue
     * @param options
     */
    var Queue = function(options) {
        
        this.autoFlushMax   = 5;
        this.autoFlushTime  = 2000;
        this.byId = {};
        this.isRequestOut = false;
        this.isForceFlush = false;
        this.name = "queue";
        this.queued = [];
        this.timer = null;
        this.url = null;

        if (options) this.setOptions(options);

        _.bindAll(this, "beforeFlush", "requestError", "requestSuccess");

        this.subscribe(this.name + "Error", this.requestError);
        this.subscribe(this.name + "Success", this.requestSuccess);

    };

    _.extend(Queue.prototype, {

        addCommand: function(command, forceFlush) {
            console.log("Queue", "addCommand", command, forceFlush);
            forceFlush = forceFlush || false;
            if (_.isArray(command)) {
                this.queued = this.queued.concat(command)
            } else {
                this.queued.push(command);
            }
            if (forceFlush) {
                this.isForceFlush = true;
                this.flushQueue();
            } else {
                this.isForceFlush = false;
                this.restartTimer();
            }
        },

        beforeFlush: function() {
            if (!this.isRequestOut) {
                this.flushQueue();
            }
        },

        clearTimer: function() {
            if (this.timer) {
                clearInterval(this.timer);
                this.timer = null;
            }
        },

        commandError: function(response) {
            console.log("Queue", "commandError", response);
        },

        commandResult: function(response) {
            console.log("Queue", "commandResult", response);
            var command = this.byId[response.cmdId],
                result = {};
            if (command instanceof Nucleo.Command) {
                command = this.byId[response.cmdId];
                if (response.cmdId !== command.id) {
                    console.warn("");
                }
                if (command.action == "create") {
                    result[command.clientId] = response.result;
                } else {
                    result = response.result;
                }
                this.publish(command.getTopic(), result);
                if (command.topic) {
                    this.publish(command.topic, result);
                }
                delete this.byId[command.id];
            } else {
                console.warn("There's no known command for:", response, command);
            }
        },

        flushQueue: function() {
            if (!this.isRequestOut) {
                var command,
                    commands = [],
                    i = 0;
                while (this.queued.length > 0 && (i < this.autoFlushMax || this.isForceFlush)) {
                    command = this.queued.shift();
                    console.log("Queue", "flushQueue", "Adding", command);
                    commands.push(command);
                    this.byId[command.id] = command;
                    command = null;
                    i++;
                }
                if (commands.length > 0) {
                    this.isRequestOut = true;
                    Nucleo.ajax(this.name, this.url, commands);
                }
            } else {
                this.restartTimer();
            }
        },

        publish: function(topic, data) {
            Nucleo.Observer.publish(this.name, topic, data);
        },

        restartTimer: function() {
            this.clearTimer();
            if (this.queued.length > 0) {
                var time = this.isForceFlush ? 200 : this.autoFlushTime;
                this.timer = setInterval(this.beforeFlush, time);
                console.debug("Queue", "restartTimer", this.queued.length + " Items", time + "ms");
            } else {
                this.isForceFlush = false;
            }
        },

        requestError: function(topic, data) {
            //console.log("Queue.ajaxError", data);
            // TODO: Do we try the commands again?
            this.clearTimer();
            this.commandError(data);
        },

        requestSuccess: function(topic, data) {
            //console.log("Queue.ajaxSuccess", data);
            // TODO: Add the console log when in debug mode?
            var command, i, len;
            for (i = 0,len = data.results.length; i < len; i++) {
                command = data.results[i];
                if (command.success) {
                    this.commandResult(command);
                } else {
                    this.commandError(command);
                }
            }
            this.isRequestOut = false;
            this.restartTimer();
        },

        setOptions: function(options) {
            if ("url" in options)  this.url           = options.url;
            if ("max" in options)  this.autoFlushMax  = options.max;
            if ("time" in options) this.autoFlushTime = options.time;
        },

        subscribe: function(topic, callback) {
            Nucleo.Observer.subscribe(this.name, topic, callback);
        }

    });
    
    Nucleo.Queue = Queue;
    
})();
