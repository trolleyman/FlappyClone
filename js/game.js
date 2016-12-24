
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
	this.flappyi = 0; // current flappy frame
	this.flappyDt = 0.1; // seconds per flappy frame
	
	// init vars
	this.cameraX = 0;
	this.gravity = -180;
	this.prevTime = NaN;
	this.paused = false;
	this.dead = false;
	this.debug = true;
	
	// init bird
	this.bird = new Bird();
	
	// init stats
	this.stats = document.getElementById("stats");
	
	// init pipes
	this.pipes = []; // TODO
	var x = 100;
	for (var i = 0; i < 10; i++) {
		this.pipes[i] = new Pipe(x, 100, 100);
		x += 100;
	}
}

Game.prototype.mainLoop = function() {
	// process key presses
	this.processKeys();
	
	// update
	this.update();
	
	// render
	this.render();
	
	// reset keys pressed since last frame
	this.keyUps = [];
	this.keyDowns = [];
	window.requestAnimationFrame(this.mainLoop.bind(this));
};

Game.prototype.processKeys = function() {
	// if escape has been pressed, toggle pause setting
	if (this.keyDowns.indexOf("Escape") !== -1) {
		this.paused = !this.paused;
		if (!this.paused)
			this.prevTime = Date.now().valueOf();
	}
	// check for F1
	if (this.keyDowns.indexOf("Backquote") !== -1) {
		this.debug = !this.debug;
	}
	
	if (this.keyDowns.length > 0) console.log(this.keyDowns);
}

Game.prototype.update = function() {
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
	
	// get context
	var c = this.canvas.getContext("2d");
	// clear canvas - don't technically need this, but it's nice
	c.clearRect(0, 0, this.canvas.width, this.canvas.height);
	
	// the camera is always at the bird pos.
	this.cameraX = this.bird.posX - CAMERA_OFFSET_X;
	
	// if debugging is off, hide the stats panel
	if (this.debug) {
		this.renderStats();
	} else {
		this.stats.style.visibility = "hidden";
	}
	
	// draw blank background first
	tiledDrawImage(c, this.bgBlank);
	// draw textured background
	var offset = -this.bg.width - (this.cameraX % this.bg.width);
	tiledDrawImageX(c, this.bg, offset, c.canvas.height - this.bg.height);
	
	this.drawFlappy(c);
	
	// draw pipes
	for (var i = 0; i < this.pipes.length; i++) {
		
	}
};

Game.prototype.renderStats = function() {
	this.stats.style.visibility = "visible";
	
	var html = '';
	html += 'Paused: ' + this.paused + '<br>';
	html += 'Dead: ' + this.dead + '<br>';
	html += 'PosX: ' + this.bird.posX.toFixed(2) + '<br>';
	html += 'PosY: ' + this.bird.posY.toFixed(2) + '<br>';
	html += 'VelX: ' + this.bird.velX.toFixed(2) + '<br>';
	html += 'VelY: ' + this.bird.velY.toFixed(2) + '<br>';
	html += 'Gravity: ' + this.gravity;
	
	this.stats.innerHTML = html;
}

Game.prototype.drawFlappy = function(c) {
	// draw flappy bird
	var x = this.bird.posX - this.cameraX;
	var y = this.canvas.height - this.bird.posY;
	var ang = Math.atan(-this.bird.velY / this.bird.velX);
	
	if (this.debug) {
		c.beginPath();
		c.moveTo(x, y);
		c.lineTo(x + this.bird.velX, y - this.bird.velY);
		c.stroke();
		c.closePath();
	}
	
	// center x & y
	var img = this.flappy[Math.floor(this.flappyi)];
	offsetX = -img.width / 2;
	offsetY = -img.height / 2;
	
	c.translate(x, y);
	c.rotate(ang);
	c.translate(offsetX, offsetY);
	c.drawImage(img, 0, 0);
	c.translate(-offsetX, -offsetY);
	c.rotate(-ang); // faster than c.save(); c.restore();
	c.translate(-x, -y);
}
