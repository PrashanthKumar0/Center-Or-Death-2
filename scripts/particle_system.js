/*
    FILE : particle_system.js
    Dependencies : Vec2.js , UTILS.js
*/

class ParticleSystem {
    constructor(worldWidth, worldHeight) {
        this.worldWidth = worldWidth;
        this.worldHeight = worldHeight;
        this._particles = [];
        this._MAX_PARTICLE_COUNT = 250;
    }
    spawnAt(position, velocityBias = null, numParticles = 50, maxLife = 60) {
        if (this._particles.length >= this._MAX_PARTICLE_COUNT) return;
        if (velocityBias != null) velocityBias = velocityBias.copy().normalize();

        for (let i = 0; i < numParticles; i++) {
            let pos = position;
            let vel;
            if (velocityBias == null) {
                vel = new Vec2(rand(-1, 1), rand(-1, 1));
            } else {
                vel = velocityBias.copy().scale(2 * (Math.random() - 0.4));
            }

            vel.add(new Vec2(-vel.y, vel.x) // in normal
                .scale(2 * (Math.random() - 0.4)));
            vel.scale(5);

            this._particles.push(new Particle(pos.copy(), vel.copy(), rand(10, maxLife, true)));
        }
    }
    // update() {
    //     this._particles.forEach((p, idx) => {
    //         p.update();
    //         if (p.life > p.maxLife) {
    //             this._particles.splice(idx, 1);
    //         }
    //     });
    // }
    draw(ctx) {

        // ctx.fillStyle = "RED";
        let reset_alpha = ctx.globalAlpha;

        this._particles.forEach((p,idx) => {
            
            p.update();
            if (p.life > p.maxLife) {
                this._particles.splice(idx, 1);
                return;
            }
 

            if (p.position.x < 0) {
                p.position.x = 0;
                p.velocity.x *= -1;
            }
            if (p.position.y < 0) {
                p.position.y = 0;
                p.velocity.y *= -1;
            }
            if (p.position.x > ctx.canvas.width) {
                p.position.x = ctx.canvas.width;
                p.velocity.x *= -1;
            }
            if (p.position.y > ctx.canvas.height) {
                p.position.y = ctx.canvas.height;
                p.velocity.y *= -1;
            }


            // let reset_shadow_blurr = ctx.shadowBlur;
            // let reset_shadow_color = ctx.shadowColor;
            // let reset_shadow_offset_x=ctx.shadowOffsetX;
            // let reset_shadow_offset_y=ctx.shadowOffsetY;
            // ctx.shadowOffsetX=0;
            // ctx.shadowOffsetY=0;
            // ctx.shadowColor="RED";
            // ctx.shadowBlur=10;
            ctx.fillStyle = p.color || "RED";

            ctx.globalAlpha = 1.0 - (p.life) / (p.maxLife);

            if (p.shape == _PARTICLE_SHAPES.rect) {
                ctx.save();
                ctx.translate(p.position.x - 5, p.position.y - 5); // rotate about top left corner
                ctx.rotate(ctx.globalAlpha * 10);
                ctx.fillRect(0, 0, 10 * ctx.globalAlpha + 4, 10 * ctx.globalAlpha + 4);
                // ctx.fillRect(0, 0, 20 * ctx.globalAlpha + 4, 20 * ctx.globalAlpha + 4);
                ctx.restore();
            } else {
                ctx.beginPath();
                ctx.arc(p.position.x, p.position.y, 5 * ctx.globalAlpha + 1, 0, TWO_PI);
                // ctx.arc(p.position.x, p.position.y, 10 * ctx.globalAlpha + 1, 0, Math.PI * 2);
                ctx.fill();
                ctx.closePath();
            }

            // ctx.fillRect(p.position.x, p.position.y, 10, 10);           
            // ctx.shadowOffsetX=reset_shadow_offset_x;
            // ctx.shadowOffsetY=reset_shadow_offset_y;
            // ctx.shadowColor=reset_shadow_color;
            // ctx.shadowBlur=reset_shadow_blurr;
        });

        ctx.globalAlpha = reset_alpha;

    }
    isEmpty() {
        return this._particles.length <= 0;
    }
}