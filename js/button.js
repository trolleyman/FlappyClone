
function Button(x, y, img, f) {
	this.x = x;
	this.y = y;
	this.img = img;
	this.f = f;
}

Button.prototype.draw = function(c) {
	drawImage(c, this.img, this.x, this.y);
}

Button.prototype.handleClick = function(x, y) {
	if (x >= this.x && x < this.x + this.img.width && y >= this.y && y < this.y + this.img.height) {
		this.f();
		return true;
	}
	return false;
}