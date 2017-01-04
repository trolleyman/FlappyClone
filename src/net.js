
function Net(game) {
	this.game = game;
	this.connected = false;
	
	this.pipeID = 0;
	this.ping = undefined;
	this.pingSentTime = undefined;
	
	this.pipeCallbacks = [];

	try {
		this.ws = new WebSocket("ws://" + document.location.hostname + ":8080", 'FlappyClone');
		this.ws.onopen = this.wsOnOpen.bind(this);
		this.ws.onclose = this.wsOnClose.bind(this);
		this.ws.onerror = this.wsOnError.bind(this);
		this.ws.onmessage = this.wsOnMessage.bind(this);
	} catch (e) {
		this.connected = false;
		console.error("Could not open WebSocket: " + e);
	}
}

Object.defineProperty(Net.prototype, "pingString", {get: function() {
	if (typeof this.ping === "undefined" || !this.connected) {
		return '--ms';
	} else {
		return Math.round(this.ping * 1000) + 'ms';
	}
}});

Net.prototype.wsOnOpen = function(e) {
	console.log("Opened WebSocket");
	this.connected = true;
	this.sendPing();
}

Net.prototype.wsOnClose = function(e) {
	this.connected = false;
	if (e.wasClean)
		console.log("WebSocket: Connection terminated: " + e.code + " " + e.reason);
	else
		console.error("WebSocket: Connection terminated abruptly: " + e.code + " " + e.reason);
}

Net.prototype.wsOnError = function(e) {
	console.error("WebSocket: " + e);
}

Net.prototype.wsOnMessage = function(e) {
	//console.log("WebSocket: Message received: " + e.data);
	var msg = null;
	try {
		msg = JSON.parse(e.data);
	} catch (e) {
		console.error("WebSocket: Could not parse JSON message: " + e.data);
		return;
	}
	if (msg.command === "pong") {
		this.handlePong();
	} else if (msg.command === "pipe") {
		this.handlePipeResponse(msg);
	} else {
		console.error("WebSocket: Unknown message type: " + JSON.stringify(msg));
	}
}

Net.prototype.sendPing = function() {
	if (!this.connected)
		return;
	
	this.ws.send('{"command":"ping"}');
	this.pingSentTime = Date.now().valueOf() / 1000.0;
}

Net.prototype.handlePong = function() {
	if (!this.pingSentTime) {
		console.error("Pong received, but no heartbeat sent");
	} else {
		var now = Date.now().valueOf() / 1000.0;
		this.ping = now - this.pingSentTime;
		this.pingSentTime = undefined;
	}
	
	setTimeout(this.sendPing.bind(this), 500);
}

Net.prototype.getPipe = function(x, callback) {
	if (!this.connected)
		return;
	x = x / PIPE_SPACING_X;
	var id = this.pipeID++;
	this.pipeCallbacks[this.pipeCallbacks.length] = {id:id, x:x, callback:callback};
	this.ws.send(JSON.stringify({
		command:"pipe",
		id:id,
		x:x,
	}));
}

Net.prototype.handlePipeResponse = function(msg) {
	var found = -1;
	for (var i = 0; i < this.pipeCallbacks.length; i++) {
		var cb = this.pipeCallbacks[i];
		if (cb.id === msg.id) {
			cb.callback(msg.y);
			found = i;
			break;
		}
	}
	
	if (found === -1) {
		console.error("WebSocket: No pipe callback with id " + msg.id);
	} else {
		this.pipeCallbacks.splice(found, 1);
	}
};