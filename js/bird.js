
function Bird() {
	this.posX = 0;
	this.posY = 300;
	
	this.velX = 150;
	this.velY = 20;
	
	this.lmbDownPrev = false;
}

Bird.prototype.update = function update(dt, gravity, lmbDown) {
	this.posX += dt * this.velX;
	this.posY += dt * this.velY;
	
	this.velY += dt * gravity;
		
	if (lmbDown && !this.lmbDownPrev) {
		this.velY = 250;
	}
	
	this.lmbDownPrev = lmbDown;
}
