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
rm -fr $1/app
cp -fr tmp/ionic-recorder/app $1/
cp -fr tmp/ionic-recorder/test $1/
rm -fr tmp

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

ln -s ./node_modules/gulp/bin/gulp.js bin/gulp
ln -s ./node_modules/typings/dist/bin/typings.js bin/typings
ln -s ./node_nodules/tslint/bin/tslint bin/tslint

/bin/rm -fr typings/*

./bin/typings install --ambient --save \
    github:$GITHUB_PATH/typings/main/ambient/local/local.d.ts

./bin/typings install --ambient --save \
    github:$GITHUB_PATH/typings/main/ambient/ionic-app-lib/ionic-app-lib.d.ts

./bin/typings install --ambient --save \
    github:$GITHUB_PATH/typings/main/ambient/waa/waa.d.ts

./bin/typings install --ambient --save \
    github:$GITHUB_PATH/typings/main/ambient/webrtc/MediaStream.d.ts

./bin/typings install --ambient --save \
    github:$GITHUB_PATH/typings/main/ambient/webrtc/MediaStream.d.ts

for typing in \
    bluebird chalk del es6-shim express glob gulp gulp-load-plugins \
    gulp-typescript gulp-util jasmine karma log4js mime minimatch \
    node orchestrator q run-sequence serve-static through2 vinyl
do
     ./bin/typings install $typing --save-dev --ambient --no-insight
done

# run the main gulp test task, which runs other tasks in order
# NOTE: seems like we can't run these tasks in order from the
# command line but we have to group them under this general task 'test'
# because of the globals being tracked in the gulp.ts file ...

./gulp.js --gulpfile test/gulpfile.ts --cwd ./ test
