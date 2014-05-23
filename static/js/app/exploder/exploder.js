exploder_app = {
    canvas: undefined,
    window: undefined,

    input: undefined,
    animation: undefined
};

exploder_app.start = function(document, window,
                              canvas_id,
                              image_url){

    window.requestAnimFrame = (function _requestAnimFrame(callback) {
        return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (callback) {
                window.setTimeout(callback, 1000 / 60);
            };
    })();

    this.canvas = document.getElementById(canvas_id);
    this.window = window;

    this.input = new Input;
    this.animation = new CanvasAnimation;
    this.animation.start(image_url);
};