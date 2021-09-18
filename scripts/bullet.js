/*
    FILE : bullet.js
    Dependencies : Vec2.js , UTILS.js
*/
class Bullet extends Particle {
    constructor(position, velocity, radius, mass) {
        super(position, velocity);
        this.radius = radius;
        this.mass = mass;
    }
    draw(ctx) {
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, TWO_PI);
        ctx.fill();
        ctx.closePath();
    }

}