var cnvs, ctx;
var W, H;

function game_main() {
    cnvs = document.getElementById('cnvs');
    ctx = cnvs.getContext('2d');

    SOUND_POOL.init();

    resize_canvas();
    if (TOUCH_ENABLED) {
        init_touch();
    }

    setTimeout(function () {
        SOUND_POOL.playBgm("bgm_main", 0.1, true);
        init_game();
    }, 300);
}

// onload = main;


var player, particleSystem;
var enemy;
var InitialEnemyRadius;
const G_DUE_TO_GRAVITY = new Vec2(0, 0.01);
var background_scene;
function init_game() {
    let playerWidth = 90;  // these player widths and height will come from sprite sheet later if i made it 
    let playerHeight = 50; // just some hardcodes values for now :P
    let playerConnonHeight = 70;
    let playerConnonWidth = 15;

    InitialEnemyRadius = Math.max(playerWidth / 2, Math.min(W, H) / 7);

    player = new Player(new Vec2(W / 2 - playerWidth / 2, H - playerHeight - SPIKE_AMP), playerWidth, playerHeight, playerConnonWidth, playerConnonHeight);
    particleSystem = new ParticleSystem(W, H);

    enemy = new Enemy(new Vec2(W / 2, InitialEnemyRadius + SPIKE_AMP), InitialEnemyRadius, G_DUE_TO_GRAVITY);

    background_scene = new StarBuildingScene(ctx);


    // font rendering
    // ctx.textAlign="center";
    // ctx.textBaseline = "middle";

    add_listeners();
    game_loop();
}


var isGameOver = false;
const SPIKE_AMP = 20;
let then = 0;
let theEndAnim = 0;
let SCORE = 0;
function game_loop() {

    let now = performance.now();
    let dt = now - then;
    then = now;
    let fps = (1 / dt) * 1000;

    // ctx.clearRect(0, 0, W, H);
    background_scene.render(W / 2 - player.position.x);

    SCORE += getDscore();
    {
        let font_size = 12;
        ctx.textBaseline = "middle";
        ctx.textAlign = "left";
        ctx.font = font_size + "px arial";
        ctx.fillStyle = "RED";
        ctx.fillText("FPS : " + fps.toFixed(0), font_size, 100);
        ctx.fillText("SCORE : " + SCORE.toFixed(0), font_size, 100 + font_size + 5);
    }

    if (!isGameOver) handle_keyboard_input(); // input_handler.js
    if (!isGameOver) handle_mouse_input();

    // Terrible  TOUCH_ENABLED is in main.js
    // _CONTROLS_JOY_STICK will be defined only if its enabled
    // if (_CONTROLS_JOY_STICK && _CONTROLS_JOY_STICK_HR) {
    if (_CONTROLS_SHOOT_BUTTON && _CONTROLS_JOY_STICK && !isGameOver) {
        handle_touch_input();
        if (!_CONTROLS_SHOOT_BUTTON.isActive) {
            _CONTROLS_JOY_STICK.draw(ctx);
        }
        _CONTROLS_SHOOT_BUTTON.draw(ctx);
    }

    // // particleSystem.update(ctx);
    particleSystem.draw(ctx); // make sure we render our particle system first .


    player.draw(ctx, particleSystem, enemy);

    enemy.draw(ctx);

    draw_spike_boundary();

    constraint_enemy();


    if (!isGameOver && player.alive && enemy.alive) {
        // setTimeout(game_loop,1000/27.3);
        requestAnimationFrame(game_loop);
    } else {

        if (!enemy.alive) {
            if (!theEndAnim) {
                enemy.radius = 0;
                particleSystem.spawnAt(enemy.position);
                SOUND_POOL.playBgm("enemy_destroy", 1.0, false);
                theEndAnim = 1;
            }
            if (particleSystem.isEmpty()) {
                let _BONUS = 250; // bonus score to kill moon 
                game_over_screen("YAY ! \n You WON 👏👏👏\n Final Score:" + (Math.floor(SCORE) + _BONUS) + " \n Refresh To Play Again \n Dont Be Lazy 😜"); // Actually I Am Lazy
                return;
            } else {
                requestAnimationFrame(game_loop);
            }
            return;
        }
        if (!player.alive) {
            if (!theEndAnim) {
                // particleSystem.spawnAt(player.position);
                SOUND_POOL.playBgm("tank_destroyed", 1.0, false);
                theEndAnim = 1;
            }
            if (particleSystem.isEmpty()) {
                particleSystem.spawnAt(player.position);
                SOUND_POOL.playBgm("tank_angry", 1.0, false);
                game_over_screen("GAME OVER ! \n You Have Been Crushed 💀 \n Final Score:" + SCORE.toFixed(0) + " \n Refresh To Play Again \n Dont Be Lazy 😜");
                return;
            } else {
                requestAnimationFrame(game_loop);
            }
            return;
        }
        game_over_screen("GAME OVER ! \n You Loose 🤪 \n Final Score:" + SCORE.toFixed(0) + " \nRefresh To Play Again \n Dont Be Lazy 😜");
    }
}


