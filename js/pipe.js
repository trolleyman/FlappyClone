
function Pipe(x, y, spacing) {
	this.reuse(x);
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
}

const PIPE_H = 2000;

Pipe.prototype.bbUpper = function(w, canvasH) {
	return new Rect(this.x, canvasH - this.y - this.spacing - PIPE_H, w, PIPE_H, 0);
}
Pipe.prototype.bbLower = function(w, canvasH) {
	return new Rect(this.x, canvasH - this.y, w, PIPE_H, 0);
}
