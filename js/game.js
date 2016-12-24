
const CAMERA_OFFSET_X = 50;
const BIRD_OFFSET_Y = 100;
const PIPE_SPACING_X = 250;

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
	this.bg.src = "img/background.gif";
	this.bgBlank = new Image();
	this.bgBlank.src = "img/backgroundBlank.gif";
	this.flappy = [];
	for (var i = 0; i < 4; i++) {
		this.flappy[i] = new Image();
		this.flappy[i].src = "img/flappy" + i + ".png";
	}
	this.flappyi = 0; // current flappy frame
	this.flappyDt = 0.08; // seconds per flappy frame
	this.pipe = new Image();
	this.pipe.src = "img/pipe.png";
	this.pipeHead = new Image();
	this.pipeHead.src = "img/pipeHead.png";
	this.ground = new Image();
	this.ground.src = "img/ground.png";
	
	// init vars
	this.score = 0;
	this.cameraX = 0;
	this.gravity = -500;
	this.prevTime = NaN;
	this.paused = false;
	this.dead = false;
	this.debug = false;
	this.cameraUpdate = true;
	//this.startState = true;
	
	// init bird
	this.bird = new Bird();
	
	// init stats
	this.stats = document.getElementById("stats");
	
	// init pipes
	this.pipes = []; // TODO
	var x = 200;
	for (var i = 0; i < 10; i++) {
		this.pipes[i] = new Pipe(x);
		x += PIPE_SPACING_X;
	}
	this.pipeMax = x;
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
	for (var i = 0; i < this.keyDowns.length; i++) {
		var key = this.keyDowns[i];
		// if escape has been pressed, toggle pause setting
		if (key === "Escape") {
			this.paused = !this.paused;
			if (!this.paused)
				this.prevTime = Date.now().valueOf();
		}
		if (key === "Digit1") {
			this.debug = !this.debug;
		}
		if (key === "Digit2") {
			this.cameraUpdate = !this.cameraUpdate;
		}
		
		console.log("Key pressed:", key);
	}
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
	
	// check pipes. regen if not valid. add to score if passed.
	for (var i = 0; i < this.pipes.length; i++) {
		var pipe = this.pipes[i];
		if (!pipe.passed && pipe.x + this.pipeHead.width / 2 < this.bird.posX) {
			// score pipe
			this.score += 1;
			pipe.passed = true;
		}
		if (pipe.x + this.pipeHead.width < this.cameraX) {
			// not valid pipe, reuse.
			pipe.reuse(this.pipeMax);
			this.pipeMax += PIPE_SPACING_X;
		}
	}
}

function drawImage(c, img, x, y, w, h) {
	if (typeof w === "undefined" && typeof h === "undefined")
		c.drawImage(img, Math.round(x), Math.round(y));
	else
		c.drawImage(img, Math.round(x), Math.round(y), w, h);
}

function tiledDrawImage(c, img, offsetX, offsetY, maxX, maxY) {
	if (typeof offsetX === "undefined") offsetX = 0;
	if (typeof offsetY === "undefined") offsetY = 0;
	if (typeof maxX === "undefined") maxX = Infinity;
	if (typeof maxY === "undefined") maxY = Infinity;
	
	var cw = c.canvas.width,
		ch = c.canvas.height,
		iw = img.width,
		ih = img.height;
	
	if (iw == 0 || ih == 0)
		return;
	
	var ny = 0;
	for (var y = offsetY; y < ch && ny < maxY; y += ih) {
		var nx = 0;
		for (var x = offsetX; x < cw && nx < maxX; x += iw) {
			drawImage(c, img, x, y, iw, ih);
			nx += 1;
		}
		ny += 1;
	}
}

Game.prototype.render = function() {
	// get context
	var c = this.canvas.getContext("2d");
	// clear canvas - don't technically need this, but it's nice
	c.clearRect(0, 0, this.canvas.width, this.canvas.height);
	// we want that pixel-y feel!
	c.imageSmoothingEnabled = false;
	
	// the camera is always at the bird pos.
	if (this.cameraUpdate)
		this.cameraX = this.bird.posX - CAMERA_OFFSET_X;
	
	// if debugging is off, hide the stats panel
	if (this.debug) {
		this.drawStats();
	} else {
		this.stats.style.visibility = "hidden";
	}
	
	// draw blank background first
	tiledDrawImage(c, this.bgBlank);
	// draw textured background
	var offsetBg = -this.bg.width - ((this.cameraX / 2) % this.bg.width);
	tiledDrawImage(c, this.bg, offsetBg, c.canvas.height - this.bg.height, undefined, 1);
	
	// draw pipes
	for (var i = 0; i < this.pipes.length; i++) {
		this.drawPipe(c, this.pipes[i]);
	}
	
	// draw ground
	var offsetGround = -this.ground.width - (this.cameraX % this.ground.width);
	tiledDrawImage(c, this.ground, offsetGround, c.canvas.height - this.ground.height, undefined, 1);
	
	// draw flappy bird
	this.drawFlappy(c);
};

Game.prototype.drawStats = function() {
	this.stats.style.visibility = "visible";
	
	var html = "";
	html += "Score: " + this.score + "<br>";
	html += "Paused: " + this.paused + "<br>";
	html += "Dead: " + this.dead + "<br>";
	html += "PosX: " + this.bird.posX.toFixed(2) + "<br>";
	html += "PosY: " + this.bird.posY.toFixed(2) + "<br>";
	html += "VelX: " + this.bird.velX.toFixed(2) + "<br>";
	html += "VelY: " + this.bird.velY.toFixed(2) + "<br>";
	html += "Gravity: " + this.gravity;
	
	this.stats.innerHTML = html;
}

Game.prototype.drawFlappy = function(c) {
	// draw flappy bird
	var x = this.bird.posX - this.cameraX;
	var y = c.canvas.height - this.bird.posY;
	var ang = Math.atan(-this.bird.velY / this.bird.velX);
	
	if (this.debug) {
		// Draw velocity vector
		c.beginPath();
		c.moveTo(x, y);
		c.lineTo(x + this.bird.velX, y - this.bird.velY);
		c.strokeStyle = "black";
		c.stroke();
		
		// draw path
		c.beginPath();
		c.moveTo(x, y);
		for (var i = 0; i < 500; i++) { // predict path 200 pixels in front
			var t = i / this.bird.velX;
			// s = ut + (1/2)at^2
			var s = this.bird.velY*t + 0.5*this.gravity*t*t;
			c.lineTo(x + i, y - s);
		}
		c.strokeStyle = "red";
		c.stroke();
	}
	
	// center x & y
	var img = this.flappy[Math.floor(this.flappyi)];
	offsetX = -img.width / 2;
	offsetY = -img.height / 2;
	
	c.translate(x, y);
	c.rotate(ang);
	c.translate(offsetX, offsetY);
	drawImage(c, img, 0, 0);
	c.translate(-offsetX, -offsetY);
	c.rotate(-ang); // faster than c.save(); c.restore();
	c.translate(-x, -y);
}

Game.prototype.drawPipe = function(c, pipe) {
	var x = pipe.x - this.cameraX;
	var ly = c.canvas.height - pipe.y;
	var uy = ly - pipe.spacing;
	
	// draw upper pipe
	c.scale(1, -1);
	tiledDrawImage(c, this.pipe, x, -uy, 1, undefined);
	c.scale(1, -1);
	drawImage(c, this.pipeHead, x, uy);
	
	// draw lower pipe
	tiledDrawImage(c, this.pipe, x, ly, 1, undefined);
	drawImage(c, this.pipeHead, x, ly);
}
