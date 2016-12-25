"use strict";

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
	this.debugView = false;
	this.debugAllowed = true; // is debugging allowed?
	this.cameraUpdate = true; // update the camera to be locked onto the bird?
	this.startState = true;
	this.deadState = false;
	
	// init bird
	this.bird = new Bird();
	
	// init stats
	this.stats = document.getElementById("stats");
	
	// init pipes
	this.pipes = [];
	for (var i = 0; i < 10; i++) {
		this.pipes[i] = new Pipe(-200);
	}
}

Object.defineProperty(Game.prototype, 'flappyCurrent', {
	get: function() { return this.flappy[Math.floor(this.flappyi)]; },
});
Object.defineProperty(Game.prototype, 'flapButtonDown', {
	get: function() { return this.lmbDown || this.keys["Space"]; },
});
Object.defineProperty(Game.prototype, 'playingState', {
	get: function() { return !this.startState && !this.deadState; },
});

Game.prototype.mainLoop = function() {
	window.requestAnimationFrame(this.mainLoop.bind(this));
	// process key presses
	this.processKeys();
	
	// update
	this.update();
	
	// render
	this.render();
	
	// reset keys pressed since last frame
	this.keyUps = [];
	this.keyDowns = [];
};

Game.prototype.processKeys = function() {
	for (var i = 0; i < this.keyDowns.length; i++) {
		var key = this.keyDowns[i];
		// if escape has been pressed, toggle pause setting
		if (key === "Escape" && (this.debugAllowed || this.playingState)) {
			this.paused = !this.paused;
			if (!this.paused)
				this.prevTime = Date.now().valueOf();
		}
		if (key === "Digit1" && this.debugAllowed) {
			this.debugView = !this.debugView;
		}
		if (key === "Digit2" && this.debugAllowed) {
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
	
	// check if time to start
	if (this.startState && this.flapButtonDown) {
		this.startState = false;
		
		var x = this.bird.posX + 800;
		for (var i = 0; i < 10; i++) {
			this.pipes[i] = new Pipe(x);
			x += PIPE_SPACING_X;
		}
		this.pipeMax = x;
	}
	
	// update flappy frame #
	if (!this.deadState)
		this.flappyi = (this.flappyi + (dt / this.flappyDt)) % this.flappy.length;
	
	// update bird
	this.updateFlappy(dt);
	
	// check pipes. regen if not valid. add to score if passed.
	if (!this.startState) {
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
}

Game.prototype.updateFlappy = function(dt) {
	var bird = this.bird;
	
	if (!this.startState)
		bird.velY += dt * this.gravity;
	
	if (this.startState) {
		// oscillate around a point if in start mode
		bird.t += dt;
		bird.t %= Math.PI * 2;
		bird.velY = Math.sin(bird.t * 6) * 40;
	}
	// if on the ground
	var h = this.ground.height + this.flappyCurrent.height / 2;
	if (bird.posY <= h && bird.velY < 0) {
		bird.velY = 0;
	}
	if (bird.posY < h) {
		bird.posY = h;
	}
	// update positions using velocity
	bird.posX += dt * bird.velX;
	bird.posY += dt * bird.velY;
	
	// bird angle logic
	bird.ang = calculateAngle(bird.velX, bird.velY);
	bird.ang = (bird.ang - bird.prevAng) * Math.min(1, 20 * dt) + bird.prevAng; // lerp
	bird.prevAng = bird.ang;
	
	// bird flap logic
	if (!this.deadState) {
		if (this.flapButtonDown) {
			bird.flapDownDt += dt;
			if (bird.flapDownDt <= LMB_MAX_DT) {
				bird.velY = MAX_VEL_Y * (bird.flapDownDt / LMB_MAX_DT);
			}
		} else {
			bird.flapDownDt -= dt * 2;
			bird.flapDownDt = Math.max(0, bird.flapDownDt);
		}
	}
	
	// check for collisions with pipes. if a collision is found, kill the bird
	if (!this.deadState) {
		var bb = bird.getBB(this.flappyCurrent.width, this.flappyCurrent.height);
		for (var i = 0; i < this.pipes.length; i++) {
			var pipe = this.pipes[i];
			
			var ru = pipe.bbUpper(this.pipeHead.width);
			var rl = pipe.bbLower(this.pipeHead.width);
			
			var intersected = false;
			if (bb.intersects(ru)) {
				console.log("bird intersects with pipe " + i + " (UPPER)");
				intersected = true;
			} else if (bb.intersects(rl)) {
				console.log("bird intersects with pipe " + i + " (LOWER)");
				intersected = true;
			}
			if (intersected) {
				this.deadState = true;
				bird.velX = 0;
				bird.velY = 200;
			}
		}
	}
}

function drawImage(c, img, x, y) {
	var w = img.width, h = img.height;
	c.drawImage(img, 0, 0, w, h, Math.round(x), Math.round(y), w, h);
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
	if (this.debugView) {
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

	// draw score
	this.drawUI(c);
};

function drawFlappyText(c, text, startX, startY, col) {
	function drawText(c, text, startX, startY, x, y) {
		if (typeof x === "undefined") x = 0;
		if (typeof y === "undefined") y = 0;
		var sc = 5;
		x *= sc;
		y *= sc;
		c.fillText(text, startX + x, startY + y);
	}
	if (typeof col === "undefined")
		col = "white";
	
	c.fillStyle = "black";
	drawText(c, text, startX, startY,  1,  1);
	drawText(c, text, startX, startY,  1, -1);
	drawText(c, text, startX, startY, -1,  1);
	drawText(c, text, startX, startY, -1, -1);
	c.fillStyle = col;
	drawText(c, text, startX, startY);
}

Game.prototype.drawUI = function(c) {
	// draw start screen
	if (this.startState)
		this.drawStartUI(c);

	// draw score
	if (this.playingState)
		this.drawScore(c);
	
	if (this.paused)
		this.drawPaused(c);
}

Game.prototype.drawScore = function(c) {
	c.textAlign = "center";
	c.textBaseline = "middle";
	c.font = "60px FlappyFont";
	drawFlappyText(c, this.score, Math.floor(c.canvas.width / 2), 150);
}

Game.prototype.drawStartUI = function(c) {
	c.textAlign = "center";
	c.textBaseline = "middle";
	c.font = "60px FlappyFont";
	var x = Math.floor(c.canvas.width / 2);
	drawFlappyText(c, "Flappy", x, 150, "gold");
	drawFlappyText(c, "Clone", x, 150+60+20, "gold");
}

Game.prototype.drawPaused = function(c) {
	c.textAlign = "left";
	c.textBaseline = "top";
	drawFlappyText(c, "||", 50, 50);
}

Game.prototype.drawStats = function() {
	this.stats.style.visibility = "visible";
	
	var html = "";
	html += "Score: " + this.score + "<br>";
	html += "Paused: " + this.paused + "<br>";
	html += "Dead: " + this.deadState + "<br>";
	html += "StartState: " + this.startState + "<br>";
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
	var ang = this.bird.ang;
	
	if (this.debugView) {
		// Draw velocity vector
		c.beginPath();
		c.moveTo(x, y);
		c.lineTo(x + this.bird.velX, y - this.bird.velY);
		c.strokeStyle = "black";
		c.stroke();
		
		// draw path
		if (!this.startState) {
			c.beginPath();
			c.moveTo(x, y);
			var stepSize = 10;
			for (var i = 0; i < 300; i += stepSize) { // predict path 200 pixels in front
				var t = i / this.bird.velX;
				// s = ut + (1/2)at^2
				var s = this.bird.velY*t + 0.5*this.gravity*t*t;
				c.lineTo(x + i, y - s);
			}
			c.strokeStyle = "red";
			c.stroke();
		}
	}
	
	// center x & y
	var img = this.flappyCurrent;
	var offsetX = -img.width / 2;
	var offsetY = -img.height / 2;
	
	c.translate(x, y);
	c.rotate(ang);
	c.translate(offsetX, offsetY);
	drawImage(c, img, 0, 0);
	c.translate(-offsetX, -offsetY);
	c.rotate(-ang); // faster than c.save(); c.restore();
	c.translate(-x, -y);
	if (this.debugView) {
		var r = this.bird.getBB(this.flappyCurrent.width, this.flappyCurrent.height, c.canvas.height);
		r.x -= this.cameraX;
		c.strokeStyle = "green";
		r.render(c);
	}
}

Game.prototype.drawPipe = function(c, pipe) {
	var x = pipe.x - this.cameraX;
	var ly = c.canvas.height - pipe.y;
	var uy = ly - pipe.spacing;
	
	// draw upper pipe
	c.scale(1, -1);
	tiledDrawImage(c, this.pipe, x, -uy, 1, undefined);
	drawImage(c, this.pipeHead, x, -uy);
	c.scale(1, -1);
	
	// draw lower pipe
	tiledDrawImage(c, this.pipe, x, ly, 1, undefined);
	drawImage(c, this.pipeHead, x, ly);
	
	if (this.debugView) {
		var ru = pipe.bbUpper(this.pipeHead.width);
		ru.x -= this.cameraX;
		var rl = pipe.bbLower(this.pipeHead.width);
		rl.x -= this.cameraX; 
		c.strokeStyle = "blue";
		ru.render(c);//c.strokeRect(ru.x, c.canvas.height - ru.y, ru.w, ru.h);
		rl.render(c);//c.strokeRect(rl.x, c.canvas.height - rl.y, rl.w, rl.h);
		
		c.beginPath();
		c.rect(x+this.pipeHead.width/4*1.5,uy,this.pipeHead.width/4,pipe.spacing);
		c.strokeStyle = "gold";
		c.stroke();
	}
}