function getDscore() {
    return 5 * (1 / (1 + enemy.position.copy().sub(new Vec2(W / 2, H / 2)).mag()));
}


function constraint_enemy(sound = true) {

    if (enemy.position.y < enemy.radius + SPIKE_AMP) {
        isGameOver = true;
        if (sound) SOUND_POOL.playBgm("wall_collide", 0.6, false);
        enemy.velocity.y *= -1;
        enemy.position.y = enemy.radius + SPIKE_AMP;
        particleSystem.spawnAt(new Vec2(enemy.position.x, enemy.position.y - enemy.radius));
    }
    if (enemy.position.y > (H - enemy.radius - SPIKE_AMP / 2)) {
        isGameOver = true;
        if (sound) SOUND_POOL.playBgm("wall_collide", 0.6, false);
        enemy.velocity.y *= -0.2;
        enemy.position.y = (H - enemy.radius - SPIKE_AMP / 2);
        particleSystem.spawnAt(new Vec2(enemy.position.x, enemy.position.y + enemy.radius));
    }

    if (enemy.position.x < enemy.radius + SPIKE_AMP) {
        isGameOver = true;
        if (sound) SOUND_POOL.playBgm("wall_collide", 0.6, false);
        enemy.velocity.x *= -0.5;
        enemy.position.x = enemy.radius + SPIKE_AMP;
        particleSystem.spawnAt(new Vec2(enemy.position.x - enemy.radius, enemy.position.y));
    }
    if (enemy.position.x > (W - enemy.radius - SPIKE_AMP)) {
        isGameOver = true;
        if (sound) SOUND_POOL.playBgm("wall_collide", 0.6, false);
        enemy.velocity.x *= -0.5;
        enemy.position.x = (W - enemy.radius - SPIKE_AMP);
        particleSystem.spawnAt(new Vec2(enemy.position.x + enemy.radius, enemy.position.y));
    }

}

let loop_back = 0;
let loop_back_move_num = Math.round(5 * Math.random());
let game_over_screenMSG;

function game_over_screen(message) {
    player.alive = true; //?incase  
    // ctx.clearRect(0, 0, W, H);
    background_scene.render(W / 2 - player.position.x);

    if (typeof message != typeof "hey") message = game_over_screenMSG; // dk why i am unable to pass arguments on requestAnimationFrame()
    else game_over_screenMSG = message;

    // // particleSystem.update(ctx);
    particleSystem.draw(ctx); // make sure we render our particle system first .



    player.draw(ctx, particleSystem, enemy);


    enemy.draw(ctx);

    draw_spike_boundary();
    constraint_enemy(false)





    if (loop_back-- <= 0) {
        loop_back = Math.floor(Math.random() * 50);
        loop_back_move_num = Math.round(24 * Math.random())
    }
    player_play_random_moves(loop_back_move_num);



    ctx.fillStyle = "rgba(0,0,0,0.8)";
    ctx.fillRect(0, 0, W, H);


    let fontSize = 20;
    ctx.font = fontSize + "px arial";
    ctx.textAlign = "left";
    ctx.fillStyle = "#FFF";
    let msgs = message.split('\n'); // actually i am lazy xD
    for (let i = 0; i < msgs.length; i++) {
        let text_width = ctx.measureText(msgs[i]).width;
        ctx.fillText(msgs[i], W / 2 - text_width / 2, H / 2 + i * fontSize * 1.5);
    }
    // debugger;
    requestAnimationFrame(game_over_screen);
}

