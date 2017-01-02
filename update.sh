set -e
set -x
git pull
rm -rf ./js 2> /dev/null # Don't care about errors
mkdir js
./uglify.sh
./ws/update.sh
