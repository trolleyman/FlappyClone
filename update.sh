set -x
set -e
git pull
rm -rf ./js 2> /dev/null # Don't care about errors
mkdir js
./uglify.sh
forever stop ws/server.js
forever start ws/server.js
