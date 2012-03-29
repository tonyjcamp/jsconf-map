"@import nucleo/core";


(function(MAPS) {
    
    Nucleo.Google = Nucleo.Google || {};
    
    var InfoWindow = MAPS.InfoWindow; // (options)
    var Location   = MAPS.LatLng;     // (lat, lng)
    var Point      = MAPS.Point;      // (x, y)
    var Size       = MAPS.Size;       // (width, height)
    
    
    var markerSize = new Size(12, 20),
        shadowSize = new Size(22, 30),
        originPoint = new Point(0,0),
        flagpoleBasePoint = new Point(0, 6);

    // These markers are 20 pixels wide by 32 pixels tall.
    Nucleo.MarkerImages = {};
    Nucleo.MarkerImages.Blue = new MAPS.MarkerImage(
    	'http://labs.google.com/ridefinder/images/mm_20_' + 'blue' + '.png',
    	markerSize,
    	originPoint,
    	flagpoleBasePoint
    );

    Nucleo.MarkerImages.Red = new MAPS.MarkerImage(
    	'http://labs.google.com/ridefinder/images/mm_20_' + 'red' + '.png',
    	markerSize,
    	originPoint,
    	flagpoleBasePoint
    );

    Nucleo.MarkerImages.BOOGS = new MAPS.MarkerImage(
      'http://labs.google.com/ridefinder/images/mm_20_' + 'green' + '.png',
      markerSize,
      originPoint,
      flagpoleBasePoint
    );

    Nucleo.MarkerShadow = new MAPS.MarkerImage(
    	'http://labs.google.com/ridefinder/images/mm_20_shadow.png',
    	// The shadow image is larger in the horizontal dimension
    	// while the position and offset are the same as for the main image.
    	shadowSize,
    	originPoint,
    	flagpoleBasePoint
    );

    
    var Geocoder = {
      
      addresses: {},
      
      geocode: function(name, address, callback) {
          if (name in this.addresses) {
              return this.addresses[name];
          }
          this.callback = callback;
          if (!this.geocoder) {
              this.geocoder = new MAPS.Geocoder();
          }
          this.geocoder.geocode(
              {
                  'address': address,
                  'country': "US"
              },
              this.response.bind(this)
          );
      },
    
      response: function(results, status) {
          if (status!=MAPS.GeocoderStatus.ZERO_RESULTS) {
              try {
                    this.callback(results[0].geometry);
                } catch(error) {
                    console.warn("Results weren't found", error, status);
                }
          } else {
              // TODO: Do something constructive.
              console.warn("Geocode was unsuccessful because " + status);
          }
      }
      
    };



    var Map = {
        
      initialize: function() {
          var element = document.createElement("script");
          element.src  = "http://maps.google.com/maps/api/js?sensor=false&callback=initialize";
          element.type = "text/javascript";
          document.getElementsByTagName("body")[0].appendChild(element);
      },
    
      location: function(name, lat, lng) {
          if (!this.locations[name] || (!lat && !lng)) {
              this.locations[name] = new Location(lat, lng);
          }
          return this.markers[name];
      },
      
      locations: {},
    
      marker: function(name, options) {
          if (!this.markers) this.markers = {};
          if (!this.markers[name]) {
              this.markers[name] = new Marker(options);
          }
          return this.markers[name];
      },
    
      render: function(id, options) {
          this.options = options || {};
          this.element = document.getElementById(id);
          if (!this.element) {
              throw Error("Map element doesn't exist.");
          } else {
              this.map = new MAPS.Map(this.element, this.options);
          }
      },
    
      update: function(location, zoom) {
          // TODO: This will update the location or zoom of `this.map`.
      }
    };
    
    
    
    var Marker = {
      
        attach: function(map) {
            this.marker.setMap(map);
            return this;
        },

        hide: function() {
            this.marker.setVisible(false);
            return this;
        },
        
        /**
         * Create a new marker.
         * 
         * @params options { position: myLatlng, map: map, title: "My Marker" }
         *
         */
        initialize: function(options) {
            options = options || {};
            this.marker = new MAPS.Marker(options);
        },

        show: function() {
            this.marker.setVisible(true);
            return this;
        },

        toggleAnimation: function(animiation) {
            if (this.marker.getAnimation()!=null) {
                this.marker.setAnimation(null);
            } else {
                this.marker.setAnimation(MAPS.Animation[animation.toUpperCase()])
            }
        },

        toggleVisible: function() {
            this.marker.setVisible(!this.marker.getVisible());
        }
        
    };
    
    
    
    var MarkerImage = {
        
    };
    
    
    
    Nucleo.Google.Geocoder    = Geocoder;
    Nucleo.Google.Location    = Location;
    Nucleo.Google.Map         = Map;
    Nucleo.Google.Marker      = Marker;
    Nucleo.Google.MarkerImage = MarkerImage;
    
    
})(google.maps);

