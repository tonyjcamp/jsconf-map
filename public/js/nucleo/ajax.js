"@import vendor/jquery";
"@import nucleo/core";

(function() {


    Nucleo.ajax = function(name, url, data) {
        
        var error, params, publish, success;

        publish = function(topic, data) {
            Nucleo.Observer.publish(name, topic, data);
        },

        error = function(jqXHR, textStatus, errorThrown) {
            //console.warn("[Services.Xhr.Error]", arguments);
            publish(name + "Error", errorThrown);
        },

        success = function(data, textStatus, jqXHR) {
            //console.debug("[Services.Xhr.Success]", arguments);
            publish(name + "Success", data);
        },

        params = {
            contentType: "application/json",
            data: JSON.stringify(data),
            dataType: "json",
            error: error,
            processData: false,
            success: success,
            type: "POST",
            url: url
        };

        return $.ajax(params);

    };


})();
