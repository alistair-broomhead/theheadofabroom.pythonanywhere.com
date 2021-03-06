function Particle(x, y) {
    this.velocity = Object.create(this.velocity);
    this.source_index = { x: x, y: y };
    this.index = { x: x, y: y };
}

Particle.prototype = {
    num: 1600,
    img_chunk: 10,
    canvas_chunk: 10,
    aspect: {},
    limits: {},
    source_index: {},
    index: {},

    velocity: {x: 0, y: 0},
    is_rolling: false,
    is_locked: true
};

Particle.rescale_for_image = function(image){
    var source = {};
    const protoPart = Particle.prototype;
    var target = protoPart.num;

    source.area = image.height * image.width;
    source.scale = source.area / target;
    source.chunk = Math.ceil(Math.sqrt(source.scale));

    // This is the side length of each particle. Particles are square,
    // so this will be the square root of the particle area.
    protoPart.img_chunk = source.chunk;

    // This is how many particles we need to lay out in each direction,
    // to consume the image. This means we may have fewer than the
    // wanted number, but hopefully not by too many. Fewer will mean it
    // performs well, but more will mean it looks better.

    var aspect = protoPart.aspect = {
        x: Math.ceil( image.width / source.chunk ),
        y: Math.ceil( image.height / source.chunk )};

    protoPart.limits = {
        x: protoPart.aspect.x - 1,
        y: protoPart.aspect.y - 1
    };

    var actual = aspect.x * aspect.y;

    if (actual != target){
        // I want to keep a tab on how many particles we actually get,
        // and how far over this is, as I know that too many particles
        // will look better, but too few will perform better.
        console.log("Target: "+target+
                    ", Actual: "+actual+
                    ", Overshot:"+(actual - target)+
                    ", Size:"+source.chunk);

    }
};
Particle.rescale_for_canvas = function(canvas){

    // We want to preserve the aspect ratio of the original image,
    // so for this purpose we see how many we can fit in either
    // dimension, then pick the lesser of the two numbers, resulting
    // in unused canvas in the other direction.
    const protoPart = Particle.prototype;

    const can_fit = {
        x: canvas.width / protoPart.aspect.x,
        y: canvas.height / protoPart.aspect.y
    };

    protoPart.canvas_chunk = can_fit.x < can_fit.y ? can_fit.x : can_fit.y;

    canvas.width = protoPart.canvas_chunk * protoPart.aspect.x;
    canvas.height = protoPart.canvas_chunk * protoPart.aspect.y;
};
Particle.createArray = function(canvas, image){
    var particles = [];

    Particle.rescale_for_image(image);
    Particle.rescale_for_canvas(canvas);

    for (var y = 0; y < Particle.prototype.aspect.y; y++){
        for (var x = 0; x < Particle.prototype.aspect.x; x++){
            particles.push(new Particle(x, y));
        }
    }
    return particles;
};

Particle.prototype.image_dim = function(){
    return {
        x: this.source_index.x * this.img_chunk,
        y: this.source_index.y * this.img_chunk,
        w: this.img_chunk,
        h: this.img_chunk
    }
};
Particle.prototype.canvas_dim = function(){
    return {
        x: this.index.x * this.canvas_chunk,
        y: this.index.y * this.canvas_chunk,
        w: this.canvas_chunk,
        h: this.canvas_chunk
    }
};

Particle.prototype.draw = function (image, context) {
    var image_dim = this.image_dim();
    var canvas_dim = this.canvas_dim();
    context.drawImage(image,
                      image_dim.x, image_dim.y,
                      image_dim.w, image_dim.h,
                      canvas_dim.x, canvas_dim.y,
                      canvas_dim.w, canvas_dim.h);
};

Particle.prototype.explode = function (factor) {
    this.velocity.x = ((Math.random() * 10) - 5) * factor;
    this.velocity.y = ((Math.random() * 10) - 5) * factor;
    this.is_locked = false;
    this.is_rolling = false;
};

Particle.prototype.coefficients = {
    gravity: 0.015,
    friction: 0.5,
    elasticity: 0.3,
    velocity: 0.1
};
Particle.prototype.update = function (timeDiff) {
    if (this.is_locked) { return; }

    var prev_pos = { x: this.index.x, y: this.index.y };
    var v = this.velocity;

    if (this.is_rolling) {
        // Apply friction against the floor until the particle
        // comes to rest;
        var friction = this.coefficients.friction * timeDiff;
        if (0 - friction < v.x < friction){
            v.x = 0;
            this.is_locked = true;
            return;
        }
        v.x /= friction;
    } else {
        //if particle is about to roll on floor ...
        if (Math.abs(v.y) < 0.5 && this.index.y > this.limits.y - 0.25) {
            this.index.y = this.limits.y;
            v.y = 0;
            this.is_rolling = true;
        } else { // apply gravity
            v.y += this.coefficients.gravity * timeDiff;
        }
    }

    this.index.x += v.x * this.coefficients.velocity;
    this.index.y += v.y * this.coefficients.velocity;

    // if hit a wall
    if (this.index.x <= 0 || this.index.x >= this.limits.x) {
        v.x *= -1 * this.coefficients.elasticity;
        this.index.x = prev_pos.x;
    }
    // if hit floor or ceiling
    if (this.index.y > this.limits.y || this.index.x < 0) {
        v.y *= -1 * this.coefficients.elasticity;
        this.index.y = prev_pos.y;
    }

};