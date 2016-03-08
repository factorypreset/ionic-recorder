# TODO.md

* local-db.ts:
  * add TreeNode interface
  * add DataNode interface
  * type things with the above interfaces
  * create an initial folder item that has name '/' and is the root
  * addTreeItem - must add to a parent by parentkey, parent must 
    exist and be a folder (check this first).  if you are adding a
    folder, make sure no other folder by that name exists in the
    same parent. if you're adding 
  * ... all of the above plus more so that we can call something in
    app-state.ts - we want to (a) check if the app-state has ever
    been stored in the db before.  if yes, get it and set the state
    to it. if no, then save yourself into it, i.e. create a new 
    one with default values.
  * create type definitions for app-state
  * now write the save() function of app-state
  * it may be good to load all pages on starting the app - if few
  * use save() to save state when switching pages, and see if you
    can restart to the library page, after hitting refresh, because
    you left off from there
  * now get to library page design
* Make LocalDB a singleton (see wiki for link to patterns examples)
* make db name, db version, db store name constants in localdb - unless we find out how
  to create a singleton that has constructor arguments
* Make LocalDB an observable, see
  * [this blog](http://blog.thoughtram.io/angular/2016/01/06/taking-advantage-of-observables-in-angular2.html)
  * [this video](https://egghead.io/lessons/rxjs-rxjs-observables-vs-promises)
* Design Library Page all the way up with current functionality of
  only adding recordings, even though some buttons won't work.  We
  already have files and folders, so we have all we need to design
  a large part of the look.  We'll need to implement:
  * getFolderPath() - to display in <ion-item-divider>
  * isFolder(folder) - add a condition in html to pick the right
    icon name.
  * add a select checkbox
* for the 'Unfiled' object, we only allow one result.  the very first 
  time you run this app, the Unfiled object is created for you.
  if someone wants to create a new object, we never allow them to 
  either delete the 'Unfiled' folder or to overwrite it or to create
  a new folder by the same name.  folder name needs to be unique
  at each level, i.e. you can have unfiled->rock->unfiled path
  but at the same directory no two files can have the same name,
  nor do we allow any two folders to have the same name.  idea: allow
  it for files, but don't allow it for folders, perhaps. no. just add
  the unique constraint.
* listing a folder's contents

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