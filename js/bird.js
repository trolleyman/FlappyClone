
const BIRD_START_Y = 300;

function Bird() {
	this.posX = 0;
	this.posY = BIRD_START_Y;
	
	this.velX = 150;
	this.velY = 20;
	
	this.lmbDownPrev = false;
	this.t = 0;
}

Bird.prototype.update = function update(dt, gravity, lmbDown, startState) {
	if (startState) {
		// oscillate around a point
		this.velY = 0;
		this.t += dt;
		this.t %= Math.PI * 2;
		this.posY = BIRD_START_Y + Math.sin(this.t * 8) * 10;
	}
	this.posX += dt * this.velX;
	this.posY += dt * this.velY;
	
	if (!startState)
		this.velY += dt * gravity;
		
	if (lmbDown && !this.lmbDownPrev) {
		this.velY = 250;
	}
	
	this.lmbDownPrev = lmbDown;
}
