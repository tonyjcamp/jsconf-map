"@import nucleo/core";


(function() {

    
    var Point = function(x, y) {
        this.x = x;
        this.y = y;
    };

    Point.prototype.add = function(point) {
        return new Point(this.x + point.x, this.y + point.y);
    };

    Point.prototype.apply = function(element) {
        element.style["top"] = this.y + "px";
        element.style["left"] = this.x + "px";
    };
    
    Point.prototype.constrain = function(min, max) {
        if (min.x > max.x || min.y > max.y) return this;
        var x = this.x;
        var y = this.y;
        if (min.x != null) x = Math.max(x, min.x);
        if (max.x != null) x = Math.min(x, max.x);
        if (min.y != null) y = Math.max(y, min.y);
        if (max.y != null) y = Math.min(y, max.y);
        return new Point(x, y);
    };

    Point.prototype.distance = function(point) {
        var a = point.x - this.x;
        var b = point.y - this.y;
        return Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
    };

    Point.prototype.isEqualTo = function(point) {
        if (this == point) return true;
        if (!point || point == null) return false;
        return this.x == point.x && this.y == point.y;
    };

    Point.prototype.isInsideOf = function(topLeft, bottomRight) {
        return (this.x >= topLeft.x) &&
            (this.x <= bottomRight.x) &&
            (this.y >= topLeft.y) &&
            (this.y <= bottomRight.y);
    };

    Point.prototype.max = function(point) {
        var x = Math.max(this.x, point.x);
        var y = Math.max(this.y, point.y);
        return new Point(x, y);
    };

    Point.prototype.offset = function(x, y) {
        return new Point(this.x + x, this.y + y);
    };

    Point.prototype.subtract = function(point) {
        return new Point(this.x - point.x, this.y - point.y);
    };

    Point.prototype.toString = function() {
        return "(" + this.x + "," + this.y + ")";
    };

    Point.fromElement = function(element) {
        if (element.hasOwnProperty("selector")) {
            element = element[0];
        }
        return new Point(element.offsetLeft, element.offsetTop);
    };

    Point.fromEvent = function (event) {
        var x = event.pageX || event.x || event.clientX;
        var y = event.pageY || event.y || event.clientY;
        return new Point(x, y);
    };

    Nucleo.Point = Point;

})();
