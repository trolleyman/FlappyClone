
const NUM_PIPES = 10;
const PIPE_SPACING = 50;

const CANVAS_WIDTH = 100;
const CANVAS_HEIGHT = 400;

// all speeds are in pix/s

function Game() {
	// init canvas
	this.canvas = document.getElementById("canvas");
	
	this.gravity = 10;
	
	// init bird
	this.birdPosX = 0;
	this.birdPosY = CANVAS_HEIGHT / 2;
	
	this.birdVelX = 5;
	this.birdVelY = 
	
	// init pipes
	this.pipes = ;
}

Game.prototype.update = function update() {
	this.player.update();
};

Game.prototype.render = function render() {
	
};

Game.prototype.animate = function animate() {
	// request next animation frame
	requestAnimationFrame(this.animate.bind(this));
	
	// render scene
	this.render();
	
	// update scene
	this.update();
};
