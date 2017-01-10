set -e
set -x
uglifyjs --mangle --wrap -o js/game.js -- src/*.js
