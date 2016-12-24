
const CAMERA_OFFSET_X = 50;
const BIRD_OFFSET_Y = 100;

function Game() {
	// init canvas
	this.canvas = document.getElementById("canvas");
	var that = this;
	this.canvas.onmousedown = function(e) {
		if (e.button === 0) {
			that.lmbDown = true;
			console.log("lmb pressed");
		}
	};
	this.canvas.onmouseup = function(e) {
		if (e.button === 0) {
			that.lmbDown = false;
			console.log("lmb released");
		}
	};
	this.lmbDown = false;
	
	this.keys = [];
	this.keyUps = [];
	this.keyDowns = [];
	window.onkeyup = function(e) {
		that.keys[e.code] = false;
		that.keyUps[that.keyUps.length] = e.code;
	}
	window.onkeydown = function(e) {
		that.keys[e.code] = true;
		that.keyDowns[that.keyDowns.length] = e.code;
	}
	
	// load images
	this.bg = new Image();
	this.bg.src = "/img/background.gif";
	this.bgBlank = new Image();
	this.bgBlank.src = "/img/backgroundBlank.gif";
	this.flappy = [];
	for (var i = 0; i < 4; i++) {
		this.flappy[i] = new Image();
		this.flappy[i].src = "/img/flappy" + (i + 1) + ".png";
	}
	this.flappyi = 0.0; // current flappy frame
	this.flappyDt = 0.1; // seconds per flappy frame
	
	// init vars
	this.gravity = -180;
	this.prevTime = NaN;
	this.paused = false;
	this.dead = false;
	
	// init bird
	this.bird = new Bird();
	
	// init stats
	this.stats = new Stats(this);
	
	// init pipes
	this.pipes = []; // TODO
	var x = 100;
	for (var i = 0; i < 10; i++) {
		this.pipes[i] = new Pipe(x, 100, 100);
		x += 100;
	}
}

Game.prototype.mainLoop = function() {
	// update
	this.update();
	
	// render
	this.render();
	
	// set stats
	this.stats.gravity = this.gravity;
	var html = this.stats.toHTML();
	document.getElementById("stats").innerHTML = html;
	
	// reset keys pressed since last frame
	this.keyUps = [];
	this.keyDowns = [];
	window.requestAnimationFrame(this.mainLoop.bind(this));
};

Game.prototype.update = function() {
	// if escape has been pressed, toggle pause setting
	if (this.keyDowns.indexOf("Escape") !== -1) {
		this.paused = !this.paused;
		if (!this.paused)
		this.prevTime = Date.now().valueOf();
	}
	
	if (this.paused)
		return;
	
	// calculate timings
	var now = Date.now().valueOf();
	if (isNaN(this.prevTime)) {
		this.prevTime = now;
	}
	var dt = (now - this.prevTime) / 1000.0;
	this.prevTime = now;
	
	// update bird
	this.bird.update(dt, this.gravity, this.lmbDown);
	
	if (this.bird.posY < 0) {
		this.dead = true;
	} else {
		this.dead = false; // TODO
	}
	
	// update flappy frame #
	this.flappyi = (this.flappyi + (dt / this.flappyDt)) % this.flappy.length;
}

Game.prototype.render = function() {
	function tiledDrawImage(c, img, offsetX, offsetY) {
		if (typeof offsetX === "undefined")
			offsetX = 0;
		if (typeof offsetY === "undefined")
			offsetY = 0;
		
		var cw = c.canvas.width,
		    ch = c.canvas.height,
		    iw = img.width,
		    ih = img.height;
		
		if (iw == 0 || ih == 0)
			return;
		
		for (var y = offsetY; y < ch; y += ih) {
			for (var x = offsetX; x < cw; x += iw) {
				c.drawImage(img, x, y);
			}
		}
	}
	function tiledDrawImageX(c, img, offsetX, offsetY) {
		if (typeof offsetX === "undefined")
			offsetX = 0;
		if (typeof offsetY === "undefined")
			offsetY = 0;
		
		var cw = c.canvas.width,
		    iw = img.width;
		
		if (iw == 0)
			return;
		
		for (var x = offsetX; x < cw; x += iw) {
			c.drawImage(img, x, offsetY);
		}
	}
	
	var c = this.canvas.getContext("2d");
	
	// the camera is always at the bird pos.
	this.cameraX = this.bird.posX - CAMERA_OFFSET_X;
	
	// draw blank background first
	tiledDrawImage(c, this.bgBlank);
	// draw textured background
	var offset = -this.bg.width - (this.cameraX % this.bg.width);
	tiledDrawImageX(c, this.bg, offset, c.canvas.height - this.bg.height);
	
	var x = this.bird.posX - this.cameraX;
	var y = this.canvas.height - this.bird.posY;
	
	c.drawImage(this.flappy[Math.floor(this.flappyi)], x, y);
};
