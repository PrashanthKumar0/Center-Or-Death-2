class Star {
    constructor(position, radius) {
        // let star_colors = ["#FFF","#FDD","#DDF"];
        // this.colors = ["#FFF", "#FDD", "#DDF"];
        this.colors = ["#FFF", "OrangeRed", "Hotpink", "aqua"];
        this.position = position;
        this.radius = radius;
        this.t = Math.random() * Math.PI * 2;
        // this.color=star_colors[Math.round(Math.random()*star_colors.length)];
    }
    draw(ctx, playerPosXDiff, worldW, worldH) {
        let x = this.position.x + playerPosXDiff * 0.001; // stars are far away than building so its 0.001
        let y = this.position.y;
        let r = this.radius * 0.5 * (1 - Math.sin(this.t));
        ctx.fillStyle =
            this.colors[Math.round(Math.random() * this.colors.length)];
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();

        this.t += ((Math.random() - 0.5) * 2) / 100;
        this.position.x += ((Math.random() - 0.5) * 2) / 10;
        this.position.y += ((Math.random() - 0.5) * 2) / 10;

        this.wrapAround(worldW, worldH);
    }
    wrapAround(w, h) {
        if (this.position.x < 0) {
            this.position.x = w;
        }
        if (this.position.x > w) {
            this.position.x = 0;
        }

        if (this.position.y < 0) {
            this.position.y = h;
        }
        if (this.position.y > h) {
            this.position.y = 0;
        }
    }
}
class Building {
    constructor(position, width, height, color, parallax) {
        this.position = position;
        this.width = width;
        this.height = height;
        this.parallax = parallax;
        this.color = color;
        // TODO : add windows to buildings
    }

    draw(ctx, playerPosXDiff) {
        let x = this.position.x + playerPosXDiff * this.parallax;
        let y = this.position.y;

        ctx.fillStyle = this.color || "#000";
        ctx.fillRect(x, y, this.width, this.height);
    }
}

class StarBuildingScene {
    constructor(canvas_context) {
        this.stars = [];
        this.buildings = [];

        this.worldW = canvas_context.canvas.width;
        this.worldH = canvas_context.canvas.height;

        this.buildingMaxW = 100;
        this.buildingMinW = 50;
        this.ctx = canvas_context;

        this.skyGrad = this.ctx.createLinearGradient(0, 0, 0, H); // To bottom
        this.skyGrad.addColorStop(0, "Black");
        this.skyGrad.addColorStop(1, "MidNightBlue");

        this.genScene();
    }

    genScene() {
        const W = this.worldW;
        const H = this.worldH;
        let w = 0;
        for (let x = -this.buildingMaxW; x < W + this.buildingMaxW; x += w) {
            // back Building
            w = Math.round(this.rand(this.buildingMinW, this.buildingMaxW));
            let y = H / 2 + this.rand(0, H / 3);
            let h = H - y;
            let p = 0.01;
            let color = "#0A0A0A"; // fade away :P farthest building appears lighter
            this.buildings.push(new Building({ x, y }, w, h, color, p)); // TODO : use vec2
        }

        for (let x = -this.buildingMaxW; x < W + this.buildingMaxW; x += w) {
            // back Building
            w = Math.round(this.rand(this.buildingMinW, this.buildingMaxW));
            let y = H / 2 + this.rand(0, H / 3);
            let h = H - y;
            let p = 0.04;
            let color = "#000"; // fade away :P farthest building appears lighter
            this.buildings.push(new Building({ x, y }, w, h, color, p)); // TODO : use vec2
        }

        for (let i = 0; i < 200; i++) {
            // 200 stars
            let x = this.rand(0, W);
            let y = this.rand(0, H);
            let r = this.rand(0.5, 1.5);
            this.stars.push(new Star({ x, y }, r));
        }
    }

    rand(min, max) {
        return Math.random() * (max - min) + min;
    }

    render(playerPosXDiff) {
        this.ctx.fillStyle = this.skyGrad; // sky
        this.ctx.fillRect(0, 0, this.worldW, this.worldH);

        this.stars.forEach((s) => {
            s.draw(this.ctx, playerPosXDiff, this.worldW, this.worldH);
        });
        this.buildings.forEach((b) => {
            b.draw(this.ctx, playerPosXDiff);
        });
    }
}
