import {IonicApp, Page, Modal, Alert, NavController, Platform} from 'ionic-framework/ionic';
import {LibraryFilterPage} from '../library-filter/library-filter';
import {IndexedDB} from '../../providers/indexed-db';


@Page({
    templateUrl: 'build/pages/library/library.html'
})
export class LibraryPage {
    constructor(private app: IonicApp, 
                private nav: NavController, 
                private platform: Platform, 
                private indexedDB: IndexedDB) {

    }
}