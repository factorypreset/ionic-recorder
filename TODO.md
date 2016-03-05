# TODO.md

## General
* merge web-audio-api with record.js because there are too many duplicates
  there and because web-audio-api does not need to be injected anywhere else

## Modules / Pages

### AppState
* Add it.  For now, we're saving only:
  * last folder viewed in 'library' (or none)
  * whether any new items have not been viewed yet
  
### Library page
* load folder we last viewed or if not last viewed, view Unfiled folder

### Record page
* Fix gain control issue: gain control shows up correctly in the
  monitor, but does not seem to actually work in a recording test (not
  in real-time anyhow)
* Add a saturation indicator/detector

#### Slider
* Slider change must reset max peaks (when increased, not decreased)

### Web Audio API
* Figure out if to chunk with a time interval

### VuGauge
* Add red triangles showing max volume instead of the rectangle boundary

### App menu
* Make highlight (clicked) color less bright, follow other dark apps