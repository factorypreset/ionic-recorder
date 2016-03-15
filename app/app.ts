// Copyright (C) 2015, 2016 Tracktunes Inc

import {App, IonicApp, Platform, Nav, NavController} from 'ionic-angular';
import {Type, enableProdMode, ViewChild} from 'angular2/core';
import {WebAudio} from './providers/web-audio/web-audio';
import {LocalDB, DB_NAME, MAX_DB_INIT_TIME} from './providers/local-db/local-db';
import {AppState} from './providers/app-state/app-state';
import {TabsPage} from './pages/tabs/tabs';


const IMPOSSIBLE_TAB_INDEX = -1;

@App({
    templateUrl: 'build/app.html',
    providers: [WebAudio, LocalDB, AppState],
    config: {
        backButtonText: ''
    }
})
export class TracktunesApp {
    private localDB: LocalDB = LocalDB.Instance;
    private appState: AppState = AppState.Instance;
    private rootPage: Type = TabsPage;

    // make selectedTab not a real number so that it gets set
    // by what we get from app state for the first time. we use
    // it to ensure we're not updating app state on no change.
    private selectedTab: number = IMPOSSIBLE_TAB_INDEX;

    constructor(
        private app: IonicApp,
        private platform: Platform) {
        console.log('constructor():TracktunesApp');
        // NB: you can delete the DB here to get rid of it easily in Firefox

        // this.platform.ready().then(() => {
        // });
    }

    ngOnInit() {
        console.log('OPE');
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

        let prevId: string = 'button' + this.selectedTab,
            currentId: string = 'button' + tabIndex;

        if (this.selectedTab !== IMPOSSIBLE_TAB_INDEX) {
            document.getElementById(prevId).classList
                .remove('button-selected');
        }

        document.getElementById(currentId).classList
            .add('button-selected');

        this.selectedTab = tabIndex;

        this.app.getComponent('nav-tabs').select(tabIndex);

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
