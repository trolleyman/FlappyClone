
const CAMERA_OFFSET_X = 50;
const BIRD_OFFSET_Y = 100;
const PIPE_SPACING_X = 100;

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
	this.pipe = new Image();
	this.pipe.src = "/img/pipe.gif";
	this.pipeHead = new Image();
	this.pipeHead.src = "/img/pipeHead.gif";
	
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
	var x = 200;
	for (var i = 0; i < 4; i++) {
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
		// check for backtick
		if (key === "Backquote") {
			this.debug = !this.debug;
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
	
	// check pipes. regen if not valid.
	for (var i = 0; i < this.pipes.length; i++) {
		var pipe = this.pipes[i];
		if (pipe.x + this.pipeHead.width < this.cameraX) {
			// not valid pipe, reuse.
			pipe.reuse(this.pipeMax);
			this.pipeMax += PIPE_SPACING_X;
		}
	}
}

Game.prototype.render = function() {
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
				c.drawImage(img, x, y);
				nx += 1;
			}
			ny += 1;
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
		this.drawStats();
	} else {
		this.stats.style.visibility = "hidden";
	}
	
	// draw blank background first
	tiledDrawImage(c, this.bgBlank);
	// draw textured background
	var offset = -this.bg.width - (this.cameraX % this.bg.width);
	tiledDrawImage(c, this.bg, offset, c.canvas.height - this.bg.height, undefined, 1);
	
	this.drawFlappy(c);
	
	// draw pipes
	for (var i = 0; i < this.pipes.length; i++) {
		this.drawPipe(c, this.pipes[i]);
	}
};

Game.prototype.drawStats = function() {
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
	var y = c.canvas.height - this.bird.posY;
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

Game.prototype.drawPipe = function(c, pipe) {
	// Draw lower head
	c.drawImage(this.pipeHead, pipe.x - this.cameraX, c.canvas.height - pipe.y);
	//c.drawImage(this.pipe);
}
