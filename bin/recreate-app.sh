#!/bin/bash

# NOTE: make sure you have latest ionic cli installed

GITHUB_PATH="tracktunes/ionic-recorder"
if [ "$1" == "" ]; then
    echo "USAGE: $0 < new-ionic-project-directory-to-create >"
    exit 1
fi

if [ -e $1 ]; then
    echo "ERROR: ./$1 already exists"
    exit 1
fi

ionic start $1 --v2 --ts

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
    rm -fr $1/$copy
    cp -fr tmp/$copy $1/
done

cd $1

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
    ./node_modules/typings/dist/bin/typings.js install \
        --ambient --save
done


for typing in \
    bluebird chalk del es6-shim express glob gulp gulp-load-plugins \
    gulp-typescript gulp-util jasmine karma log4js mime minimatch \
    node orchestrator q run-sequence serve-static through2 vinyl
do
    yes '' | ./node_modules/typings/dist/bin/typings.js install $typing \
        --save-dev --ambient --no-insight
done

# run the main gulp test task, which runs other tasks in order
# NOTE: seems like we can't run these tasks in order from the
# command line but we have to group them under this general task 'test'
# because of the globals being tracked in the gulp.ts file ...

./node_modules/gulp/bin/gulp.js --gulpfile test/gulpfile.ts --cwd ./ test
