// Most important dependencies
const TWO_PI = Math.PI * 2;
const TO_RADIAN = Math.PI / 180;

function rand(min, max, round = false) {
    let r = Math.random() * (max - min) + min;
    // return r * !round + Math.round(r) * round; // just to avoid ifs and elses
    if (round) {
        return Math.round(r);
    }
    return r;
}

// DOM


function $(el) {
    return document.getElementById(el);
}

function _(el) {
    return document.querySelectorAll(el);
}



// DEBUG FUNCTIONS
function DebugA(msg) { // append
    if (!$("debug")) return;
    $("debug").innerHTML += "<br>" + msg;
}

function Debug(msg) { // truncate
    if (!$("debug")) return;
    $("debug").innerHTML = msg;
}
