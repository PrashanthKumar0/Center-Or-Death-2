/**
 * 2D vector library made for my physics engine
 * 
 * This Tiny Library Includes following vector operations
 * 
 * * ---[Basic Operations]-----------------------
 * add                              add(Vec2) 
 * subtract                         sub(Vec2)
 * scalar multiplication            scale(int,float)
 * scalar product [dot product]     dot(Vec2)
 * vector product [cross product]   cross(Vec2)  
 * ![NOTE:] 
 *          Just because we are making a 2D vector library 
 *          it dosent make sense to have resultant of cross product
 *          to be perpendicular to both x,y axis(i.e z axis) so 
 *          we just return magnitude of it   
 * 
 * * ---[Transformation Operations]----------------- 
 * translate                        add(Vec2) or sub(Vec2)
 * rotation Along a point/vector    rotate(Vec2)
 * ![NOTE:] WE TAKE ANGLE IN DEGREE BECAUSE ITS MORE CONVINIENT 
 *          ALTHOUGH USING RADIAN IS BETTER BECAUSE WE DONT NEED TO PERFORM CONVERSION
 *
 * * ---[MISC Operations]-----------------
 *  copy() returns a copy of self
 *  length of vector                 len()
 *  normalized form of vector        normalize()
 */



const _TO_RADIAN_VEC2 = (Math.PI / 180); //we precompute this 

// 2DVector Prototype   
function Vec2(x = 0, y = 0) { this.x = x; this.y = y; }


//* ---[Basic Operations]-----------------------

Vec2.prototype.add = function (vec2) {
    this.x += vec2.x; this.y += vec2.y;
    return this;
}

Vec2.prototype.sub = function (vec2) {
    this.x -= vec2.x; this.y -= vec2.y;
    return this;
}

Vec2.prototype.scale = function (fac) {
    this.x *= fac; this.y *= fac;
    return this;
}

Vec2.prototype.dot = function (vec2) {
    return this.x * vec2.x + this.y * vec2.y;
}

/*
    | x1    y1  | = x1 * y2 - x2 * y1
    | x2    y2  | 
*/
Vec2.prototype.cross = function (vec2) {
    return this.x * vec2.y - this.y * vec2.x;
}


//* ---[Transformation Operations]-----------------


Vec2.prototype.rotate = function (vec2, angle) {
    let theta = _TO_RADIAN_VEC2 * angle; //convert to radian

    //first we translate vec2 to zero (its same as moving current vector to vec2)
    this.x -= vec2.x;
    this.y -= vec2.y;
    //now that we are at origin(psudo origin to say) 
    //we can apply our normal rotation formula from linear transformations
    let x = this.x;
    let y = this.y;
    // rotate(x',y',phi) = (x*cos(phi)-y*sin(phi), x*sin(phi)+y*cos(phi))
    let sinTheta = Math.sin(theta);
    let cosTheta = Math.cos(theta);
    this.x = x * cosTheta - y * sinTheta;
    this.y = x * sinTheta + y * cosTheta;
    //undo translation
    this.x += vec2.x;
    this.y += vec2.y;

    return this;
}



//* ---[MISC Operations]-----------------

Vec2.prototype.copy = function () {
    return new Vec2(this.x, this.y);
}

Vec2.prototype.len = function () {
    return Math.hypot(this.x, this.y);
}

Vec2.prototype.mag = function () {
    return Math.hypot(this.x, this.y);
}


Vec2.prototype.normalize = function () {
    let l = this.len();
    this.x /= l;
    this.y /= l;
    return this;
}

Vec2.prototype.setAngle = function (angle) {
    let len = this.len();
    this.x = len * Math.cos(angle);
    this.y = len * Math.sin(angle);
    return this;
}
Vec2.prototype.magSq = function () {
    return this.x * this.x + this.y * this.y;
}