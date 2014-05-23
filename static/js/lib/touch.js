function Touch(id, pos) {
    this.pos = pos;
    this.id = id;
}

Touch.prototype = new Mouse;
Touch.prototype.down = true;
Touch.prototype.constructor = Touch;

Touch.bindEvents = function (input) {
    input.canvas.addEventListener("touchstart", (function (evt) {
        evt.preventDefault();
        var touch_list = evt.changedTouches;

        for (var i = 0; i < touch_list.length; i++) {
            var changed_touch = touch_list[i];
            input.touches.push(new Touch(changed_touch.identifier,
                input.canvas_pos(changed_touch.pageX,
                    changed_touch.pageY)));
        }
        input.debug_touches();
    }));

    input.canvas.addEventListener("touchmove", (function (evt) {
        evt.preventDefault();
        var touch_list = evt.changedTouches;

        for (var i = 0; i < touch_list.length; i++) {
            var changed_touch = touch_list[i];
            var j = input.ongoingTouchIndexById(touch_list[i].identifier);
            input.touches[j].pos = input.canvas_pos(changed_touch.pageX,
                changed_touch.pageY);
        }
        input.debug_touches();
    }));
    input.canvas.addEventListener("touchend", (function (evt) {
        evt.preventDefault();
        var touch_list = evt.changedTouches;

        for (var i = 0; i < touch_list.length; i++) {
            var j = input.ongoingTouchIndexById(touch_list[i].identifier);
            input.touches.splice(j, 1);
        }
        input.debug_touches();
    }));
};