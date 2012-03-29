// This isn't used yet.

Nucleo.register('map', {
    
    located: function(geometry) {
        map = Object.create(Nucleo.Google.Map);
        map.render("map_canvas", {
            center: geometry.location,
            zoom: 14,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        });
        var marker = Object.create(Nucleo.Google.Marker);
        marker.initialize({
            animation: google.maps.Animation.DROP,
            position: geometry.location,
            map: map.map,
            title: "FireSky Resort & Spa"
        });
        this.loop();
    },

    loaded: function(place) {
        Nucleo.Google.Geocoder.geocode('firesky', "4925 N Scottsdale Rd, Scottsdale, AZ 85251", located);
    },

    loop: function() {
        if (eats.length > 0) {
            var eat = eats.shift();
            getLocation(eat);
        } else if (bars.length > 0) {
            var club = clubs.shift();
            getLocation(club);
        }
    },

    getLocation: function(record, callback) {
        console.log("getLocation", record.name);
        Nucleo.Google.Geocoder.geocode(record.name, record.address, callback);
    },

    makeMarker: function(geometry) {
        var marker = Object.create(Nucleo.Google.Marker);
        marker.initialize({
            animation: google.maps.Animation.DROP,
            position: geometry.location,
            map: map.map,
            icon: Nucleo.MarkerImages.Blue,
            shadow: Nucleo.MarkerShadow,
            title: ""
        });
        this.loop();
    }
    
});

