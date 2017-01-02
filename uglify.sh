set -e
set -x
uglifyjs --mangle --wrap -o js/game.js -- src/fontfaceonload.js src/intersection.js src/cookie.js src/score.js src/button.js src/rect.js src/draw.js src/pipe.js src/bird.js src/net.js src/game.js
