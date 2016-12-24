
function Pipe(x, y, spacing) {
	this.reuse(x);
}

Pipe.prototype.reuse = function(x, y, spacing) {
	if (typeof y === "undefined")
		y = Math.random() * 500 + 100;
	if (typeof spacing === "undefined")
		spacing = 100;
	
	this.x = x;
	this.y = y;
	this.spacing = spacing;
}
