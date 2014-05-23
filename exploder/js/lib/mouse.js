function Mouse() {}

Mouse.prototype = {
    down: false,
    pos: {},
    id: "mouse"
};

Mouse.bindEvents = function (input) {
    input.canvas.addEventListener('mousemove', function (event) {
        input.mouse.pos = input.canvas_pos(event.clientX, event.clientY);
    });
    input.canvas.addEventListener('mouseout', function (event) {
        input.mouse.pos = {};
    });
    input.canvas.addEventListener('mousedown', function (event) {
        input.mouse.down = true;
    });
    input.canvas.addEventListener('mouseup', function (event) {
        input.mouse.down = false;
    });
};