echo "Pulling updates from Git..."
git pull || { echo "Git pull failed."; exit 1 }
rm -rf ./js 2> /dev/null # Don't care about errors
mkdir js
./uglify.sh || { echo "Uglify.js failed."; exit 1 }
forever stop ws/server.js || { echo "Could not stop WebSockets server."; exit 1 }
forever start ws/server.js || { echo "Could not start WebSockets server."; exit 1 }
