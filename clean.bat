@echo on

:: Navigate to js files dir
pushd "%~dp0/static/FlappyClone"

:: Reset js directory
rmdir /S /Q js
mkdir js

:: Reset dir
popd
