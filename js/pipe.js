
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
