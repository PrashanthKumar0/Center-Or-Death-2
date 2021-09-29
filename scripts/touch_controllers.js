class JoyStick {
    constructor(position, radius) {
        this.sensitivity = 1;
        this.radius = radius;
        this.position = position;

        this.capPos = this.position; // idk what they actually call that lil springy geary thingy
        this.capRadius = radius / 6;
        // for users
        this.capVec = new Vec2(0, 0); // a vector whose mag <= 1 representing amount and direction of joystick
        this.capNormVec = new Vec2(0, 0); // a vector whose mag == 1 representing only direction of joystick
        this.joyMag = 0;

        this.isActive = false;
        this.touchId = 0;
        // for calculations
        this.TWO_PI = Math.PI * 2;
        // this.dR = this.radius / 5; // nothing special :P see under draw()
    }
    touchDown(touchPos, touchId = 0) {
        if (
            Math.hypot(
                this.position.x - touchPos.x,
                this.position.y - touchPos.y
            ) <= this.radius
        ) {
            this.isActive = true;
            this.touchId = touchId;
            this.update(touchPos);
        }
    }

    moveTo(position) {
        this.position = position;
    }

    getCap() {
        return this.capVec.copy();
    }

    getCapNorm() {
        return this.capNormVec.copy();
    }

    update(touchPos, touchId = 0) {
        // TODO: see if touchId is really needed here
        if (this.isActive && this.touchId == touchId) {
            let diff = touchPos.copy().sub(this.position);
            let dist = diff.mag();
            let threshold = Math.min(this.radius, dist) * this.sensitivity;
            diff.normalize();

            this.capNormVec = diff.copy();
            this.capPos = diff.copy().scale(threshold).add(this.position);
            // this.capPos = touchPos;
            this.joyMag = threshold / this.radius;
            this.capVec = diff.copy().scale(this.joyMag);
            // debugger;
        }
    }

    resetJoy() {
        this.capPos = this.position; // idk what they actually call that lil springy geary thingy
        this.capVec = new Vec2(0, 0); // a vector whose mag <= 1 representing amount and direction of joystick
    }

    touchUp(touchId = 0) {
        if (this.touchId == touchId) {
            this.isActive = false;
            this.resetJoy();
            return true;
        }
        return false;
    }
    draw(ctx) {
        // if (!this.isActive) return; // TODO : see if this is ok to do>
        ctx.fillStyle = "rgba(255,255,255,0.25)";
        ctx.strokeStyle = "rgba(0,255,255,0.25)";
        ctx.lineWidth = 2;
        if (this.isActive) {
            ctx.strokeStyle = "rgba(0,255,255,0.5)";
            ctx.fillStyle = "rgba(255,255,255,0.5)";
        }

        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, this.TWO_PI);
        ctx.fill();
        ctx.stroke();
        ctx.closePath();

        // Ref
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, 2, 0, this.TWO_PI);
        ctx.fill();
        ctx.closePath();

        ctx.strokeStyle = "rgba(255,255,255,0.1)";
        ctx.beginPath();
        ctx.moveTo(this.position.x, this.position.y);
        ctx.lineTo(this.capPos.x, this.capPos.y);
        ctx.stroke();
        ctx.closePath();

        // RADAR
        // for (let r = 1; r < this.radius; r += this.dR) {
        //     ctx.beginPath();
        //     ctx.arc(this.position.x, this.position.y, r, 0, this.TWO_PI);
        //     ctx.stroke();
        //     ctx.closePath();
        // }

        ctx.fillStyle = "rgba(255,0,0,0.2)";
        if (this.isActive) {
            ctx.fillStyle = "rgba(0,255,255,0.3)";
        }

        ctx.beginPath();
        ctx.arc(this.capPos.x, this.capPos.y, this.capRadius, 0, this.TWO_PI);
        ctx.fill();
        ctx.closePath();
    }
}

class Button {
    constructor(position, radius, char) {
        this.position = position;
        this.radius = radius;
        this.isActive = false;
        this.char = char || " ";
        // for calculations
        this.TWO_PI = Math.PI * 2;
    }

    touchDown(touchPos, touchId = 0) {
        if (
            Math.hypot(
                this.position.x - touchPos.x,
                this.position.y - touchPos.y
            ) <= this.radius
        ) {
            this.isActive = true;
            this.touchId = touchId;
            // this.update(touchPos);
        }
    }

    update(touchPos, touchId = 0) {
        //nothing here .. just a stub
    }

