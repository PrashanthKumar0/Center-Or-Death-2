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