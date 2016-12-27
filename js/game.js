"use strict";

const CAMERA_OFFSET_X = 100;
const BIRD_OFFSET_Y = 100;
const PIPE_SPACING_X = 250;

const NUM_LEADERBOARD_ENTRIES = 10;

const MAX_VEL_Y = 400;

const STATE_START = 0;
const STATE_PLAYING = 1;
const STATE_PAUSED = 2;
const STATE_DEATH = 3;
const STATE_LEADERBOARD = 4;

function stateToString(state) {
	if (state === STATE_START) return "STATE_START";
	else if (state === STATE_PLAYING) return "STATE_PLAYING";
	else if (state === STATE_PAUSED) return "STATE_PAUSED";
	else if (state === STATE_DEATH) return "STATE_DEATH";
	else if (state === STATE_LEADERBOARD) return "STATE_LEADERBOARD";
	else return "Invalid state: " + state;
}

function Game() {
	// init canvas
	this.canvas = document.getElementById("canvas");
	var that = this;
	this.canvas.onmousedown = function(e) {
		if (e.button === 0) {
			that.lmbDown = true;
			that.mouseX = e.clientX;
			that.mouseY = e.clientY;
			console.log("lmb pressed (" + that.mouseX + ", " + that.mouseY + ")");
		}
	};
	this.canvas.onmouseup = function(e) {
		if (e.button === 0) {
			that.lmbDown = false;
			console.log("lmb released");
		}
	};
	this.lmbDown = false;
	this.lmbDownPrev = false;
	this.mouseX = 0;
	this.mouseY = 0;
	
	// setup keys
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
	this.imgs = {};
	this.imgs.bg = new Image();
	this.imgs.bg.src = "img/background.png";
	this.imgs.bgBlank = new Image();
	this.imgs.bgBlank.src = "img/backgroundBlank.png";
	this.imgs.flappy = [];
	this.imgs.deadFlappy = [];
	for (var i = 0; i < 4; i++) {
		this.imgs.flappy[i] = new Image();
		this.imgs.flappy[i].src = "img/flappy" + i + ".png";
		this.imgs.deadFlappy[i] = new Image();
		this.imgs.deadFlappy[i].src = "img/deadFlappy" + i + ".png";
	}
	this.imgs.pipe = new Image();
	this.imgs.pipe.src = "img/pipe.png";
	this.imgs.pipeHead = new Image();
	this.imgs.pipeHead.src = "img/pipeHead.png";
	this.imgs.ground = new Image();
	this.imgs.ground.src = "img/ground.png";
	this.imgs.tapInfo = new Image();
	this.imgs.tapInfo.src = "img/tapInfo.png";
	this.imgs.new = new Image();
	this.imgs.new.src = "img/new.png";
	this.imgs.buttonPlay = new Image();
	this.imgs.buttonPlay.src = "img/buttonPlay.png";
	this.imgs.buttonPause = new Image();
	this.imgs.buttonPause.src = "img/buttonPause.png";
	var spacing = 20;
	this.imgs.buttonRestart = new Image();
	this.imgs.buttonRestart.onload = (function() {
		this.buttonRestart1.x = this.canvas.width/2 - this.imgs.buttonRestart.width - spacing/2;
		this.buttonRestart2.x = this.canvas.width/2 - this.imgs.buttonRestart.width - spacing/2;
	}).bind(this);
	this.imgs.buttonRestart.src = "img/buttonRestart.png";
	this.imgs.buttonLeaderboard = new Image();
	this.imgs.buttonLeaderboard.src = "img/buttonLeaderboard.png";
	this.imgs.buttonSubmit = new Image();
	this.imgs.buttonSubmit.src = "img/buttonSubmit.png";

	// setup buttons
	var px = 50, py = 50;
	var setState = Object.getOwnPropertyDescriptor(Game.prototype, 'state').set;
	this.buttonPlay  = new Button(px, py, this.imgs.buttonPlay , setState.bind(this, STATE_PLAYING));
	this.buttonPause = new Button(px, py, this.imgs.buttonPause, setState.bind(this, STATE_PAUSED));
	var dy = 350;
	this.buttonRestart1 = new Button(0, dy, this.imgs.buttonRestart,
		setState.bind(this, STATE_START));
	this.buttonLeaderboard = new Button(this.canvas.width/2 + spacing/2, dy, this.imgs.buttonLeaderboard,
		setState.bind(this, STATE_LEADERBOARD));
	dy = 680;
	this.buttonRestart2 = new Button(0, dy, this.imgs.buttonRestart,
		setState.bind(this, STATE_START));
	this.buttonSubmit = new Button(this.canvas.width/2 + spacing/2, dy, this.imgs.buttonSubmit,
		function() { console.log("submit score"); });

	// init pipes
	this.pipes = [];
	for (var i = 0; i < 10; i++) {
		this.pipes[i] = new Pipe(-200);
	}
	
	// setup handling focus events
	window.onblur = function(e) {
		if (that.state === STATE_PLAYING)
			that.state = STATE_PAUSED;
	}
	
	// init stats
	this.stats = document.getElementById("stats");
	
	// init vars
	this.debugAllowed = false; // is debugging allowed?
	this.debugView = false;
	this.cameraUpdate = true; // update the camera to be locked onto the bird?
	this.flappyDt = 0.08; // seconds per flappy frame
	
	// init state
	this.state = STATE_START;
}

