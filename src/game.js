"use strict";

const CAMERA_OFFSET_X = 100;
const BIRD_OFFSET_Y = 100;
const PIPE_SPACING_X = 250;

const MAX_VEL_Y = 400;

const STATE_LOADING = 0;
const STATE_START = 1;
const STATE_PLAYING = 2;
const STATE_PAUSED = 3;
const STATE_DEATH = 4;
const STATE_LEADERBOARD = 5;
const STATE_LEADERBOARD_ERROR = 6;

const WHICH_CODE_SPACE = 32;

window.onload = function(){
	var game = new Game();
	window.requestAnimationFrame(game.mainLoop.bind(game));
};

function stateToString(state) {
	     if (state === STATE_LOADING)     return "STATE_LOADING";
	else if (state === STATE_START)       return "STATE_START";
	else if (state === STATE_PLAYING)     return "STATE_PLAYING";
	else if (state === STATE_PAUSED)      return "STATE_PAUSED";
	else if (state === STATE_DEATH)       return "STATE_DEATH";
	else if (state === STATE_LEADERBOARD) return "STATE_LEADERBOARD";
	else if (state === STATE_LEADERBOARD_ERROR) return "STATE_LEADERBOARD_ERROR";
	else return "Invalid state: " + state;
}

function Game() {
	// init canvas
	this.canvas = document.getElementById("canvas");
	var that = this;
	this.canvas.onmousedown = function(e) {
		if (e.button === 0) {
			that.lmbDown = true;
			that.mouseX = e.offsetX;
			that.mouseY = e.offsetY;
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
	this.keyCodes = [];
	this.keyWhichs = [];
	this.keyUps = [];
	this.keyDowns = [];
	window.onkeyup = function(e) {
		that.keyCodes[e.code] = false;
		that.keyWhichs[e.which] = false;
		that.keyUps[that.keyUps.length] = e;
	}
	window.onkeydown = function(e) {
		that.keyCodes[e.code] = true;
		that.keyWhichs[e.which] = true;
		that.keyDowns[that.keyDowns.length] = e;
	}
	
	// setup font loading
	this.flappyFontLoaded = false;
	FontFaceOnload("FlappyFont", {
		success: (function() {
			console.log("FlappyFont loaded.");
			this.flappyFontLoaded = true;
			this.notifyLoadedFont();
		}).bind(this),
		error: (function() {
			console.log("FlappyFont could not be downloaded.");
			this.flappyFontLoaded = true;
			this.notifyLoadedFont();
		}).bind(this),
	});
	
	// load images
	this.imgs = {};
	this.imgs.flappy = [];
	this.imgs.deadFlappy = [];
	this.flappysLoaded = false;
	var loadFlappyFunc = (function() {
		if (typeof this.flappysLoadedNum === "undefined")
			this.flappysLoadedNum = 0;
		this.flappysLoadedNum += 1;
		if (this.flappysLoadedNum === 4)
			this.flappysLoaded = true;
	}).bind(this);
	for (var i = 0; i < 4; i++) {
		this.imgs.flappy[i] = this.loadImage("img/flappy" + i + ".png", loadFlappyFunc);
	}
	for (var i = 0; i < 4; i++) {
		this.imgs.deadFlappy[i] = this.loadImage("img/deadFlappy" + i + ".png");
	}
	this.imgs.bg = this.loadImage("img/background.png");
	this.imgs.bgBlank = this.loadImage("img/backgroundBlank.png");
	this.imgs.pipe = this.loadImage("img/pipe.png");
	this.imgs.pipeHead = this.loadImage("img/pipeHead.png");
	this.imgs.ground = this.loadImage("img/ground.png");
	this.imgs.tapInfo = this.loadImage("img/tapInfo.png");
	this.imgs.new = this.loadImage("img/new.png");
	this.imgs.buttonPlay = this.loadImage("img/buttonPlay.png");
	this.imgs.buttonPause = this.loadImage("img/buttonPause.png");
	this.imgs.buttonRestart = this.loadImage("img/buttonRestart.png");
	this.imgs.buttonLeaderboard = this.loadImage("img/buttonLeaderboard.png");
	this.imgs.buttonSubmit = this.loadImage("img/buttonSubmit.png");
	this.imgs.buttonSubmitDisabled = this.loadImage("img/buttonSubmitDisabled.png");
	this.imgs.buttonRetry = this.loadImage("img/buttonRetry.png");
	
	// setup buttons
	var setState = Object.getOwnPropertyDescriptor(Game.prototype, 'state').set;
	var spacing = 20;
	var px = 50, py = 50;
	this.buttonPlay  = new Button(px, py, this.imgs.buttonPlay , setState.bind(this, STATE_PLAYING));
	this.buttonPause = new Button(px, py, this.imgs.buttonPause, setState.bind(this, STATE_PAUSED));
	var dy = 400;
	var getX = (function() {
		var w = spacing + this.imgs.buttonRestart.width + this.imgs.buttonLeaderboard.width;
		var x = this.canvas.width/2 - w/2;
		return x;
	}).bind(this);
	this.buttonRestartDeath = new Button(
		getX, dy,
		this.imgs.buttonRestart,
		setState.bind(this, STATE_START));
	this.buttonLeaderboard = new Button(
		(function() { return getX() + spacing + this.imgs.buttonRestart.width; }).bind(this), dy,
		this.imgs.buttonLeaderboard,
		setState.bind(this, STATE_LEADERBOARD));
	dy = 670;
	this.buttonRestartLeaderboard = new Button(
		(function() { return this.canvas.width/2 - this.imgs.buttonRestart.width - spacing/2; }).bind(this), dy,
		this.imgs.buttonRestart,
		setState.bind(this, STATE_START));
	
	var submitFunction = (function() {
		var name = this.text;
		if (!isLegalName(name)) {
			console.log("'" + name + "' is not a valid name.");
			return;
		}
		console.log("Submitting best score for '" + name + "': " + this.bestScore);
		this.submitting = true;
		this.submittingStartTime = Date.now().valueOf() / 1000.0;
		this.errorSubmitting = false;
		this.submitted = false;
		this.endTextEntryMode();
		this.leaderboard[this.leaderboardPos].name = name;
		submitBestScore(name, this.bestScore, (function() {
			console.log("Submitted score.");
			this.submitting = false;
			this.submitted = true;
		}).bind(this), (function(error) {
			this.submitting = false;
			this.submitted = false;
			console.log("error submitting score: " + error);
			this.errorSubmitting = true;
		}).bind(this));
	}).bind(this);
	
	var disableFunction = (function() {
		if (!this.newBestScore
			|| this.leaderboardLoading
			|| !isLegalName(this.text)
			|| this.submitting || this.submitted)
			return true;
		return false;
	}).bind(this);
	
	this.buttonSubmit = new DisableButton(
		(function() { return this.canvas.width/2 + spacing/2; }).bind(this), dy,
		this.imgs.buttonSubmit, this.imgs.buttonSubmitDisabled, submitFunction, disableFunction);
	
	dy = 400;
	this.buttonRestartLeaderboardError = new Button(
		(function() { return this.canvas.width/2 - this.imgs.buttonRestart.width - spacing/2; }).bind(this), dy,
		this.imgs.buttonRestart,
		setState.bind(this, STATE_START));
	this.buttonRetry = new Button(
		(function() { return this.canvas.width/2 + spacing/2; }).bind(this), dy,
		this.imgs.buttonRetry, setState.bind(this, STATE_LEADERBOARD));

	// init pipes
	this.pipes = [];
	for (var i = 0; i < 10; i++) {
		this.pipes[i] = new Pipe(-200);
	}
	
	// setup handling focus events. see https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API
	var hidden, visibilityChange; 
	if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support 
		hidden = "hidden";
		visibilityChange = "visibilitychange";
	} else if (typeof document.msHidden !== "undefined") {
		hidden = "msHidden";
		visibilityChange = "msvisibilitychange";
	} else if (typeof document.webkitHidden !== "undefined") {
		hidden = "webkitHidden";
		visibilityChange = "webkitvisibilitychange";
	}
	
	// if the page is hidden, pause the game
	// if the page is hidden, unpause the game, unless it is in the STATE_PAUSED state
	function handleVisibilityChange() {
		if (document[hidden]) {
			console.log("Page hidden: paused.");
			that.pause();
			if (that.state === STATE_PLAYING)
				that.state = STATE_PAUSED;
		} else {
			if (that.state !== STATE_PAUSED) {
				console.log("Page unhidden: resumed.");
				that.unpause();
			}
		}
	}

	// Warn if the browser doesn't support addEventListener or the Page Visibility API
	if (typeof document.addEventListener === "undefined" || typeof document[hidden] === "undefined") {
		console.log("Error: Page Visibility API not supported.");
	} else {
		// Handle page visibility change   
		document.addEventListener(visibilityChange, handleVisibilityChange, false);
	}
	
	// init stats
	this.stats = document.getElementById("stats");
	
	// init vars
	this.debugAllowed = false; // is debugging allowed?
	this.debugView = false;
	this.cameraUpdate = true; // update the camera to be locked onto the bird?
	this.flappyDt = 0.08; // seconds per flappy frame
	this.paused = false;
	this.cameraX = 0;

	this.beginTextEntryMode();
	this.endTextEntryMode();
	
	// init state
	this.state = STATE_LOADING;
}

Game.prototype.loadImage = function(path, f) {
	if (typeof f === "undefined")
		f = function() {};
	if (typeof this.imagesLoadedMax === "undefined")
		this.imagesLoadedMax = 0;
	this.imagesLoadedMax += 1;
	
	var img = new Image();
	img.onload = (function() {
		f();
		this.notfiyLoadedImage();
	}).bind(this);
	img.src = path;
	return img;
}

Game.prototype.notfiyLoadedImage = function() {
	if (typeof this.imagesLoadedNum === "undefined")
		this.imagesLoadedNum = 0;
	this.imagesLoadedNum += 1;
	
	if (this.imagesLoaded) {
		console.log(this.imagesLoadedNum + " images loaded.");
		this.notifyLoadedResource();
	}
}

Game.prototype.notifyLoadedFont = function() {
	this.notifyLoadedResource();
}

Game.prototype.notifyLoadedResource = function() {
	if (this.imagesLoaded && this.flappyFontLoaded) {
		this.state = STATE_START;
	}
}

Object.defineProperty(Game.prototype, 'imagesLoaded', {
	get: function() { return this.imagesLoadedNum === this.imagesLoadedMax; },
});

Object.defineProperty(Game.prototype, 'flappyCurrent', {
	get: function() {
		if (this.deadFlappyImage)
			return this.imgs.deadFlappy[Math.floor(this.flappyi)];
		else
			return this.imgs.flappy[Math.floor(this.flappyi)];
	},
});

Object.defineProperty(Game.prototype, 'flapButtonDown', {
	get: function() { return (this.lmbDown && !this.lmbHandled) || this.keyWhichs[WHICH_CODE_SPACE]; },
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
		if (s === STATE_LOADING) {
			this.buttons = [];
			this.bird = new Bird();
			this.paused = true; // no updates
			this.flappyi = 0;
			this.regenPipes = false;
			this.cameraUpdate = false;
			this.flappyVisible = false;
			this.groundVisible = false;

		} else if (s === STATE_START) {
			this.buttons = [];
			this.deadFlappyImage = false;
			this.gravity = 0;
			this.bestScore = getBestScore();
			this.prevTime = NaN; // clear prevTime
			this.score = 0;
			this.paused = false;
			this.bird = new Bird();
			this.flappyi = 0;
			this.oscillate = true;
			this.regenPipes = false;
			this.cameraUpdate = true;
			this.flappyVisible = true;
			this.groundVisible = true;
			for (var i = 0; i < this.pipes.length; i++) {
				this.pipes[i] = new Pipe(-200);
			}
			
		} else if (s === STATE_PLAYING) {
			this.buttons = [this.buttonPause];
			this.deadFlappyImage = false;
			this.gravity = GRAVITY;
			this.oscillate = false;
			this.regenPipes = true;
			this.paused = false;
			this.prevTime = NaN; // we could have come from the paused state, we need to update prevTime
			this.cameraUpdate = true;
			this.flappyVisible = true;
			this.groundVisible = true;
			
		} else if (s === STATE_PAUSED) {
			this.buttons = [this.buttonPlay];
			this.deadFlappyImage = false;
			this.gravity = GRAVITY;
			this.oscillate = false;
			this.regenPipes = true;
			this.paused = true;
			this.cameraUpdate = true;
			this.flappyVisible = true;
			this.groundVisible = true;
			
		} else if (s === STATE_DEATH) {
			this.buttons = [this.buttonRestartDeath, this.buttonLeaderboard];
			this.deadFlappyImage = true;
			this.gravity = GRAVITY;
			this.oscillate = false;
			this.regenPipes = true;
			this.newBestScore = false;
			this.cameraUpdate = true;
			this.flappyVisible = true;
			this.groundVisible = true;
			if (this.score > this.bestScore) {
				this.bestScore = this.score;
				this.newBestScore = true;
				this.submitted = false;
				this.errorSubmitting = false;
				setBestScore(this.bestScore);
			}
			this.bird.velY = 300;
			this.bird.velX = 0;
			
		} else if (s === STATE_LEADERBOARD) {
			this.buttons = [this.buttonRestartLeaderboard, this.buttonSubmit];
			this.deadFlappyImage = true;
			this.gravity = GRAVITY;
			this.oscillate = false;
			this.regenPipes = true;
			this.leaderboard = [];
			this.leaderboardLoading = true;
			this.cameraUpdate = true;
			this.flappyVisible = true;
			this.groundVisible = true;
			
			var successFunction = (function(leaderboard) {
				this.leaderboard = leaderboard;
				this.leaderboardLoading = false;
				console.log("Leaderboard loaded (" + leaderboard.length + " entries)");
				if (this.newBestScore) {
					// find if the user fits on the leaderboard
					var pos = -1;
					for (var i = 0; i < NUM_LEADERBOARD_ENTRIES; i++) {
						var e = leaderboard[i];
						if (typeof e === "undefined" || this.bestScore > e.score) {
							pos = i;
							break;
						}
					}
					
					if (pos !== -1) {
						this.leaderboardPos = pos;
						leaderboard.splice(pos, 0, {user: true, name: "", score: this.bestScore});
						this.beginTextEntryMode(MAX_NAME_LENGTH, isLegalNameChar);
					}
				}
			}).bind(this);
			var errorFunction = (function(err) {
				console.log("Error loading leaderboard: " + err);
				this.state = STATE_LEADERBOARD_ERROR;
			}).bind(this);
			
			getLeaderboard(successFunction, errorFunction);
		} else if (this.state === STATE_LEADERBOARD_ERROR) {
			this.buttons = [this.buttonRestartLeaderboardError, this.buttonRetry];
			this.deadFlappyImage = true;
			this.gravity = GRAVITY;
			this.oscillate = false;
			this.regenPipes = true;
			this.cameraUpdate = true;
			this.flappyVisible = true;
			this.groundVisible = true;
			
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

Game.prototype.beginTextEntryMode = function(maxLength, isLegalChar) {
	this.text = "";
	this.textEntry = true;
	this.textPos = 0;
	if (typeof maxLength === "undefined")
		maxLength = 32;
	this.textMaxLength = maxLength;
	if (typeof isLegalChar === "undefined")
		isLegalChar = function(c) { return true; };
	this.textIsLegalChar = isLegalChar;
}

Game.prototype.backspaceText = function() {
	if (this.text.length > 0 && this.textPos > 0) {
		var begin = this.text.substring(0, this.textPos - 1);
		var end = this.text.substring(this.textPos, this.text.length);
		this.text = begin + end;
		this.moveCursorText(-1);
	}
}

Game.prototype.deleteText = function() {
	if (this.text.length > 0 && this.textPos < this.text.length) {
		this.textPos += 1;
		this.backspaceText();
	}
}

Game.prototype.moveCursorText = function(n) {
	this.textPos += n;
	if (this.textPos < 0)
		this.textPos = 0;
	else if (this.textPos >= this.text.length)
		this.textPos = this.text.length;
	this.printText();
}

Game.prototype.printText = function() {
	var begin = this.text.substring(0, this.textPos);
	var end = this.text.substring(this.textPos, this.text.length);
	console.log("Text: " + begin + "|" + end);
}

Game.prototype.enterText = function(enteredText) {
	var validText = '';
	for (var i = 0; i < enteredText.length; i++) {
		var c = enteredText[i];
		if (this.textIsLegalChar(c))
			validText += c;
	}

	var lengthAllowed = this.textMaxLength - this.text.length;
	if (lengthAllowed <= 0) {
		// no extra text allowed!
		console.log("Prevented from entering text (" + validText + "): max length (" + this.textMaxLength + ") reached.");
		return;
	} else if (validText.length > lengthAllowed) {
		// cut extra text down to size
		validText = validText.substring(0, lengthAllowed);
	}
	var begin = this.text.substring(0, this.textPos);
	var end = this.text.substring(this.textPos, this.text.length);
	this.text = begin + validText + end;
	this.moveCursorText(validText.length);
}

Game.prototype.getTextEntered = function() {
	return this.text;
}

Game.prototype.endTextEntryMode = function() {
	this.textEntry = false;
	return this.text;
}

Game.prototype.processKeys = function() {
	for (var i = 0; i < this.keyDowns.length; i++) {
		var e = this.keyDowns[i];
		var key = e.key; // key is 'w', 'W', '!', etc.
		var code = e.code; // code is 'Escape', 'KeyW', 'Digit1', etc.
		
		if (code === "Escape" && (this.debugAllowed || this.state === STATE_PLAYING || this.state === STATE_PAUSED)) {
			this.togglePause();
		}
		if (code === "Digit1" && this.debugAllowed) {
			this.debugView = !this.debugView;
		}
		if (code === "Digit2" && this.debugAllowed) {
			this.cameraUpdate = !this.cameraUpdate;
		}
		
		console.log("Key pressed: " + e.which + " '" + key + "' (" + code + ")");
		
		if (this.textEntry) {
			if (key.length === 1) {
				this.enterText(key);
			} else if (key === "Backspace") {
				this.backspaceText();
			} else if (key === "Delete") {
				this.deleteText();
			} else if (key === "ArrowLeft") {
				this.moveCursorText(-1);
			} else if (key === "ArrowRight") {
				this.moveCursorText(1);
			}
		}
	}
}

Game.prototype.pause = function() {
	if (this.state === STATE_PLAYING) {
		this.state = STATE_PAUSED;
	} else {
		this.paused = true;
	}
}

Game.prototype.unpause = function() {
	if (this.state === STATE_PAUSED) {
		this.state = STATE_PLAYING;
	} else {
		this.paused = false;
		this.prevTime = NaN;
	}
}

Game.prototype.togglePause = function() {
	if (this.state === STATE_PLAYING) {
		this.state = STATE_PAUSED;
	} else if (this.state === STATE_PAUSED) {
		this.state = STATE_PLAYING;
	} else {
		this.paused = !this.paused;
		if (!this.paused)
			this.prevTime = NaN;
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
	// resize canvas (experimental)
	this.canvas.width = window.innerWidth;
	//this.canvas.height = window.innerHeight;

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
	
	if (this.groundVisible) {
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
	}

	// draw flappy bird
	if (this.flappyVisible)
		this.drawFlappy(c);

	// draw score
	this.drawUI(c);
};

Game.prototype.drawUI = function(c) {
	// draw loading screen
	if (this.state === STATE_LOADING)
		this.drawLoadingUI(c);
	
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
	
	if (this.state === STATE_LEADERBOARD_ERROR)
		this.drawLeaderboardErrorUI(c);
	
	// draw buttons
	var bs = this.buttons;
	for (var i = 0; i < bs.length; i++) {
		var btn = bs[i];
		btn.draw(c);
	}
}

Game.prototype.drawLoadingUI = function(c) {
	var x = c.canvas.width/2;
	var y = c.canvas.height/2;
	if (this.flappysLoaded)
		this.drawLoadingAnimation(c, this.stateChangeDt, x, y, false);
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
	drawFlappyText(c, "Game Over", Math.floor(c.canvas.width / 2), 200, titleCol);
	
	c.font = "30px FlappyFont";
	var diff = 70;
	var l = Math.floor(c.canvas.width/2 - diff);
	var r = Math.floor(c.canvas.width/2 + diff);
	var t = 290;
	var b = 340;
	var outline = 3;
	drawFlappyText(c, "Score", l, t, "white", outline);
	drawFlappyText(c, "Best" , r, t, "white", outline);
	drawFlappyText(c, this.score    , l, b, "white", outline);
	drawFlappyText(c, this.bestScore, r, b, "white", outline);

	if (this.newBestScore)
		drawImage(c, this.imgs.new, r + 27, t - 10);
}

Game.prototype.drawLeaderboardUI = function(c) {
	this.drawLeaderboardHeader(c);
	if (this.leaderboardLoading) {
		var x = c.canvas.width/2;
		var y = 380;
		this.drawLoadingAnimation(c, this.stateChangeDt, x, y, true);
	} else {
		this.drawLeaderboard(c);
	}
}

Game.prototype.drawLeaderboardErrorUI = function(c) {	
	var img = this.imgs.deadFlappy[2];
	var offsetX = -img.width/2;
	var offsetY = -img.height/2;
	var x = c.canvas.width/2;
	var y = 345;
	
	c.translate(x, y);
	c.rotate(Math.PI);
	drawImage(c, img, offsetX, offsetY);
	c.rotate(-Math.PI);
	c.translate(-x, -y);
	
	c.textAlign = "center";
	c.textBaseline = "top";
	c.font = "60px FlappyFont";
	drawFlappyText(c, "Error", x, 110, "red");
	var spacing = 50, startY = 210;
	c.font = "30px FlappyFont";
	drawFlappyText(c, "The leaderboard could", x, startY, "white", 3)
	drawFlappyText(c, "not be loaded.", x, startY + spacing, "white", 3)
}

Game.prototype.drawLeaderboardHeader = function(c) {
	c.textAlign = "center";
	c.textBaseline = "top";
	c.font = "60px FlappyFont";
	var titleCol = "gold";
	drawFlappyText(c, "Leaderboard", Math.floor(c.canvas.width / 2), 110, titleCol);
}

Game.prototype.drawLeaderboard = function(c) {
	c.textBaseline = "top";
	c.font = "30px FlappyFont";
	
	var spacing = 8;
	var x = c.canvas.width - 140;
	var numx = 60;
	var y = 200;
	var titleCol = "gold";
	c.textAlign = "right";
	drawFlappyText(c, "NAME", x - spacing, y, titleCol, 3);
	drawFlappyText(c, "#", numx, y, titleCol, 3);
	c.textAlign = "left";
	drawFlappyText(c, "SCORE", x + spacing, y, titleCol, 3);
	
	for (var i = 0; i < NUM_LEADERBOARD_ENTRIES; i++) {
		var e = this.leaderboard[i];
		if (typeof e === "undefined")
			break;
		
		var col = "white";
		var hide = hide = Math.floor((5 * this.stateChangeDt) % 3) === 0;
		if (e.user && this.errorSubmitting) {
			col = "red";
		} else if (e.user) {
			col = "gold";
		}
		
		y += 40;
		c.textAlign = "right";
		if (this.textEntry && e.user) {
			var start = this.text.substring(0, this.textPos);
			var end = this.text.substring(this.textPos, this.text.length);
			var chr = "|";
			if (hide)
				chr = "\u2008";
			
			var txt = start + chr + end;
			drawFlappyText(c, txt, x - spacing, y, col, 3);
		} else if (this.submitting && e.user) {
			var now = Date.now().valueOf() / 1000.0;
			var dt = now - this.submittingStartTime;
			var dots = Math.floor(((2 * dt) % 3) + 1);
			var text = ".".repeat(dots);
			
			drawFlappyText(c, text, x - spacing, y, col, 3);
		} else if (this.errorSubmitting && e.user) {
			drawFlappyText(c, "ERROR", x - spacing, y, col, 3);
		} else {
			var space = x - 2*spacing - numx;
			drawFlappyText(c, e.name, x - spacing, y, col, 3, space, false);
		}
		drawFlappyText(c, (i + 1) + ".", 60, y, col, 3);
		c.textAlign = "left";
		drawFlappyText(c, e.score, x + spacing, y, col, 3);
	}
}

Game.prototype.drawLoadingAnimation = function(c, dt, x, y, drawText) {
	var ang = (5 * dt) % (2 * Math.PI);
	var i = (15 * dt) % this.imgs.flappy.length;
	var dots = Math.floor(((2 * dt) % 3) + 1);
	var img = this.imgs.flappy[Math.floor(i)];
	
	if (drawText) {
		var text = ".".repeat(dots);

		c.textAlign = "middle";
		c.textBaseline = "bottom";
		c.font = "30px FlappyFont";
		drawFlappyText(c, text, x, y + 8, "white", 2);
	}

	var radius = -35;
	var offsetX = -img.width/2;
	var offsetY = -img.height/2;
	
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