exploder_app = {
    canvas: undefined,
    window: undefined,
    image: undefined,

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

    this.input = new Input(this.window, this.canvas);
    var anim = this.animation = new ExploderCanvasAnimation(
        this.window, this.canvas, this.input);

    window.addEventListener("resize",function(){ anim.resize = true; });

    this.animation.start(image_url);

    this.image = this.animation.image;
};