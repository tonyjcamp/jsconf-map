"@import nucleo/core";

(function() {
    
    Nucleo.Facebook = function(config) {

        var config = config || {},
            element,
            permissions,
            profile = {},
            session = {},
            status;
            
            // Place the SCRIPT tag include the Facebook API.
            element = document.createElement('script');
            element.src = document.location.protocol + '//connect.facebook.net/en_US/all.js';
            element.async = true;
            document.getElementById('fb-root').appendChild(element);
            
            // Place the fb:login-button on the page.
            var fbLogin = document.getElementById("fb-login");
            var fbLoginButton = document.createElement("fb:login-button");
            fbLoginButton.setAttribute("perms", "user_photos,email,publish_stream");
            fbLoginButton.innerText = "Connect with Facebook";
            fbLogin.appendChild(fbLoginButton);
            
            // Set the Facebook callback function.
            window.fbAsyncInit = statusRequest;
        };
        
    };

    _.extend(Nucleo.Facebook.prototype, {
        
        profileRequest: function() {
            var string = 'SELECT name, pic_square, username, type FROM profile WHERE id=' + session.uid;
            queryApi(string, profileResponse);
        },
      
        profileResponse = function(response) {
            if (response.length) {
                profile = response[0];
                console.log("profile", profile);
                var fbLogin = document.getElementById("fb-login");
                var fbFacepile = document.createElement("fb:facepile");
                fbLogin.appendChild(fbFacepile);
            } else {
              console.log("no response for profile", response);
            }
        },

        queryApi: function(queryString, responseFunction) {
            FB.api({ method: 'fql.query', query: queryString }, responseFunction);
        },
    
        test: function() {
            FB.ui(
                {
                    method: 'feed',
                    name: 'Facebook Dialogs',
                    link: 'http://developers.facebook.com/docs/reference/dialogs/',
                    picture: 'http://fbrell.com/f8.jpg',
                    caption: 'Reference Documentation',
                    description: 'Dialogs provide a simple, consistent interface for applications to interface with users.',
                    message: 'Facebook Dialogs are easy!'
                },
                function(response) {
                    if (response && response.post_id) {
                        alert('Post was published.');
                    } else {
                        alert('Post was not published.');
                    }
                }
            )
        }
    });

})();