
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
	
	this.flapDownDt = 0;
	this.t = 0;
	
	this.dead = false;
}

Bird.prototype.getBB = function(w, h) {
	return new Rect(this.posX, this.posY, w, h, this.ang);
}
