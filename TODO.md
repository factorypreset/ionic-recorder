# TODO.md

## General
* merge web-audio-api with record.js because there are too many duplicates
  there and because web-audio-api does not need to be injected anywhere else

## Modules / Pages

### Library page
* After lots of research: use IndexedDB for music file storage.
* Current question: do we use cordova plugin directly or do we use the webkit
  stuff?

### Record page
* save blobs automatically and immediately in stopRecord()
* reset properly upon saving in stopRecord() so that we can
  immediately start again
* Timer not yet implemented

#### Slider
* needs to reset max peaks (when increased, not decreased)
* Fix gain control issue: gain control shows up correctly in the
  monitor, but does not seem to actually work in a recording test (not
  in real-time anyhow)

### Web Audio API
* Start/stop/pause/resume functions are totally unnecessary and get repeated
  in record.ts - use MediaRecorder directly for those in record.ts
* Figure out if to chunk with a time interval

### VuGauge
* Add red triangles showing max volume instead of the rectangle boundary
* Add a saturation indicator/detector

### App menu
* Make highlight (clicked) color less bright