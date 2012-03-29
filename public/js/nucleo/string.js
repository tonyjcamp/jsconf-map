    
Nucleo.string = function(string) {

    var original = string;

    return {

        camelize: function(capitalize) {
            capitalize = capitalize || false;
            string = string.toLowerCase();
            var words = string.split('/');
            for (var i = 0; i < words.length; i++) {
                var word = words[i].split('_');
                var initX = ((!capitalize && i + 1 === words.length) ? (1) : (0));
                for (var x = initX; x < word.length; x++) {
                    word[x] = word[x].charAt(0).toUpperCase() + word[x].substring(1);
                }
                words[i] = word.join('');
            }
            string = words.join('::');
            return string;
        },

        capitalize: function() {
            return string.charAt(0).toUpperCase() + string.substr(1).toLowerCase();
        },

        classize: function() {
            return this.camelize(true);
        },

        dashize: function() {
            return string.replace(/([A-Z])/g,
            function($1) {
                return "-" + $1.toLowerCase();
            });
        },

        titlize: function() {
            x = 0;
            string = string.valueOf.toLowerCase();
            while (string.indexOf(" ", x) > 0) {
                if (x == 0) {
                    var convertChar = str.substr(0, 1);
                    var tempString = convertChar.toUpperCase() + str.substring(1, str.length);
                    str = tempString;
                    x = 1;
                } else {
                    var convertChar = str.substr(str.indexOf(" ", x) + 1, 1);
                    var tempString = str.substring(0, str.indexOf(" ", x) + 1) + convertChar.toUpperCase() + str.substring(str.indexOf(" ", x) + 2, str.length);
                    str = tempString;
                    x = str.indexOf(" ", x) + 1;
                }
            }
            return str;
        },

        trim: function() {
            return string.replace(/^\s+|\s+$/g, "");
        }

    };

};
