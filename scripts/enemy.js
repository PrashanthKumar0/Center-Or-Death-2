/*
    FILE : enemy.js
    Dependencies : Vec2.js , UTILS.js
*/
class Enemy {
    constructor(position, radius, gravity) {
        this.radius = radius;
        this.gravity = gravity.copy();
        this.position = position.copy();
        this.acceleration = new Vec2(0, 0);
        this.velocity = new Vec2(0, 0);

        this.alive = true;
        this.mass = 0;
        this.invMass = Infinity; // (1 / mass)
        this.calculateMass();
        this.deathRadius = Math.sqrt((this.mass * 0.1) / Math.PI); // 10%

        this.spots = [];
        // 5-10 spots
        let num_spots = rand(5, 10, true);
        let dTheta = TWO_PI / num_spots;

        for (let t = 0; t < TWO_PI; t += dTheta) {
            let x = Math.cos(t);
            let y = Math.sin(t);

            let radialPos = rand(this.radius / 4, this.radius);
            x *= radialPos;
            y *= radialPos;

            let radius = (this.radius - radialPos) * rand(0.2, 1);
            radius = Math.abs(radius) * 0.5; //incase something goes wrong
            this.spots.push({ x, y, radius });
        }

        this.healthBarWidth = radius;
        this.healthBarHeight = this.healthBarWidth / 8;

        // for calculations
        this.initialRadius = radius;
        this.invInitialRadius = 1 / radius;
        this.diffInvDeathRadius = 1 / (this.initialRadius - this.deathRadius);
        this.radiusDecreasePercentage = this.radius * this.invInitialRadius;
        this.healthPercentage =
            (this.radius - this.deathRadius) * this.diffInvDeathRadius;
        this.hRadius = this.radius / 2;
    }
    calculateMass() {
        this.mass = Math.PI * this.radius * this.radius;
        this.invMass = 1 / this.mass;
    }
    draw(ctx) {
        this.update();
        if (!this.alive) return;
        ctx.fillStyle = "#FFF";
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, TWO_PI);
        ctx.fill();
        ctx.closePath();
        // not percentage actually :P
        ctx.fillStyle = "#DDD";

        for (let i = 0; i < this.spots.length; i++) {
            let r = this.spots[i].radius * this.radiusDecreasePercentage;
            ctx.beginPath();
            ctx.arc(
                this.spots[i].x * this.radiusDecreasePercentage +
                this.position.x,
                this.spots[i].y * this.radiusDecreasePercentage +
                this.position.y,
                r,
                0,
                TWO_PI
            );
            ctx.fill();
            ctx.closePath();
        }

        let h_bar_pos = this.position
            .copy()
            .sub(new Vec2(this.hRadius, 3 * this.hRadius));
        ctx.fillStyle = "#CCC";
        ctx.fillRect(
            h_bar_pos.x,
            h_bar_pos.y,
            this.healthBarWidth,
            this.healthBarHeight
        );

        if (this.healthPercentage > 0.7) {
            ctx.fillStyle = "ORANGE";
        } else {
            ctx.fillStyle = "RED";
        }

        let health_w = this.healthBarWidth * this.healthPercentage;
        ctx.fillStyle = "hsl(" + 120 * this.healthPercentage + ",100%,60%)";
        ctx.fillRect(h_bar_pos.x, h_bar_pos.y, health_w, this.healthBarHeight);
    }
    update() {
        if (this.radius <= this.deathRadius) {
            this.alive = false;
            return;
        }
        this.acceleration.add(this.gravity);
        this.velocity.add(this.acceleration);
        this.position.add(this.velocity);

        this.acceleration = new Vec2(0, 0);
    }
    applyForce(acceleration) {
        //? actually should be apply acceleration
        this.acceleration.add(acceleration).scale(this.invMass);
        this.velocity.add(this.acceleration);
        this.acceleration = new Vec2(0, 0);
    }
    impactMass(mass) {
        let dr = Math.sqrt((this.mass - mass) / Math.PI);
        this.radius -= dr * 0.01;
        this.radiusDecreasePercentage = this.radius * this.invInitialRadius;
        this.healthPercentage =
            (this.radius - this.deathRadius) * this.diffInvDeathRadius;
        this.hRadius = this.radius / 2;
        this.calculateMass();
    }
}
