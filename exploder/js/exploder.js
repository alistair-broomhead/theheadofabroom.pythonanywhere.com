

window.onLoad = function () {
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
    document.app_namespace = {
        canvas: document.getElementById("gameCanvas"),
        window: window
    };
    var _ = document.app_namespace;

    _.input = new Input;
    _.animation = new CanvasAnimation;
    _.animation.start('res/jpg/flash.jpg');
};
