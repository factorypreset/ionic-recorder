import {Page, Platform} from 'ionic-angular';
import {LocalDB} from '../../providers/local-db';
import {AppState} from '../../providers/app-state';


@Page({
    templateUrl: 'build/pages/library/library.html'
})
export class LibraryPage {
    constructor(private platform: Platform, 
                private localDB: LocalDB,
                private appState: AppState) {
    
    }
}
