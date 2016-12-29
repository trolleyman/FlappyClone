
function Pipe(x, y, spacing) {
	this.reuse(x, y, spacing);
}

Pipe.prototype.reuse = function(x, y, spacing) {
	if (typeof y === "undefined")
		y = Math.random() * 300 + 200;
	if (typeof spacing === "undefined")
		spacing = 150;
	
	this.x = x;
	this.y = y;
	this.spacing = spacing;
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