Object.defineProperty(Game.prototype, 'flappyCurrent', {
	get: function() {
		if (this.deadFlappyImage)
			return this.imgs.deadFlappy[Math.floor(this.flappyi)];
		else
			return this.imgs.flappy[Math.floor(this.flappyi)];
	},
});
Object.defineProperty(Game.prototype, 'flapButtonDown', {
	get: function() { return (this.lmbDown && !this.lmbHandled) || this.keys["Space"]; },
});

Object.defineProperty(Game.prototype, 'stateChangeDt', {
	get: function() { return (Date.now().valueOf() - this.stateChangeTime) / 1000.0; },
});

Object.defineProperty(Game.prototype, 'state', {
	get: function() { return this.state_; },
	set: function(s) {
		const GRAVITY = -800;
		console.log("STATE CHANGE: " + stateToString(this.state_) + " => " + stateToString(s));
		this.stateChangeTime = Date.now().valueOf();
		this.state_ = s;
		if (s === STATE_START) {
			// vars
			this.buttons = [];
			this.deadFlappyImage = false;
			this.gravity = 0;
			this.bestScore = getBestScore();
			this.prevTime = NaN;
			this.score = 0;
			this.cameraX = 0;
			this.paused = false;
			this.bird = new Bird();
			this.flappyi = 0; // current flappy frame
			this.oscillate = true;
			this.regenPipes = false;

		} else if (s === STATE_PLAYING) {
			// vars
			this.buttons = [this.buttonPause];
			this.deadFlappyImage = false;
			this.gravity = GRAVITY;
			this.oscillate = false;
			this.regenPipes = true;
			this.paused = false;
			this.prevTime = NaN;
			
		} else if (s === STATE_PAUSED) {
			// vars
			this.buttons = [this.buttonPlay];
			this.deadFlappyImage = false;
			this.gravity = GRAVITY;
			this.oscillate = false;
			this.regenPipes = true;
			this.paused = true;
			
		} else if (s === STATE_DEATH) {
			// vars
			this.buttons = [this.buttonRestart1, this.buttonLeaderboard];
			this.deadFlappyImage = true;
			this.gravity = GRAVITY;
			this.oscillate = false;
			this.regenPipes = true;
			this.newBestScore = false;
			if (this.score > this.bestScore) {
				this.bestScore = this.score;
				this.newBestScore = true;
				setBestScore(this.bestScore);
			}
			this.bird.velY = 300;
			this.bird.velX = 0;
			
		} else if (s === STATE_LEADERBOARD) {
			// vars
			this.buttons = [this.buttonRestart2, this.buttonSubmit];
			this.deadFlappyImage = true;
			this.gravity = GRAVITY;
			this.oscillate = false;
			this.regenPipes = true;
			this.leaderboard = [];
			this.loading = true;
			getLeaderboard((function(leaderboard) {
				this.leaderboard = leaderboard;
				this.loading = false;
				console.log("Leaderboard loaded (" + leaderboard.length + " entries)");
			}).bind(this));
			
		} else {
			console.log("Error: Invalid state: " + s);
			this.state = STATE_START;
		}
	},
});