function player_play_random_moves(moveNum = 0) {
    let r;
    switch (moveNum) {
        case 0:
            player.cannonAngle -= 0.1;
            r = Math.random();
            if (r < 0.5) break;
        case 1:
            player.cannonAngle += 0.1;
            r = Math.random();
            if (r < 0.5) break;
        case 2:
            player.moveLeft();
            r = Math.random();
            if (r < 0.5) break;
        case 3:
            player.moveRight();
            r = Math.random();
            if (r < 0.5) break;

        case 4:
            player.shootBullet();
            r = Math.random();
            if (r < 0.5) break;
    }

}

let spike_t = 0;
function draw_spike_boundary() {
    let spike_sin = Math.sin(spike_t);
    spike_t += 0.01;
    let gap = SPIKE_AMP / 4;
    let halfGap = (gap * 3 / 2) * spike_sin;
    ctx.fillStyle = "RED";
    // TOP
    ctx.beginPath();
    for (let i = 0; i <= (W + gap); i += gap) {
        // DOWN
        if (i == 0) {
            ctx.moveTo(i, 0);
        } else {
            ctx.moveTo(i, 0);
        }
        // SPIKE
        ctx.lineTo(i + halfGap, SPIKE_AMP);
        // DOWN
        ctx.lineTo(i + gap, 0);
    }
    ctx.fill();
    ctx.closePath(); //

    // BOTTOM
    ctx.beginPath();
    for (let i = 0; i <= (W + gap); i += gap) {
        // DOWN
        if (i == 0) {
            ctx.moveTo(i, H);
        } else {
            ctx.moveTo(i, H);
        }
        // SPIKE
        ctx.lineTo(i + halfGap, H - SPIKE_AMP);
        // DOWN
        ctx.lineTo(i + gap, H);
    }
    ctx.fill();
    ctx.closePath(); //

    // LEFT
    ctx.beginPath();
    for (let i = 0; i <= (H + gap); i += gap) {
        // DOWN
        if (i == 0) {
            ctx.moveTo(0, i);
        } else {
            ctx.moveTo(0, i);
        }
        // SPIKE
        ctx.lineTo(SPIKE_AMP, i + halfGap);
        // DOWN
        ctx.lineTo(0, i + gap);
    }
    ctx.fill();
    ctx.closePath(); // 

    // RIGHT
    ctx.beginPath();
    for (let i = 0; i <= (H + gap); i += gap) {
        // DOWN
        if (i == 0) {
            ctx.moveTo(W, i);
        } else {
            ctx.moveTo(W, i);
        }
        // SPIKE
        ctx.lineTo(W - SPIKE_AMP, i - halfGap);
        // DOWN
        ctx.lineTo(W, i + gap);
    }
    ctx.fill();
    ctx.closePath(); // 
}

function resize_canvas() {
    // if W > H
    W = cnvs.width = innerWidth;
    H = cnvs.height = innerHeight;

    cnvs.classList.remove('landscape');
    if (LANDSCAPE_MODE && H > W) {
        W = cnvs.width = innerHeight;
        H = cnvs.height = innerWidth;
        cnvs.classList.add('landscape');
    }
}

function add_listeners() {
    onkeydown = function (e) {
        if (!KEYBOARD.key_presses.includes(e.key.toLocaleLowerCase())) KEYBOARD.key_presses.push(e.key.toLocaleLowerCase());
    }
    onkeyup = function (e) {
        let idx = KEYBOARD.key_presses.indexOf(e.key.toLocaleLowerCase());
        if (idx != -1) KEYBOARD.key_presses.splice(idx, 1);
    }
    onblur = function (e) {
        MOUSE.state = MOUSE_STATE.up;
        KEYBOARD.key_presses = [];
    }

    onmousedown = function (e) {
        MOUSE.state = MOUSE_STATE.down;
    }
    onmouseup = function (e) {
        MOUSE.state = MOUSE_STATE.up;
    }
}
