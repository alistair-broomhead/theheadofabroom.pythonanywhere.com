function Particle(img_dim, canvas_dim) {
    this.velocity = Object.create(this.velocity);
    this.img_dim = { x: img_dim.x, y: img_dim.y,
                     w: img_dim.w, h: img_dim.h};
    this.canvas_dim = { x: canvas_dim.x, y: canvas_dim.y,
                        w: canvas_dim.w, h: canvas_dim.h};
}

Particle.prototype = {
    img_dim: {},
    canvas_dim: {},

    velocity: {x: 0, y: 0},
    is_rolling: false,
    is_locked: true
};

Particle.createArray = function(){
    var _ = document.app_namespace;
    var particles = [];
    var x_num = 50;
    var y_num = 50;


    var canvas_dim = {
        x: undefined,
        y: undefined,
        w: _.canvas.width / x_num,
        h: _.canvas.height / y_num
    };

    var img_dim = {
        x: undefined,
        y: undefined,
        w: _.image.width / x_num,
        h: _.image.height / y_num
    };

    for (var y = 0; y < y_num; y++){
        img_dim.y = y * img_dim.h;
        canvas_dim.y = y * canvas_dim.h;
        for (var x = 0; x < x_num; x++){
            img_dim.x = x * img_dim.w;
            canvas_dim.x = x * canvas_dim.w;

            particles.push(new Particle(img_dim, canvas_dim));
        }
    }
    return particles;
};

Particle.prototype.draw = function (anim, context) {
    context.drawImage(anim.image,
        this.img_dim.x, this.img_dim.y,
        this.img_dim.w, this.img_dim.h,
        this.canvas_dim.x, this.canvas_dim.y,
        this.canvas_dim.w, this.canvas_dim.h);
};

Particle.prototype.explode = function (factor) {
    this.velocity.x = ((Math.random() * 10) - 5) * factor;
    this.velocity.y = ((Math.random() * 10) - 5) * factor;
    this.is_locked = false;
    this.is_rolling = false;
};

Particle.prototype.update = function (timeDiff, canvas) {
    if (this.is_locked) { return; }

    var floorFriction = 0.003 * timeDiff;
    var gravity = 0.005 * timeDiff;
    var collisionDamper = 3;

    var pos = this.canvas_dim;
    var v = this.velocity;

    pos.x += v.x;
    pos.y += v.y;

    if (this.is_rolling) {
        if (v.x > 0) {
            v.x -= floorFriction;
            if (v.x <= 0) {
                this.is_locked = true;
            }
        } else {
            v.x += floorFriction;
            if (v.x >= 0) {
                this.is_locked = true;
            }
        }
        // if out of bounds
        if (pos.x < 0 || pos.x > canvas.width - 10) {
            v.x *= -1;
        }
    } else {
        v.y += gravity;
        // if out of bounds
        if (pos.x > canvas.width - 10) {
            pos.x = canvas.width - 10;
            v.x /= collisionDamper;
            v.x *= -1;
        } else if (pos.x < 0) {
            pos.x = 0;
            v.x /= collisionDamper;
            v.x *= -1;
        }

        if (pos.y > canvas.height - 10) {
            pos.y = canvas.height - 10;
            v.y /= collisionDamper;
            v.y *= -1;
        } else if (pos.x < 0) {
            pos.y = 0;
            v.y /= collisionDamper;
            v.y *= -1;
        }

        //if particle is about to roll on floor ...
        if (Math.abs(v.y) < 0.5 && pos.y > canvas.height - 13) {
            pos.y = canvas.height - 10;
            v.y = 0;
            this.is_rolling = true;
        }
    }
};