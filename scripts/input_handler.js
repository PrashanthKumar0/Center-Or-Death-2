const KEYBOARD = {
    key_presses: [],
};
const MOUSE_STATE = {
    up: 0,
    down: 1,
};
const MOUSE = {
    state: MOUSE_STATE.up,
};

const _CONTROLS_TANK_FIRE_VOLUME = 0.6;
const _CONTROLS_TANK_MOVE_VOLUME = 0.4;
const _CONTROLS_TANK_BARREL_VOLUME = 0.4;

function handle_keyboard_input() {
    KEYBOARD.key_presses.forEach((key) => {
        switch (key) {
            case "q":
                player.cannonAngle -= 0.1;
                SOUND_POOL.playBgm("tank_barrel", _CONTROLS_TANK_BARREL_VOLUME);
                break;
            case "e":
                player.cannonAngle += 0.1;
                SOUND_POOL.playBgm("tank_barrel", _CONTROLS_TANK_BARREL_VOLUME); // volume will be same?
                break;
            case "arrowleft":
            case "a":
                player.moveLeft();
                SOUND_POOL.playBgm("tank_move", _CONTROLS_TANK_MOVE_VOLUME);
                break;
            case "arrowright":
            case "d":
                player.moveRight();
                SOUND_POOL.playBgm("tank_move", _CONTROLS_TANK_MOVE_VOLUME);
                break;
            case "arrowup":
            case "w":
                player.shootBullet();
                SOUND_POOL.play("tank_fire", _CONTROLS_TANK_FIRE_VOLUME, 150);
                break;
        }
    });
    if (KEYBOARD.key_presses.length == 0) {
        SOUND_POOL.pause("tank_move");

        SOUND_POOL.pause("tank_barrel");
    }

    if (
        !(
            KEYBOARD.key_presses.includes("q") ||
            KEYBOARD.key_presses.includes("e")
        )
    ) {
        SOUND_POOL.pause("tank_barrel");
    }

    if (
        !(
            KEYBOARD.key_presses.includes("arrowup") ||
            KEYBOARD.key_presses.includes("arrowleft") ||
            KEYBOARD.key_presses.includes("a") ||
            KEYBOARD.key_presses.includes("arrowright") ||
            KEYBOARD.key_presses.includes("d")
        )
    ) {
        SOUND_POOL.pause("tank_move");
    }
}

function handle_mouse_input() {
    if (CLICK_TO_SHOOT_MODE) {
        if (MOUSE.state == MOUSE_STATE.down) {
            player.shootBullet();
            SOUND_POOL.play("tank_fire", _CONTROLS_TANK_FIRE_VOLUME, 150);
        }
    }
}

var _CONTROLS_JOY_STICK;
var _CONTROLS_SHOOT_BUTTON;

function init_touch() {
    let jR = Math.max(Math.min(W, H) / 5, 50);
    _CONTROLS_JOY_STICK = new JoyStick(new Vec2(jR + 10, H - jR - 10), jR);

    let bR = 45;
    _CONTROLS_SHOOT_BUTTON = new Button(
        new Vec2(W - bR - 10, H - bR - 10),
        bR,
        "🔫"
    );

    // let jW = Math.max(W / 6, 80);
    // let jH = jW / 4;
    // let jPos = new Vec2(10 + jH, H - jH * 4);
    // _CONTROLS_JOY_STICK_HR = new HorizontalJoyStick(jPos, jW, jH);

    set_touch_listeners();
}

let _CONTROLS_CANNON_PREV_ANGLE = 0;

function handle_touch_input() {
    if (_CONTROLS_SHOOT_BUTTON.isActive) {
        player.shootBullet();
        SOUND_POOL.play("tank_fire", _CONTROLS_TANK_FIRE_VOLUME, 70);
        // return; // we dont want to do anything else
    }

    if (_CONTROLS_JOY_STICK.isActive) {
        let jS = _CONTROLS_JOY_STICK.getCap();
        player.setCannonAngle(Math.atan2(jS.y, jS.x) + Math.PI / 2);
        if (player.cannonAngle != _CONTROLS_CANNON_PREV_ANGLE) {
            SOUND_POOL.play("tank_barrel", _CONTROLS_TANK_BARREL_VOLUME);
        }
        _CONTROLS_CANNON_PREV_ANGLE = player.cannonAngle;

        // pos
        let rX = new Vec2(1, 0);
        let rM = jS.dot(rX);
        let rD = Math.abs(rM);
        rX.scale(rM);
        if (rD > 0.3) {
            player.move(rX.x);
            SOUND_POOL.play("tank_move", _CONTROLS_TANK_MOVE_VOLUME);
        }
    }
}

function set_touch_listeners() {
    ontouchstart = function (e) {
        for (let i = 0; i < e.touches.length; i++) {
            let id = e.touches[i].identifier;
            let touchVec = new Vec2(e.touches[i].clientX, e.touches[i].clientY);
            if (LANDSCAPE_MODE) {
                touchVec = new Vec2(touchVec.y, ctx.canvas.height - touchVec.x);
            }
            // _CONTROLS_JOY_STICK.moveTo(touchVec);
            _CONTROLS_JOY_STICK.touchDown(touchVec, id);

            _CONTROLS_SHOOT_BUTTON.touchDown(touchVec, id);

        }
        // handle_joy_stick();
    };
    ontouchmove = function (e) {
        for (let i = 0; i < e.touches.length; i++) {

            let touchVec = new Vec2(e.touches[i].clientX, e.touches[i].clientY);

            let id = e.touches[i].identifier;
            if (LANDSCAPE_MODE) {
                touchVec = new Vec2(touchVec.y, ctx.canvas.height - touchVec.x);
            }

            _CONTROLS_JOY_STICK.update(touchVec, id);

            _CONTROLS_SHOOT_BUTTON.touchDown(touchVec, id);
        }

        // handle_joy_stick();
    };
    ontouchend = function (e) {
        _CONTROLS_JOY_STICK.touchUp(e.changedTouches[0].identifier);
        _CONTROLS_SHOOT_BUTTON.touchUp(e.changedTouches[0].identifier);
        SOUND_POOL.pause("tank_barrel");
        SOUND_POOL.pause("tank_move");
        console.log('te'); // temp
    };
}
