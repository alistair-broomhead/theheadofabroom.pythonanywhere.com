function ExploderCanvasAnimation(window, canvas, input) {
    this.window = window;
    this.canvas = canvas;
    this.input = input;
}

ExploderCanvasAnimation.prototype = {
    window: undefined,
    canvas: undefined,
    cross_hair_radius: 25,
    particles: undefined,
    resize: true,
    time: {}
};

ExploderCanvasAnimation.prototype.drawParticles = function (context) {
    if (this.particles && this.image.src) {
        for (var i = 0; i < this.particles.length; i++) {
            this.particles[i].draw(this.image, context);
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

        // By traversing the array in reverse order, I can move a particle
        // to the end without it affecting which particles are processed.
        // By re-ordering particles we guarantee that the last particle to
        // be interacted with will be visible

        for (var i = this.particles.length - 1; i>= 0; i--) {
            var particle = this.particles[i];
            var radius = this.distance(touch.pos, particle.canvas_dim());
            if (radius <= this.cross_hair_radius) {
                particle.explode(factor);
                this.particles.push(particle);
                this.particles.splice(i, 1);
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
        this.particles[i].update(this.time.period);
    }
};

ExploderCanvasAnimation.prototype.drawCrossHair = function (touch, context) {
    if (touch.pos.x && touch.pos.y) {
        context.globalAlpha = 0.5;
        context.beginPath();
        context.arc(touch.pos.x, touch.pos.y, this.cross_hair_radius, 0, 2 * Math.PI, false);
        context.fillStyle = 'blue';
        context.fill();

        context.globalAlpha = 1;
        context.moveTo(touch.pos.x, touch.pos.y - this.cross_hair_radius - 10);
        context.lineTo(touch.pos.x, touch.pos.y + this.cross_hair_radius + 10);
        context.strokeStyle = 'black';
        context.lineWidth = 4;
        context.stroke();

        context.beginPath();
        context.moveTo(touch.pos.x - this.cross_hair_radius - 10, touch.pos.y);
        context.lineTo(touch.pos.x + this.cross_hair_radius + 10, touch.pos.y);
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

ExploderCanvasAnimation.prototype.do_resize = function do_resize(){
    const canvas = this.canvas;

    canvas.width = self.window.innerWidth - 20;
    canvas.height = self.window.innerHeight - 50;

    Particle.rescale_for_canvas(canvas);
    this.cross_hair_radius = Particle.prototype.canvas_chunk * 2.5;

    this.resize = false;
};


ExploderCanvasAnimation.prototype.animate = function animate() {
    if (this.resize){ this.do_resize(); }

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