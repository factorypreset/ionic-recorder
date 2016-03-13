import {Page, IonicApp} from 'ionic-angular';
import {Type} from 'angular2/core';
import {RecordPage} from '../record/record';
import {LibraryPage} from '../library/library';
import {AppState} from '../../providers/app-state/app-state';

@Page({
    templateUrl: 'build/pages/tabs/tabs.html'
})
export class TabsPage {
    private appState: AppState = AppState.Instance;
    private tab1Root: Type = RecordPage;
    private tab2Root: Type = LibraryPage;
    private selectedIndex: number = -1;

    constructor(private app: IonicApp) {
        console.log('constructor():TabsPage');
        this.tab1Root = RecordPage;
        this.tab2Root = LibraryPage;

        this.appState.waitForAppState().subscribe(
            (success: boolean) => {
                this.selectedIndex =
                    this.appState.getProperty('lastSelectedTab');
            }
        );

    }
}
