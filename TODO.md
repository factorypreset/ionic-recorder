# TODO.md

## General
* merge web-audio-api with record.js because there are too many duplicates
  there and because web-audio-api does not need to be injected anywhere else

## Modules / Pages

We need to solve two main problems right now:

1) for the 'Unfiled' object, we only allow one result.  the very first 
   time you run this app, the Unfiled object is created for you.
   if someone wants to create a new object, we never allow them to 
   either delete the 'Unfiled' folder or to overwrite it or to create
   a new folder by the same name.  folder name needs to be unique
   at each level, i.e. you can have unfiled->rock->unfiled path
   but at the same directory no two files can have the same name,
   nor do we allow any two folders to have the same name.  idea: allow
   it for files, but don't allow it for folders, perhaps. no. just add
   the unique constraint.
1) listing a folder's contents

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