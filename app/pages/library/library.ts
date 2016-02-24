import {IonicApp, Page, Modal, Alert, NavController, Platform} from 'ionic-framework/ionic';
import {LibraryFilterPage} from '../library-filter/library-filter';


@Page({
    templateUrl: 'build/pages/library/library.html',
    providers: []
})
export class LibraryPage {
    constructor(private app: IonicApp, private nav: NavController, private platform: Platform) {
        console.log('constructor():LibraryPage');
        
        // ask for 50 Mb
        let requestedBytes = 1024 * 1024 * 500;
        let onInitFs = function(x) { console.log('onInitFS x is: '+x); };
        let errorHandler = function(x) {console.log('errorHandler x is: '+x); }
        
        navigator.webkitPersistentStorage.requestQuota(
            requestedBytes, function(grantedBytes) {
                console.log('granted Bytes: '+grantedBytes);
                
                window.requestFileSystem(PERSISTENT, grantedBytes, onInitFs, errorHandler);

            }, function(e) { console.log('Error', e); }
        );

    }

    updateLibrary() {
    }

    presentFilter() {
    }
}
