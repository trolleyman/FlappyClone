
function Bird() {
	this.posX = 0;
	this.posY = 300;
	
	this.velX = 100;
	this.velY = 20;
	
	this.lmbDownDt = 0; // TODO
}

Bird.prototype.update = function update(dt, gravity, lmbDown) {
	this.posX += dt * this.velX;
	this.posY += dt * this.velY;
	
	this.velY += dt * gravity;
		
	if (lmbDown) {
		this.velY = 250;
	}
}
