// Copyright (C) 2015, 2016 Tracktunes Inc

import {App, IonicApp, Platform, Nav} from 'ionic-angular';
import {Type, enableProdMode, ViewChild} from 'angular2/core';
import {WebAudio} from './providers/web-audio/web-audio';
import {LocalDB, DB_NAME, MAX_DB_INIT_TIME} from './providers/local-db/local-db';
import {AppState} from './providers/app-state/app-state';
import {RecordPage} from './pages/record/record';
import {LibraryPage} from './pages/library/library';
import {TabsPage} from './pages/tabs/tabs';


@App({
    templateUrl: 'build/app.html',
    providers: [WebAudio, LocalDB, AppState],
    config: {
        backButtonText: ''
    }
})
export class TracktunesApp {
    // see the following link for how/why we use ViewChild and not
    // NavController here. https://github.com/driftyco/ionic/issues/5543
    @ViewChild(Nav) nav;
    // private rootPage: Type = null;
    private rootPage: Type = TabsPage;
    // cause AppState and LocalDB singletons
    // so that they are loaded as early as possible 
    private localDB: LocalDB = LocalDB.Instance;
    private appState: AppState = AppState.Instance;
    private selectedTab: number = -1;
    private recordPage: Type = RecordPage;
    private libraryPage: Type = LibraryPage;

    constructor(
        private app: IonicApp,
        private platform: Platform) {
        console.log('constructor():TracktunesApp');
        // NB: you can delete the DB here to get rid of it easily in Firefox

        this.platform.ready().then(() => {

        });
    }

    onPageWillEnter() {
        this.appState.getProperty('lastSelectedTab').subscribe(
            (tabIndex: number) => {
                this.selectTab(tabIndex, false);
            },
            (getError: any) => {
                console.log('getProperty error: ' + getError);
            }
        ); // getProperty().subscribe(
    }

    selectTab(tabIndex: number, updateAppState: boolean = true) {
        if (tabIndex === this.selectedTab) {
            return;
        }

        console.log('selectTab: ' + tabIndex);

        this.selectedTab = tabIndex;

        this.app.getComponent('nav-tabs').select(tabIndex);

        if (tabIndex === 0) {
            console.log('setting to record page');
            // this.nav.setRoot(RecordPage);
        }
        else if (tabIndex === 1) {
            console.log('setting to library page');
            // this.nav.setRoot(LibraryPage);
        }

        if (updateAppState) {
            this.appState.updateProperty('lastSelectedTab', tabIndex)
                .subscribe(
                (success: boolean) => {
                },
                (error: any) => {
                    alert('wow error in update in app: ' + error);
                }
                );
        }
    }
}
