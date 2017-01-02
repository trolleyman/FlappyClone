
function Net(game) {
	this.ping = undefined;
	this.game = game;
	
	// the offset that is applied to the times received from the server in order to
	// convert it to client time
	this.clientTimeOffset = 0;
	this.hbSentTime = null;
	
	this.ws = new WebSocket("ws://" + document.location.hostname + ":8080", 'FlappyClone');
	this.ws.onopen = this.wsOnOpen.bind(this);
	this.ws.onclose = this.wsOnClose.bind(this);
	this.ws.onerror = this.wsOnError.bind(this);
	this.ws.onmessage = this.wsOnMessage.bind(this);
}

Net.prototype.wsOnOpen = function(e) {
	console.log("Opened WebSocket");
	this.sendHeartbeat();
}

Net.prototype.wsOnClose = function(e) {
	if (e.wasClean)
		console.log("Closed WebSocket: " + e.code + " " + e.reason);
	else
		console.log("Error: Closed WebSocket (NOT CLEAN): " + e.code + " " + e.reason);
}

Net.prototype.wsOnError = function(e) {
	console.log("Error: WebSocket: " + e);
}

Net.prototype.wsOnMessage = function(e) {
	//console.log("WebSocket: Message received: " + e.data);
	var msg = null;
	try {
		msg = JSON.parse(e.data);
	} catch (e) {
		console.log("Error: WebSocket: Could not parse JSON message: " + e.data);
		return;
	}
	if (msg.command === "heartbeat") { // heartbeat
		this.handleHeartbeat(msg);
	} else {
		console.log("Error: WebSocket: Unknown message type: " + JSON.stringify(msg));
	}
}

Net.prototype.sendHeartbeat = function() {
	this.ws.send('{"command":"heartbeat"}');
	this.hbSentTime = Date.now().valueOf() / 1000.0;
}

Net.prototype.handleHeartbeat = function(msg) {
	if (this.hbSentTime === null) {
		console.log("Error: Heartbeat received, but no heartbeat sent");
	} else {
		var now = Date.now().valueOf() / 1000.0;
		var ping = now - this.hbSentTime;
		if (typeof this.ping === "undefined")
			this.ping = ping;
		this.ping = (this.ping + ping) / 2;
		this.clientTimeOffset = now - (this.ping / 2) - msg.serverTime;
		this.hbSentTime = null;
	}
	
	setTimeout(this.sendHeartbeat.bind(this), 500);
}