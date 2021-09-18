/*
    FILE : particle.js
    Dependencies : Vec2.js , UTILS.js
*/

const _PARTICLE_SHAPES = {
    rect: "rect",
    circ: "circ",
};
const _PARTICLE_SHAPES_KEYS = Object.keys(_PARTICLE_SHAPES);

const _PARTICLE_COLORS = [
    "violet",
    "turquoise",
    "tomato",
    "salmon",
    "aquaMarine",
    "orangeRed",
    "hotpink",
];
class Particle {
    constructor(position, velocity, maxLife) {
        this.position = position;
        this.velocity = velocity;
        this.life = 0;
        this.maxLife = maxLife;
        this.color =
            _PARTICLE_COLORS[
                Math.round(Math.random() * _PARTICLE_COLORS.length)
            ];
        this.shape =
            _PARTICLE_SHAPES[
                _PARTICLE_SHAPES_KEYS[
                    Math.round(Math.random() * _PARTICLE_SHAPES_KEYS.length)
                ]
            ];
    }

    update() {
        this.life++;
        this.position.add(this.velocity);
        if (this.life > this.maxLife) return;
    }

    draw() {
        // must override
    }
}
