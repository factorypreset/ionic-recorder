import {Page, Platform} from 'ionic-angular';
import {IndexedDB} from '../../providers/indexed-db';

@Page({
    templateUrl: 'build/pages/library/library.html'
})
export class LibraryPage {
    constructor(private platform: Platform, private indexedDB: IndexedDB) {
    }
}