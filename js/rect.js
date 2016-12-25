function Rect(x, y, w, h, rot) {
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	this.rot = rot;
}

Rect.prototype.render = function(c) {
	// center x & y
	offsetX = -this.w / 2;
	offsetY = -this.h / 2;
	
	c.translate(this.x, this.y);
	c.rotate(this.rot);
	c.translate(offsetX, offsetY);
	c.strokeRect(0, 0, this.w, this.h);
	c.translate(-offsetX, -offsetY);
	c.rotate(-this.rot); // faster than c.save(); c.restore();
	c.translate(-this.x, -this.y);
}