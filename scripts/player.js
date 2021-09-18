/*
    FILE : player.js
    Dependencies : Vec2.js , UTILS.js
*/

class Player {
    constructor(positionVec2, width, height, cannonWidth, cannonHeight) {
        this.position = positionVec2.copy();
        this.width = width;
        this.height = height;
        this.cannonWidth = cannonWidth;
        this.cannonHeight = cannonHeight;
        this.cannonAngle = (Math.PI / 180) * -60;

        this.boundingRadius = Math.hypot(this.width, this.height) / 2;

        this.basePositionX = positionVec2.x;

        this._speed = 4;

        // for bullets
        this.bullets = [];
        this.bulletShootTimeGap = 5;
        this.bulletShootAnimationMaxLife = 10; // last till x frames
        this.bulletShootAnimationLife = 0; //

        this.bulletParticleMaxLife = 50;
        this.maxBulletParticles = 20;

        this.bulletRadius = this.cannonWidth / 2;
        this.bulletMass = Math.PI * this.bulletRadius * this.bulletRadius;

        // for calculations
        

        // for my stupidness
        this.alive = true;
        this.angry = false;
        this.time = 0;
        this.particulated_after_death = false; // we spawn particle only once after death
    }
    draw(ctx, particle_system, enemy) {

        let player_center = this.position.copy().add(new Vec2(this.width / 2, this.height / 2));
        let enemy_cannon_diff = player_center.copy().sub(enemy.position)
        let enemy_cannon_dist = enemy_cannon_diff.magSq();

        // Collision with cannon
        if (enemy_cannon_dist <= (this.boundingRadius + enemy.radius) ** 2) { //approximation
            // TODO: PLAY SOUND TANK BLAST
            let norm = enemy_cannon_diff.normalize();
            enemy.velocity = norm.copy().scale(-norm.dot(enemy.velocity)).copy();
            enemy.position.add(norm.copy().scale(-(this.boundingRadius + enemy.radius) + Math.sqrt(enemy_cannon_dist)));
            this.alive = false;
            // this.angry = true;
        }

        // ? Should we add collision check with barrel too ?

        if (!this.alive) {
            this.angry = true;
            if (!this.particulated_after_death) {
                this.particulated_after_death = true;
                particle_system.spawnAt(player_center.copy());
                // debugger;
            }
            return;
        }

        if (this.angry) this.time += 0.001;

        this.constraintPosition(ctx.canvas.width);


        let dTheta = (this.position.x - this.basePositionX) * TO_RADIAN;
        let x = this.position.x;
        let y = this.position.y - Math.abs(Math.sin(dTheta) * 2);
        let cannonHeight = this.cannonHeight;

        if (this.bulletShootAnimationLife > 0) {
            x += 6 * (Math.random() - 0.5);
            y += 4 * (Math.random() - 0.1);
            cannonHeight = cannonHeight - 5 * (this.bulletShootAnimationLife / this.bulletShootAnimationMaxLife);
            this.bulletShootAnimationLife--;
        }

        this.bullets.forEach((bullet, idx) => {
            if (bullet.position.x < 0 || bullet.position.x > ctx.canvas.width) {
                bullet.velocity.x *= -1; // afterall we are going to destroy it
                particle_system.spawnAt(bullet.position.copy(), bullet.velocity.copy(), this.maxBulletParticles, this.bulletParticleMaxLife);
                this.bullets.splice(idx, 1);
                return;
            }
            if (bullet.position.y < 0 || bullet.position.y > ctx.canvas.height) {
                bullet.velocity.y *= -1; // afterall we are going to destroy it
                particle_system.spawnAt(bullet.position.copy(), bullet.velocity.copy(), this.maxBulletParticles, this.bulletParticleMaxLife);
                this.bullets.splice(idx, 1);
                return;
            }
            this.impactEnemy(bullet, idx, enemy, particle_system);
            bullet.update();
            bullet.draw(ctx);
        })


        this.constraintAngle();
        
        let wheelPad = this.width / 8;
        let wheelR = this.width / 8;


        ctx.fillStyle = "#FA5588"; // TODO : Think a better way
        // hsl(49 82% 52% / 1)
        if (this.angry) ctx.fillStyle = "hsla(" + Math.floor(Math.abs(360 * Math.sin(this.time))) + ",82%,52%,1)";
        // if (this.angry) ctx.fillStyle = "Green";

        ctx.fillRect(x, y - wheelPad, this.width, this.height);
        let _cannonX = x + (this.width / 2) - (this.cannonWidth / 2);
        let _cannonY = y - cannonHeight;

        let barrelW = this.cannonWidth / 2;

        ctx.save(); { // Save
            ctx.translate(_cannonX + (this.cannonWidth / 2), _cannonY + cannonHeight - wheelPad);
            ctx.rotate(this.cannonAngle);
            ctx.fillRect(-(this.cannonWidth / 2), -cannonHeight - wheelPad, this.cannonWidth, cannonHeight); // cannon barrel

            ctx.fillRect(-(this.cannonWidth / 2) - barrelW / 2, -cannonHeight - wheelPad - barrelW / 2, this.cannonWidth + barrelW, this.cannonWidth + barrelW); // barel opening
            ctx.beginPath();
            ctx.arc(0, 0, this.cannonWidth * 2, 0, TWO_PI);
            ctx.fill();
            ctx.closePath();
            // ctx.fillRect(0,0, this.cannonWidth, cannonHeight + (this.cannonWidth >>1));
        } ctx.restore(); // Restore

        this.drawWheel(ctx, x + wheelR + wheelPad, y + this.height - wheelR, wheelR, dTheta); // Left
        this.drawWheel(ctx, x + this.width - wheelR - wheelPad, y + this.height - wheelR, wheelR, dTheta); // Right


    }

