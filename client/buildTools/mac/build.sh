#!/bin/bash

rm -rf ./bin/node-webkit.app/Contents/Resources/app.nw/
cp -r ../../app/ ./bin/node-webkit.app/Contents/Resources/app.nw
./bin/node-webkit.app/Contents/MacOS/node-webkit