
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

function DisableButton(x, y, img, imgDisabled, f, isDisabled) {
	this.x = x;
	this.y = y;
	this.img = img;
	this.imgDisabled = imgDisabled;
	this.f = f;
	this.isDisabled = isDisabled;
}

DisableButton.prototype.draw = function(c) {
	if (this.isDisabled())
		drawImage(c, this.imgDisabled, this.x, this.y);
	else
		drawImage(c, this.img, this.x, this.y);
}

DisableButton.prototype.handleClick = function(x, y) {
	if (this.isDisabled()) {
		return false; // disabled
	}
	if (x >= this.x && x < this.x + this.img.width && y >= this.y && y < this.y + this.img.height) {
		this.f();
		return true;
	}
	return false;
}