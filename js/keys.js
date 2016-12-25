var keys = [];
window.onkeydown = function(e) { keys[e.code]=true; console.log(e.code); }
window.onkeyup = function(e) { keys[e.code]=false; }
