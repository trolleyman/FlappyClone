
function Button(x, y, img, f) {
	this.x = x; // this can be a function
	this.y = y; // this can also be a function
	this.img = img;
	this.f = f;
}

Object.defineProperty(Button.prototype, 'x', {
	get: function() {
		if (typeof this._x === "function") return this._x();
		else return this._x;
	},
	set: function(x) { this._x = x; },
});
Object.defineProperty(Button.prototype, 'y', {
	get: function() {
		if (typeof this._y === "function") return this._y();
		else return this._y;
	},
	set: function(y) { this._y = y; },
});

Button.prototype.draw = function(c) {
	var x = this.x;
	if (typeof this.x === "function")
		x = this.x(); // generate x
	
	var y = this.y;
	if (typeof this.y === "function")
		y = this.y(); // generate y

	drawImage(c, this.img, x, y);
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