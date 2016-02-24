# TODO.md

## Library page
* After lots of research: use IndexedDB for music file storage.

## Record page
* Timer not yet implemented

## Web Audio API
* Start/stop/pause/resume functions are totally unnecessary and get repeated
  in record.ts - use MediaRecorder directly for those in record.ts
* Figure out if to chunk with a time interval

## VuGauge
* Add red triangles showing max volume instead of the rectangle boundary
* Add a saturation indicator/detector

## Slider sprint
* Fix gain control issue: gain control shows up correctly in the
  monitor, but does not seem to actually work in a recording test (not
  in real-time anyhow)
