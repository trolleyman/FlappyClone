set -e
set -x
forever stop ws/server.js || echo "Warning: Could not stop ws/server.js"
forever start ws/server.js
