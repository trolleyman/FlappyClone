
function Pipe(x, y, spacing, multiplayer) {
	this.reuse(x, y, spacing, multiplayer);
}

Pipe.prototype.reuse = function(x, y, spacing, multiplayer) {
	if (typeof y === "undefined")
		y = Math.random();
	y = y * 300 + 200;
	if (typeof spacing === "undefined")
		spacing = 150;
	if (typeof multiplayer === "undefined")
		multiplayer = false;
	
	this.x = x;
	this.y = y;
	this.spacing = spacing;
	this.multiplayer = multiplayer;
	this.passed = false;
	if (typeof this.upperCache === "undefined")
		this.upperCache = new Rect();
	if (typeof this.lowerCache === "undefined")
		this.lowerCache = new Rect();
}

const PIPE_H = 2000;

Pipe.prototype.bbUpper = function(w) {
	this.upperCache.reuse(this.x + w/2, this.y + this.spacing + PIPE_H/2, w, PIPE_H, 0);
	return this.upperCache;
}
Pipe.prototype.bbLower = function(w) {
	this.lowerCache.reuse(this.x + w/2, this.y / 2, w, this.y, 0);
	return this.lowerCache;
}
