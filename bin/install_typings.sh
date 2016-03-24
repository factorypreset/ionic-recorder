#!/bin/bash

# Copyright (C) 2015, 2016 Tracktunes Inc

# Originally based on package.json at:
#     https://github.com/lathonez/clicker/blob/master/package.json

mkdir -p typings
/bin/rm -fr typings/*

APP_NAME="ionic-recorder"
GITHUB_PATH="tracktunes/$APP_NAME"

for typing in \
    local=github:$GITHUB_PATH/typings/main/ambient/local/index.d.ts \
    waa=github:$GITHUB_PATH/typings/main/ambient/waa/index.d.ts \
    MediaStream=github:$GITHUB_PATH/typings/main/ambient/MediaStream/index.d.ts
do
    ./bin/typings install --ambient --save $typing
done

for typing in \
    angular-protractor bluebird chalk del es6-shim express glob gulp \
    gulp-load-plugins gulp-typescript gulp-util jasmine karma log4js mime \
    minimatch node orchestrator q run-sequence selenium-webdriver serve-static \
    through2 vinyl
do
    ./bin/typings install --ambient --no-insight --save-dev $typing
done