Game.prototype.mainLoop = function() {
	window.requestAnimationFrame(this.mainLoop.bind(this));
	// process key presses
	this.processKeys();
	
	// update
	this.update();
	
	// draw
	this.draw();
	
	// reset keys pressed since last frame
	this.keyUps = [];
	this.keyDowns = [];
};

Game.prototype.processKeys = function() {
	for (var i = 0; i < this.keyDowns.length; i++) {
		var key = this.keyDowns[i];
		// if escape has been pressed, toggle pause setting
		if (key === "Escape" && (this.debugAllowed || this.state === STATE_PLAYING)) {
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
	// check buttons
	if (this.lmbDown) {
		if (!this.lmbDownPrev) {
			this.lmbHandled = false;
			var bs = this.buttons;
			for (var i = 0; i < bs.length; i++) {
				var btn = bs[i];
				if (btn.handleClick(this.mouseX, this.mouseY)) {
					this.lmbHandled = true;
					break;
				}
			}
			this.lmbDownPrev = true;
		}
	} else {
		this.lmbDownPrev = false;
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
	
	// check if time to start
	if (this.state === STATE_START && this.flapButtonDown) {
		this.state = STATE_PLAYING;
		
		// regen pipes
		var x = this.bird.posX + 800;
		for (var i = 0; i < 10; i++) {
			this.pipes[i] = new Pipe(x);
			x += PIPE_SPACING_X;
		}
		this.pipeMax = x;
	}
	
	// update flappy frame #
	if (this.state === STATE_START || this.state === STATE_PLAYING)
		this.flappyi = (this.flappyi + (dt / this.flappyDt)) % this.imgs.flappy.length;
	
	// update bird
	this.updateFlappy(dt);
	
	// check pipes. regen if not valid. add to score if passed.
	if (this.regenPipes) {
		for (var i = 0; i < this.pipes.length; i++) {
			var pipe = this.pipes[i];
			if (!pipe.passed && pipe.x + this.imgs.pipeHead.width / 2 < this.bird.posX) {
				// score pipe
				this.score += 1;
				pipe.passed = true;
			}
			if (pipe.x + this.imgs.pipeHead.width < this.cameraX) {
				// not valid pipe, reuse.
				pipe.reuse(this.pipeMax);
				this.pipeMax += PIPE_SPACING_X;
			}
		}
	}
}

Game.prototype.updateFlappy = function(dt) {
	var bird = this.bird;
	
	bird.velY += dt * this.gravity;

	if (this.oscillate) {
		// oscillate around a point if in start mode
		bird.t += dt;
		bird.t %= Math.PI * 2;
		bird.velY = Math.cos(bird.t * 4) * 70;
	}
	// if on the ground
	var h = this.imgs.ground.height + this.flappyCurrent.height / 2;
	if (bird.posY <= h && bird.velY < 0) {
		bird.velY = 0;
	}
	if (bird.posY <= h) {
		bird.posY = h;
		if (this.state === STATE_PLAYING)
			this.state = STATE_DEATH;
	}
	// if at the top of the screen
	var ch = this.canvas.height;
	var t = this.flappyCurrent.height / 2;
	if (bird.posY + t > ch) {
		bird.posY = ch - t;
		bird.velY = 0;
	}
	
	// update positions using velocity
	bird.posX += dt * bird.velX;
	bird.posY += dt * bird.velY;
	
	// bird angle logic
	bird.ang = calculateAngle(bird.velX, bird.velY);
	bird.ang = (bird.ang - bird.prevAng) * Math.min(1, 15 * dt) + bird.prevAng; // lerp
	bird.prevAng = bird.ang;
	
	if (this.state === STATE_START || this.state === STATE_PLAYING) {
		// bird flap logic
		if (this.flapButtonDown) {
			if (!bird.flapButtonDownPrev) {
				bird.velY = MAX_VEL_Y;
			}
			bird.flapButtonDownPrev = true;
		} else {
			bird.flapButtonDownPrev = false;
		}
	
		// check for collisions with pipes. if a collision is found, kill the bird
		var bb = bird.getBB(this.flappyCurrent.width, this.flappyCurrent.height);
		for (var i = 0; i < this.pipes.length; i++) {
			var pipe = this.pipes[i];
			
			var ru = pipe.bbUpper(this.imgs.pipeHead.width);
			var rl = pipe.bbLower(this.imgs.pipeHead.width);
			
			var intersected = false;
			if (bb.intersects(ru)) {
				console.log("bird intersects with pipe " + i + " (UPPER)");
				intersected = true;
			} else if (bb.intersects(rl)) {
				console.log("bird intersects with pipe " + i + " (LOWER)");
				intersected = true;
			}
			if (intersected) {
				this.state = STATE_DEATH;
			}
		}
	}
}

Game.prototype.draw = function() {
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
	drawImageTiled(c, this.imgs.bgBlank);
	// draw textured background
	var offsetBg = -this.imgs.bg.width - ((this.cameraX / 2) % this.imgs.bg.width);
	drawImageTiled(c, this.imgs.bg, offsetBg, c.canvas.height - this.imgs.bg.height, undefined, 1);
	
	// draw pipes
	for (var i = 0; i < this.pipes.length; i++) {
		this.drawPipe(c, this.pipes[i]);
	}
	
	// draw ground
	var offsetGround = -this.imgs.ground.width - (this.cameraX % this.imgs.ground.width);
	drawImageTiled(c, this.imgs.ground, offsetGround, c.canvas.height - this.imgs.ground.height, undefined, 1);
	
	// draw flappy bird
	this.drawFlappy(c);

	// draw score
	this.drawUI(c);
};

Game.prototype.drawUI = function(c) {
	// draw start screen
	if (this.state === STATE_START)
		this.drawStartUI(c);
	
	// draw score
	if (this.state === STATE_PLAYING || this.state === STATE_PAUSED)
		this.drawPlayingUI(c);
	
	// draw death screen
	if (this.state === STATE_DEATH)
		this.drawDeathUI(c);
	
	// draw leaderboard screen
	if (this.state === STATE_LEADERBOARD)
		this.drawLeaderboardUI(c);
	
	// draw buttons
	var bs = this.buttons;
	for (var i = 0; i < bs.length; i++) {
		var btn = bs[i];
		btn.draw(c);
	}
}

Game.prototype.drawPlayingUI = function(c) {
	c.textAlign = "left";
	c.textBaseline = "top";
	c.font = "30px FlappyFont";
	drawFlappyText(c, this.score, 100, 50, "white", 2);
}

Game.prototype.drawStartUI = function(c) {
	c.textAlign = "center";
	c.textBaseline = "top";
	c.font = "60px FlappyFont";
	var x = Math.floor(c.canvas.width / 2);
	var col = "gold";//"#30e830";
	drawFlappyText(c, "Flappy", x, 150, col);
	drawFlappyText(c, "Clone", x, 150+60+20, col);
	
	drawImage(c, this.imgs.tapInfo,
		100 + c.canvas.width/2 - this.imgs.tapInfo.width/2,
		(c.canvas.height - BIRD_START_Y) - this.imgs.tapInfo.height/2);
}

Game.prototype.drawDeathUI = function(c) {
	c.textAlign = "center";
	c.textBaseline = "top";
	c.font = "60px FlappyFont";
	var titleCol = "gold";
	drawFlappyText(c, "Game Over", Math.floor(c.canvas.width / 2), 150, titleCol);
	
	c.font = "30px FlappyFont";
	var diff = 70;
	var l = Math.floor(c.canvas.width/2 - diff);
	var r = Math.floor(c.canvas.width/2 + diff);
	var t = 240;
	var b = 290;
	var outline = 3;
	drawFlappyText(c, "Score", l, t, "white", outline);
	drawFlappyText(c, "Best" , r, t, "white", outline);
	drawFlappyText(c, this.score    , l, b, "white", outline);
	drawFlappyText(c, this.bestScore, r, b, "white", outline);

	if (this.newBestScore)
		drawImage(c, this.imgs.new, r + 27, t - 10);
}

Game.prototype.drawLeaderboardUI = function(c) {
	c.textAlign = "center";
	c.textBaseline = "top";
	c.font = "60px FlappyFont";
	var titleCol = "gold";
	drawFlappyText(c, "Leaderboard", Math.floor(c.canvas.width / 2), 100, titleCol);
	if (this.loading) {
		var x = c.canvas.width/2;
		var y = 380;
		this.drawLoading(c, this.stateChangeDt, x, y);
	} else if (this.leaderboardError) {
		// TODO: display error
	} else {
		this.drawLeaderboard(c);
	}
}

Game.prototype.drawLeaderboard = function(c) {
	c.textBaseline = "top";
	c.font = "30px FlappyFont";
	
	for (var i = 0; i < NUM_LEADERBOARD_ENTRIES; i++) {
		var e = this.leaderboard[i];
		if (typeof e === "undefined")
			break;
		
		var x = c.canvas.width - 160;
		var spacing = 20;
		var y = 220 + 40 * i;
		c.textAlign = "right";
		drawFlappyText(c, e.name, x - spacing, y, "white", 3);
		drawFlappyText(c, (i + 1) + ".", 60, y, "white", 3);
		c.textAlign = "left";
		drawFlappyText(c, e.score, x + spacing, y, "white", 3);
	}
}

Game.prototype.drawLoading = function(c, dt, x, y) {
	var ang = (5 * dt) % (2 * Math.PI);
	var i = (15 * dt) % this.imgs.flappy.length;
	var dots = Math.floor(((2 * dt) % 3) + 1);
	var img = this.imgs.flappy[Math.floor(i)];

	var text = ".".repeat(dots);
	
	var radius = -35;
	var offsetX = -img.width/2;
	var offsetY = -img.height/2;
	
	c.textAlign = "middle";
	c.textBaseline = "bottom";
	c.font = "30px FlappyFont";
	drawFlappyText(c, text, x, y + 8, "white", 2);
	
	c.translate(x, y);
	c.rotate(ang);
	c.translate(0, radius);
	drawImage(c, img, offsetX, offsetY);
	c.translate(0, -radius);
	c.rotate(-ang);
	c.translate(-x, -y);
}

Game.prototype.drawStats = function() {
	this.stats.style.visibility = "visible";
	
	var html = "";
	html += "Score: " + this.score + "<br>";
	html += "Paused: " + this.paused + "<br>";
	html += "State: " + stateToString(this.state) + "<br>";
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
		if (this.state !== STATE_START) {
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
		r.draw(c);
	}
}

Game.prototype.drawPipe = function(c, pipe) {
	var x = pipe.x - this.cameraX;
	var ly = c.canvas.height - pipe.y;
	var uy = ly - pipe.spacing;
	
	// draw upper pipe
	c.scale(1, -1);
	drawImageTiled(c, this.imgs.pipe, x, -uy, 1, undefined);
	drawImage(c, this.imgs.pipeHead, x, -uy);
	c.scale(1, -1);
	
	// draw lower pipe
	drawImageTiled(c, this.imgs.pipe, x, ly, 1, undefined);
	drawImage(c, this.imgs.pipeHead, x, ly);
	
	if (this.debugView) {
		var ru = pipe.bbUpper(this.imgs.pipeHead.width);
		ru.x -= this.cameraX;
		var rl = pipe.bbLower(this.imgs.pipeHead.width);
		rl.x -= this.cameraX; 
		c.strokeStyle = "blue";
		ru.draw(c);
		rl.draw(c);
		
		c.beginPath();
		c.rect(x+this.imgs.pipeHead.width/4*1.5,uy,this.imgs.pipeHead.width/4,pipe.spacing);
		c.strokeStyle = "gold";
		c.stroke();
	}
}
