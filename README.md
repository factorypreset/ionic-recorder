# ionic-recorder
Sound recording mobile / browser hybrid app, based on the Ionic framework and 
the Web Audio Interface.

## Introduction

This app combines
* [Ionic 2.x](http://ionicframework.com/docs/v2/)
* [Web Audio Interface](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) and 
  [MediaRecorder](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder_API)

to build
* A simple recording app (hybrid app that can run either in your browser or 
  as an ios/android native app)
* Useful real-time visualizations, stats and data-analysis of the recorded 
  audio signal

## Requirements
* Ionic2
* This apps runs only in browsers that implement
  [MediaRecorder](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder_API).
  and a late version of IndexedDB that supports the ```onupgradeended``` event.
  
## Installation
* cd to the cloned directory and type
    npm install
    ionic serve
 