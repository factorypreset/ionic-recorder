# TODO.md

* stop using toString() on keys by making sure all keys are strings from
  the start (make them a string field in TreeNode)
* Make the scss classes more uniform - try to wrap each component html
  template with one class that has the component's name, then take it from
  there, always using things within that "namespace"
* start implementing the buttons, one by one, from top left to bottom right
* Create a class named LocalDBCache that has only the functions exported by
  LocalDB and used elsewhere in the app but wraps them with a cache layer
  that stores things in a local cache in memory.  We'll only need to replace
  calls to LocalDB with identical calls in LocalDBCache in order to use the
  cache.  This cache never expires and has no memory limit - assuming the
  entire tree can typically fit in memory with no problem.  Since we can
  add this class transparently at any time, we won't worry about cache (or
  creating this function) yet - but this is a super duper performance
  enhancer later on.  Right now we'll re-read from DB every time.  After
  using this enhancement, we'll only ever read an item from the DB once.
  It's best to write this later, after you've used the LocalDB API for a
  while and have defined the interface solidly - we're almost there.
* Instead of using tabs only for navigation now.  And we're not displaying them,
  ever.  We're only using them for navigtion.  So why not just use NavController?
  This way we'd "free" up a "real" tab bar to use in the library page.
  We'll also need another tab bar at the same page sometimes: sometimes we'll
  have two(?) - whether we display two or not, it's clear that we need two:
  * one tabs bar for normal library operations (select options, add folder,
  go to parent & folder info) - this tabs bar is hidden in the record page and
  is only visible in the library page
  * another tabs bar for when anything is selected
    * move-up/move-down - only enabled if a single thing is selected
    * move-up/move-down - only enabled if a single thing is selected
    * delete
    * move-to-folder
    * share
* one way to try the above is to create a blank tabs app that has a single 
button - clicking the button switches tabs.
  * create tabs blank app
  * get rid of tabs navigation in it
  * make all tabs when selected point to the same page
  * now add the button
  * now create a second tabs page
  * NO: don't do this. we can't have two separate pages and switch between
  them.  also - it would be useful to  have two tab bars on the same page at
  once: that's a better interface. while you are selecting, there is nothing
  that should prevent you from moving around the folder structure (using the
  other tab bar) to select more, for example.
  
  The way we're going to solve this problem of using tabs is:
  * stop using them now (use nav controller instead)
  * start using them now (for library page, figuring out when to turn them on 
  or off - turning them off at the record page, and if it's possible to have 
  them all point to the same page as their root)
  * perhaps you can use existing tabs: make record/library/settings/about existing
  tabs all hidden, add non-hidden tabs all with root pointing to library page and
  all belonging to the library page.  the library page itself is 
  * EXPERIMENT: sample tabs app, make one of its pages a tabs page - now play 
  TEST 1: multiple same root test
  TEST 2: make a tabs sub page a tabs page itself...
* [Excellent article](https://github.com/yeoman/yeoman/blob/master/contributing.md)
  on CONTRIBUTING.md
* once you start deploying, try this
  [page speed insights](http://developers.google.com/speed/pagespeed/insights/) 
* you will also need new gulp tasks, e.g.
  [optimizing assets with gulp](http://sahatyalkabov.com/jsrecipes/#!/backend/optimizing-assets-with-gulp)
* step 1: replace waitForAppState with waitForDB - just
          change the waitForAppState function at first to
          test
* step 2: in AppState, wrap the get function with waitForDB
          (assuming test in step 1 succeeded), wrap any
          function that it exposes with waitForDB, internally
* step 3: put private on whatever you can in local-db
* step 4: on the local-db public API, put a wait-for-db wrapper
*         everywhere
* step 5: remove wait-for-db / wait-for-api everywhere else
* add folder node to db when adding in library page now that it's
  verified
* compute path automatically at node creation (folder nodes only) in 
  local-db.ts
* refactoring: local-db calls wait db on all higher api functions,
  lower level api functions are made private, app-state calls 
  wait db, no need for app state to have a wait-app-state function
  anymore, every app-state call (getProperty or updateProperty)
  returns an observable that first waits for localDB.  this will 
  speed up initialization.  we can also set the interval to be 1/10
  of the max timeout, which will speed up things a lot during init.
  we can also disable preloadTabs to speed up init only in those
  cases where we go straight to the recording tab.  yeah, do that
  one now, since it's a tiny change... ---> just tried it and it
  didn't work!  it caused some weird event bug where i had to 
  click on every button twice (in the library page when the app
  did not preload it but went directly to it after a refresh
  using select()... go figure... i'm returning preload to ion-tabs
  it doesn't hurt much anyway and makes for a more even experience
  as the refresh time will be the same now regardless of which 
  page you land on (left off with last time)
* fix app state jumps - maybe we don't want that... maybe we want
  to jump more seamlessly into the library if we were there last?
* every folder in the tree will contain its children - the idea here
  is that while N can get very large for children for any individual
  user, it cannot get very large for folders - how many folders can 
  somebody create? thousands? that's not very large... so we can have
  a bit more overhead (space and time, mostly space) on each tree 
  node - we're going to store all its children -- this will simplify
  getting a node's child nodes -- need to rewrite some functions ...
  but it will also allow us to keep one more important piece of app
  state that we're not tracking yet: the ordering, inside each folder,
  of its children.
* add a folder in library.ts - design the add folder process
* only very few local-db.ts get called - they are all higher level
  api functions.  rewrite local-db.ts based on those higher level
  functions (use a top-down approach this time and get rid of 
  unneeded bottom-up code).  start hiding things from top-level.
  figure out how to make some functions private.
* add path tracking for tree nodes in local-db.ts
* never call waitForDB or waitForAppState again from main code that
  uses any of those classes.  Instead, turn every function that we 
  call, internally, in the local-db API, into a waitForDB promise
  wrapped function.
* library-page.ts:
  * implement add-folder button, so that we can traverse
    real trees - requires renaming it, do that first ...
* local-db.ts:
  * implement path on all folder nodes automatically computed
  * add TreeNode interface
  * add DataNode interface
  * type things with the above interfaces
  * create an initial folder item that has name '/' and is the root
  * addTreeItem - must add to a parent by parentkey, parent must 
    exist and be a folder   (check this first).  if you are adding a
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
* record-page.ts:  fix gain control issue: gain control shows up correctly in the
  monitor, but does not seem to actually work in a recording test (not
  in real-time anyhow)
* record.ts: add a saturation indicator/detector
* record.ts: slider change must reset max peaks (when increased, not decreased)
* web-audio.ts: figure out if to chunk with a time interval
* vu-gauge.ts: dd red triangles showing max volume instead of the rectangle boundary
* app.ts: make highlight (clicked) color less bright, follow other dark apps; also,
  indicate the current selected tab with a different shade
