exploder_app = {
    canvas: undefined,
    window: undefined,
    image: undefined,

    input: undefined,
    animation: undefined
};

exploder_app.start = function(document, window, els, image_url){

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

    this.canvas = els.canvas;
    this.window = window;

    this.input = new Input(this.window, this.canvas);
    var anim = this.animation = new ExploderCanvasAnimation(
        this.window, els, this.input);

    window.addEventListener("resize",function(){ anim.resize = true; });

    this.animation.start(image_url);

    this.image = this.animation.image;
};
function run(document, window){
var els = {
        wrapper: document.getElementById('wrapper'),
        header: document.getElementById('header'),
        content: document.getElementById('content'),
        footer: document.getElementById('footer'),
        canvas: document.getElementById('gameCanvas')
    };

    els.max_content_size = function max_content_size(){
        return {
            w: this.content.clientWidth - 20,
            h: this.content.clientHeight - 20
        }
    };

    els.resize_canvas_to_fill = function resize_canvas_to_fill(){
        var max_content_size = this.max_content_size();
        this.canvas.height = max_content_size.h;
        this.canvas.width = max_content_size.w
    };

    exploder_app.start(document, window, els, '/static/jpg/flash.jpg');
}