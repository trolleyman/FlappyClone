
const BIRD_START_Y = 300;
const MAX_VEL_Y = 300;
const LMB_MAX_DT = 0.15;

function calculateAngle(x, y) {
	return Math.atan(-y / x);
}

function Bird() {
	this.posX = 0;
	this.posY = BIRD_START_Y;
	
	this.velX = 150;
	this.velY = 20;
	
	this.ang = calculateAngle(this.velX, this.velY);
	this.prevAng = this.ang;
	
	this.lmbDownDt = 0;
	this.t = 0;
}

Bird.prototype.update = function update(dt, gravity, lmbDown, startState, groundHeight, flappyHeight) {
	if (startState) {
		// oscillate around a point
		this.t += dt;
		this.t %= Math.PI * 2;
		this.velY = Math.sin(this.t * 6) * 40;
	}
	// if on the ground
	var h = groundHeight + flappyHeight / 2;
	if (this.posY <= h && this.velY < 0) {
		this.velY = 0;
	}
	if (this.posY < h) {
		this.posY = h;
	}
	this.posX += dt * this.velX;
	this.posY += dt * this.velY;
	
	this.ang = calculateAngle(this.velX, this.velY);
	this.ang = (this.ang - this.prevAng) * Math.min(1, 20 * dt) + this.prevAng; // lerp
	this.prevAng = this.ang;
	
	if (!startState)
		this.velY += dt * gravity;
	
	if (lmbDown) {
		this.lmbDownDt += dt;
		if (this.lmbDownDt <= LMB_MAX_DT) {
			this.velY = MAX_VEL_Y * (this.lmbDownDt / LMB_MAX_DT);
		}
	} else {
		this.lmbDownDt = 0;
	}
}