    drawWheel(ctx, x, y, r, dTheta = 0) {
        let tyreThickness = 4;
        dTheta *= 2; // to increase the spin a bit 
        ctx.save(); { // Save
            ctx.translate(x, y);
            ctx.rotate(dTheta);
            ctx.strokeStyle = "#000";
            ctx.fillStyle = "#FFF";

            ctx.beginPath(); // rim
            ctx.arc(0, 0, r, 0, TWO_PI);
            ctx.fill();

            ctx.lineWidth = tyreThickness / 2;
            for (let i = 0; i < 360; i += 60) {
                let _x = r * Math.cos(i * TO_RADIAN);
                let _y = r * Math.sin(i * TO_RADIAN);
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(_x, _y);
                ctx.stroke();
                ctx.closePath();
            }

            ctx.lineWidth = tyreThickness;
            ctx.beginPath(); // tyre
            ctx.arc(0, 0, r, 0, TWO_PI);
            ctx.stroke();



        } ctx.restore(); // Restore

        ctx.strokeStyle = "#FFF";
        ctx.beginPath(); // Mud Gaurd
        ctx.lineWidth = tyreThickness;
        ctx.arc(x, y, r + tyreThickness, 0, Math.PI, true);
        ctx.stroke();


    }
    moveLeft() {
        this.position.x -= this._speed;
    }
    moveRight() {
        this.position.x += this._speed;
    }

    move(thresholdX) {
        this.position.x += this._speed * thresholdX;
    }

    setCannonAngle(angle){
        this.cannonAngle=angle;
        this.constraintAngle();
    }
    constraintAngle(){
        if (this.cannonAngle > 1.3962634015954636) { // 85 degree
            this.cannonAngle = 1.3962634015954636;
        }
        if (this.cannonAngle < -1.3962634015954636) { // 85 degree
            this.cannonAngle = -1.3962634015954636;
        }
    }
    shootBullet() {
        if (this.bulletShootAnimationLife > this.bulletShootTimeGap) return;
        this.bulletShootAnimationLife = this.bulletShootAnimationMaxLife;
        // TODO : complete this

        let angle = this.cannonAngle - Math.PI / 2;
        let vel = new Vec2(10, 10);
        vel.setAngle(angle); // to point upward

        let pos = this.position.copy();
        pos.x += this.width / 2;
        pos.y -= this.cannonWidth;
        pos.add(vel.copy().normalize().scale(this.cannonHeight + this.cannonWidth));

        // TODO : draw fire sprite here
        let _d = this.cannonWidth * 2;
        ctx.fillStyle = "red";
        for (let i = 0; i < 8; i++) {
            ctx.fillRect(pos.x + _d * (Math.random() - 0.5), pos.y + _d * (Math.random() - 0.5), this.cannonWidth / 2, this.cannonWidth / 2);
        }

        this.bullets.push(new Bullet(pos, vel, this.bulletRadius, this.bulletMass));
    }

    impactEnemy(bullet, bullet_idx, enemy, particle_system) {
        // yeah fake physics :P
        let collision_normal = enemy.position.copy().sub(bullet.position); // from player to enemy
        if (collision_normal.magSq() < Math.pow(Math.ceil(bullet.radius + enemy.radius), 2)) {
            enemy.applyForce(bullet.velocity.copy().scale(bullet.mass)); // todo: modify it
            enemy.impactMass(bullet.mass);

            collision_normal.normalize();
            let collision_tangent = new Vec2(-collision_normal.y, collision_normal.x);

            collision_normal.scale(collision_normal.dot(bullet.velocity))
            collision_tangent.scale(collision_tangent.dot(bullet.velocity) * 0.7); // 0.7 is friction

            let velocity_bias = collision_normal.add(collision_tangent);

            particle_system.spawnAt(bullet.position.copy(), velocity_bias, this.maxBulletParticles, this.bulletParticleMaxLife);
            // debugger;
            // f=m . dv
            this.bullets.splice(bullet_idx, 1);
        }
    }

    constraintPosition(w) {
        if (this.position.x < 0) {
            this.position.x = 0;
        } else if (this.position.x + this.width > w) {
            this.position.x = w - this.width;
        }
    }
}