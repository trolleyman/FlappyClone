var keys = [];
window.onkeyup = function(e) { keys[e.keyCode]=false; }
window.onkeydown = function(e) { keys[e.keyCode]=true; }
