var ws = require("ws");
var port = 8080;
var server = new ws.Server({ port: port, handleProtocols: "FlappyClone" });

var id = 0;

server.on("connection", function connection(ws) {
	console.log(id + " connected.");
	var handler = new Handler(ws, id++);
	ws.on("error", handler.wsOnError.bind(handler));
	ws.on("close", handler.wsOnClose.bind(handler));
	ws.on("message", handler.wsOnMessage.bind(handler));
});

console.log("Server up and running on port " + port);

//const WS_STATE_START = 0;

function Handler(ws, id) {
	//this.state = WS_STATE_START;
	this.ws = ws;
	this.id = id;
}

Handler.prototype.wsOnError = function(error) {
	console.log(this.id + " errored: " + error);
}
Handler.prototype.wsOnClose = function(code, reason) {
	console.log(this.id + " disconnected: " + code + " " + reason);
}

Handler.prototype.wsOnMessage = function(data) {
	console.log("< " + this.id + ": " + data);
	var msg = JSON.parse(data);
	if (msg.command === "ping") {
		var now = Date.now().valueOf() / 1000.0;
		this.send('{"command":"pong"}');
	} else {
		console.log(this.id + " error: unknown command: " + this.command);
	}
}

Handler.prototype.send = function(data) {
	this.ws.send(data);
	console.log("> " + this.id + ": " + data);
}