    touchUp(touchId = 0) {
        if (this.touchId == touchId) {
            this.isActive = false;
            return true;
        }
        return false;
    }

    draw(ctx) {
        ctx.fillStyle = "rgba(255,255,255,0.1)";
        if (this.isActive) {
            ctx.fillStyle = "rgba(255,255,255,0.5)";
        }

        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, this.TWO_PI);
        ctx.fill();
        ctx.closePath();

        ctx.font = this.radius + "px Arial";
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        ctx.fillText(this.char, this.position.x, this.position.y);
    }
}

// class HorizontalJoyStick {
//     constructor(position, width, height) {
//         this.sensitivity = 1;
//         this.width = width;
//         this.height = height;
//         this.position = position;

//         this.center = this.position.copy().add(new Vec2(width / 2, height / 2));
//         this.capPos = this.center.copy(); // idk what they actually call that lil springy geary thingy
//         this.capRadius = (Math.min(height, width) / 2) + 3; // 3 to add just a lil more
//         // for users
//         this.capVecX = 0; // a vector whose mag <= 1 representing amount and direction of joystick
//         this.capNormVecX = 0; // a vector whose mag == 1 representing  direction of joystick

//         // for calculations
//         this.TWO_PI = Math.PI * 2;
//         this.isActive = false;
//         this.hWidth = width / 2;
//         this.hHeight = height / 2;
//         // this.dR = this.radius / 5; // nothing special :P see under draw()
//     }

//     draw(ctx) {
//         ctx.fillStyle = "rgba(255,255,255,0.1)";
//         ctx.strokeStyle = "rgba(0,255,255,0.1)";
//         ctx.lineWidth = 2;
//         if (this.isActive) {
//             ctx.strokeStyle = "rgba(0,255,255,0.5)";
//             ctx.fillStyle = "rgba(255,255,255,0.5)";
//         }

//         ctx.fillRect(this.position.x, this.position.y, this.width, this.height);

//         // Ref
//         ctx.fillStyle = "rgba(0,0,0,0.5)";

//         ctx.fillRect(this.center.x - 2, this.center.y - 2, 4, 4);

//         ctx.strokeStyle = "rgba(255,255,255,0.1)";
//         ctx.beginPath();
//         ctx.moveTo(this.center.x, this.center.y);
//         ctx.lineTo(this.capPos.x, this.capPos.y);
//         ctx.stroke();
//         ctx.closePath();

//         // RADAR
//         // for (let r = 1; r < this.radius; r += this.dR) {
//         //     ctx.beginPath();
//         //     ctx.arc(this.position.x, this.position.y, r, 0, this.TWO_PI);
//         //     ctx.stroke();
//         //     ctx.closePath();
//         // }

//         ctx.fillStyle = "rgba(255,0,0,0.2)";
//         if (this.isActive) {
//             ctx.fillStyle = "rgba(0,255,255,0.3)";
//         }

//         ctx.beginPath();
//         ctx.arc(this.capPos.x, this.capPos.y, this.capRadius, 0, this.TWO_PI);
//         ctx.fill();
//         ctx.closePath();

//     }

//     getJoy() {
//         return new Vec2(this.capVecX, 0);
//     }
//     getJoyNorm() {
//         return new Vec2(this.capNormVecX, 0);
//     }

//     resetJoy() {
//         this.capPos = this.center.copy(); // idk what they actually call that lil springy geary thingy
//         this.capVecX = 0; // a vector whose mag <= 1 representing amount and direction of joystick
//     }

//     touchDown(touchPos) {
//         if (
//             (touchPos.x > this.position.x && touchPos.x <= this.position.x + this.width)
//             &&
//             (touchPos.y > this.position.y && touchPos.y <= this.position.y + this.height)
//         ) {
//             this.isActive = true;
//             this.update(touchPos);
//         }
//     }

//     touchUp() {
//         this.isActive = false;
//         this.resetJoy();
//     }

//     update(touchPos) { // though only x is enough ?
//         if (this.isActive) {
//             let diff = touchPos.x - (this.center.x);
//             let dist = Math.abs(diff);
//             let threshold = Math.min(this.hWidth, dist) * this.sensitivity;
//             let dir = diff / dist;
//             if (!dir) {
//                 dir = 0;
//             }
//             this.capNormVecX = dir;
//             this.capPos.x = this.center.x + dir * threshold;
//             this.capVecX = (threshold / this.hWidth) * dir;
//         }
//     }

// }
