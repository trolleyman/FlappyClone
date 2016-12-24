
function Stats(game) {
	this.game = game;
}

Stats.prototype.toHTML = function() {
	var g = this.game;
	var ret = '';
	ret += 'Paused: ' + g.paused + '<br>';
	ret += 'Dead: ' + g.dead + '<br>';
	ret += 'PosX: ' + g.bird.posX.toFixed(2) + '<br>';
	ret += 'PosY: ' + g.bird.posY.toFixed(2) + '<br>';
	ret += 'VelX: ' + g.bird.velX.toFixed(2) + '<br>';
	ret += 'VelY: ' + g.bird.velY.toFixed(2) + '<br>';
	ret += 'Gravity: ' + g.gravity;
	return ret;
}