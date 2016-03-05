import {Page, Platform} from 'ionic-angular';
import {LocalDB} from '../../providers/local-db';
import {AppState} from '../../providers/app-state';


@Page({
    templateUrl: 'build/pages/library/library.html'
})
export class LibraryPage {
    private localDB: LocalDB;
    private folderItems: Object[];
    constructor(private platform: Platform,
        private appState: AppState) {
        this.localDB = this.appState.db;
        this.localDB.foreachChild(
            this.appState.lastViewedFolderKey,
            (data: any) => {
                console.log('foreachChild CB:')
                this.folderItems.push(data);
                console.dir(this.folderItems);
            }
        );
    }
}
