"@import nucleo/core";
"@import nucleo/ui/point";

(function() {

    var Point = Nucleo.Point;

    var Bounds = function(element, method, isRecursive) {

        if (!element) return false;
        
        var left    = element.clientLeft,
            top     = element.clientTop,
            width   = element.clientWidth,
            height  = element.clientHeight;

        if (method=="offset" || method=="position") {
            left = element.offsetLeft;
            top = element.offsetTop;
            if (method=="offset" && isRecursive) {
                var parent = element.offsetParent;
                while (parent) {
                    left += parent.offsetLeft;
                    top += parent.offsetTop;
                    parent = parent.offsetParent;
                }
            }
        }

        if (method=="position") {
            if (element.style['left']) left = parseInt(element.style['left']);
            if (element.style['right']) top = parseInt(element.style['top']);
        }

        var bottom  = top  + height,
            right   = left + width,
            centerX = left + (width / 2),
            centerY = top  + (height / 2);

        this.bottom      = bottom;
        this.bottomLeft  = new Point(left, bottom);
        this.bottomRight = new Point(right, bottom);
        this.center      = new Point(centerX, centerY);
        this.centerX     = centerX;
        this.centerY     = centerY;
        this.height      = height;
        this.left        = left;
        this.right       = right;
        this.top         = top;
        this.topLeft     = new Point(left, top);
        this.topRight    = new Point(right, top);
        this.width       = width;
        
        this.x = left;
        this.y = top;
        
    };

    Bounds.prototype.contains = function(point) {
        return point.x > this.left &&
            point.x < this.right &&
            point.y > this.top &&
            point.y < this.bottom;
    };

    Bounds.prototype.toString = function() {
        return "top:" + this.top + ", right:" + this.right + ", bottom:" + this.bottom + ", left:" + this.left;
    };
    
    Nucleo.Bounds = Bounds;

})();