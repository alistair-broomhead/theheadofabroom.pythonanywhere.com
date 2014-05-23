function ExploderCanvasAnimation(window, canvas, input) {
    this.window = window;
    this.canvas = canvas;
    this.input = input;

    var w = this.canvas.width = self.window.innerWidth;
    var h = this.canvas.height = self.window.innerHeight;

    this.crossHairRadius = Math.sqrt((w/25) * (h/25));
}

ExploderCanvasAnimation.prototype = {
    window: undefined,
    canvas: undefined,
    crossHairRadius: 25,
    particles: undefined,
    time: {}
};

ExploderCanvasAnimation.prototype.drawParticles = function (context) {
    if (this.particles && this.image.src) {
        for (var i = 0; i < this.particles.length; i++) {
            this.particles[i].draw(this, context);
        }
    }
};

ExploderCanvasAnimation.prototype.distance = function (a, b) {
    var x = a.x - b.x;
    var y = a.y - b.y;
    return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
};

ExploderCanvasAnimation.prototype.fire = function (touch, factor) {
    if (touch.down) {
        for (var i = 0; i < this.particles.length; i++) {
            var particle = this.particles[i];
            var radius = this.distance(touch.pos, particle.canvas_dim);
            if (radius <= this.crossHairRadius) {
                particle.explode(factor);
            }
        }
    }
};

ExploderCanvasAnimation.prototype.updateParticles = function () {
    if (this.time.period == 0){ return; }

    var i;
    var factor = this.time.period / 3;

    for (i = 0; i < this.input.touches.length; i++) {
        this.fire(this.input.touches[i], factor);
    }
    for (i = 0; i < this.particles.length; i++) {
        this.particles[i].update(this.time.period, this.canvas);
    }
};

ExploderCanvasAnimation.prototype.drawCrossHair = function (touch, context) {
    if (touch.pos.x && touch.pos.y) {
        context.globalAlpha = 0.5;
        context.beginPath();
        context.arc(touch.pos.x, touch.pos.y, this.crossHairRadius, 0, 2 * Math.PI, false);
        context.fillStyle = 'blue';
        context.fill();

        context.globalAlpha = 1;
        context.moveTo(touch.pos.x, touch.pos.y - this.crossHairRadius - 10);
        context.lineTo(touch.pos.x, touch.pos.y + this.crossHairRadius + 10);
        context.strokeStyle = 'black';
        context.lineWidth = 4;
        context.stroke();

        context.beginPath();
        context.moveTo(touch.pos.x - this.crossHairRadius - 10, touch.pos.y);
        context.lineTo(touch.pos.x + this.crossHairRadius + 10, touch.pos.y);
        context.strokeStyle = 'black';
        context.lineWidth = 4;
        context.stroke();
    }
};

ExploderCanvasAnimation.prototype.getTime = function getTime(){
    var date = new Date();
    var now = date.getTime();
    if (this.time.current){
        this.time.previous = this.time.current;
    } else {
        this.time.previous = now;
    }
    this.time.current = now;
    this.time.period = this.time.current - this.time.previous;
};

ExploderCanvasAnimation.prototype.requestAnimFrame = function _requestAnimFrame(){
    var self = this;
    requestAnimFrame(function(){self.animate()});
};


ExploderCanvasAnimation.prototype.animate = function animate() {
    context = this.canvas.getContext('2d');
    this.getTime();
    // update

    this.updateParticles();
    context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawParticles(context);

    for (var i = 0; i < this.input.touches.length; i++) {
        this.drawCrossHair(this.input.touches [i], context);
    }

    this.requestAnimFrame();
};


ExploderCanvasAnimation.prototype.start = function start(img_src) {
    this.image = new Image();

    this.image.onload = function onLoad() {
        var self = exploder_app.animation;
        var canvas = exploder_app.canvas;
        var image = exploder_app.image;

        self.particles = Particle.createArray(canvas, image);
        self.animate();
    };

    this.image.src = img_src;
};