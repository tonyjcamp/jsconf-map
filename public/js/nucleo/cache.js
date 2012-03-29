"@import vendor/jquery";
"@import nucleo/core";


(function() {

    var Cache = function(requestFunction) {
        
        var cache = {};

        return function(key, callback) {

            if (!cache.hasOwnProperty(key)) {
                
                cache[key] = $.Deferred(
                    function(defer) {
                        requestFunction(defer, key);
                    }
                ).promise();
                
            }

            return cache[ key ].done( callback );

        };

    };

    var ImageLoader = Cache(function(defer, url) {

        var image = new Image();

        var cleanUp = function() {
            image.onload  =
            image.onerror =
            image         = null;
        };

        defer.then(cleanUp, cleanUp);
        
        image.onload = function() {
            defer.resolve(url);
        };

        image.onerror = defer.reject;
        image.src = url;
        
        return image;
        
    });
    
    Nucleo.ImageLoader = ImageLoader;
    
})();
