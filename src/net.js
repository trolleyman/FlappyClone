
function Net(game) {
	this.game = game;
	this.connected = false;
	
	this.ping = undefined;
	this.pingSentTime = undefined;
	
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
		return (this.ping * 1000).toFixed(0) + 'ms';
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
	} else {
		console.error("WebSocket: Unknown message type: " + JSON.stringify(msg));
	}
}

Net.prototype.sendPing = function() {
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