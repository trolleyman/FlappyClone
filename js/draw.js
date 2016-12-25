function drawImage(c, img, x, y) {
	var w = img.width, h = img.height;
	c.drawImage(img, 0, 0, w, h, Math.round(x), Math.round(y), w, h);
}

function drawImageTiled(c, img, offsetX, offsetY, maxX, maxY) {
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

