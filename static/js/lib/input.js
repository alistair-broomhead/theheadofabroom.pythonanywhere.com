function Input(window, canvas) {
    this.window = window;
    this.canvas = canvas;

    this.mouse = new Mouse();
    this.touches = [this.mouse];

    Touch.bindEvents(this);
    Mouse.bindEvents(this);
}

Input.prototype = {
    window: undefined,
    canvas: undefined,
    mouse: undefined,
    touches: undefined
};

Input.prototype.canvas_top_left = function () {
    var obj = this.canvas;
    var top = 0;
    var left = 0;
    while (obj.tagName != 'BODY') {
        top += obj.offsetTop;
        left += obj.offsetLeft;
        obj = obj.offsetParent;
    }
    return {top: top, left: left};
};

Input.prototype.canvas_pos = function (x, y) {
    // return relative position
    var top_left = this.canvas_top_left();
    return {
        x: x - top_left.left + this.window.pageXOffset,
        y: y - top_left.top + this.window.pageYOffset
    };
};

Input.prototype.ongoingTouchIndexById = function (id_to_find) {
    for (var i = 0; i < this.touches.length; i++) {
        if (this.touches[i].id === id_to_find) {
            return i;
        }
    }
    return -1;
};

Input.prototype.debug_touches = function () {
    // document.getElementById("touches"). innerHTML = JSON.stringify(this.touches);
};