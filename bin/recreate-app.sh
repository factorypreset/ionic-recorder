#!/bin/bash

# NOTE: make sure you have latest ionic cli installed

APP_NAME="ionic-recorder"
GITHUB_PATH="tracktunes/$APP_NAME"

if [ -e $APP_NAME ]; then
    echo "ERROR: ./$APP_NAME already exists"
    exit 1
fi

ionic start $APP_NAME --v2 --ts

mkdir -p tmp
cd tmp
git clone https://github.com/$GITHUB_PATH
cd ..

for copy in \
    .gitignore \
    LICENSE \
    README.md \
    TODO.md \
    ionic.project \
    www/favicon.ico \
    www/img \
    app \
    bin \
    test
do
    rm -fr $APP_NAME/$copy
    cp -fr tmp/$APP_NAME/$copy $APP_NAME/$copy
done
/bin/rm -fr tmp

cd $APP_NAME

npm install --save-dev \
    ionic-app-lib \
    chalk \
    del \
    gulp \
    gulp-load-plugins \
    gulp-inline-ng2-template \
    gulp-tap gulp-tslint \
    gulp-typescript \
    karma \
    run-sequence \
    tslint \
    ts-node \
    typings \
    es6-module-loader \
    jasmine-core \
    karma-coverage \
    karma-jasmine \
    karma-mocha-reporter \
    karma-phantomjs-launcher \
    phantomjs-prebuilt \
    systemjs \
    traceur

/bin/rm -fr typings/*

for typing in \
    github:$GITHUB_PATH/typings/main/ambient/local/local.d.ts \
    github:$GITHUB_PATH/typings/main/ambient/ionic-app-lib/ionic-app-lib.d.ts \
    github:$GITHUB_PATH/typings/main/ambient/waa/waa.d.ts \
    github:$GITHUB_PATH/typings/main/ambient/MediaStream/MediaStream.d.ts
do
    yes '' | ./bin/typings install $typing --ambient --save
done

for typing in \
    bluebird chalk del es6-shim express glob gulp gulp-load-plugins \
    gulp-typescript gulp-util jasmine karma log4js mime minimatch \
    node orchestrator q run-sequence serve-static through2 vinyl
do
    yes '' | ./bin/typings install $typing \
        --ambient --no-insight --save-dev
done

# run the main gulp test task, which runs other tasks in order
# NOTE: seems like we can't run these tasks in order from the
# command line but we have to group them under this general task 'test'
# because of the globals being tracked in the gulp.ts file ...

./bin/gulp --gulpfile test/gulpfile.ts --cwd ./ test
