#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
mkdir -p dist
cp ./*.js ./*.css index.html dist/
cp -R assets tests dist/
