// Copyright (C) 2015, 2016 Tracktunes Inc

import {App, IonicApp, Platform} from 'ionic-angular';
import {Type, enableProdMode} from 'angular2/core';
import {TabsPage} from './pages/tabs/tabs';
import {WebAudio} from './providers/web-audio/web-audio';
import {LocalDB, DB_NAME, MAX_DB_INIT_TIME} from './providers/local-db/local-db';
import {AppState} from './providers/app-state/app-state';
import {ExceptionHandler} from 'angular2/src/facade/exception_handler';


@App({
    templateUrl: 'build/app.html',
    providers: [WebAudio, LocalDB, AppState],
    config: {
        backButtonText: ''
    }
})
export class TracktunesApp {
    private rootPage: Type = TabsPage;
    // cause AppState and LocalDB singletons
    // so that they are loaded as early as possible
    private localDB: LocalDB = LocalDB.Instance;
    private appState: AppState = AppState.Instance;

    constructor(private app: IonicApp, private platform: Platform) {
        console.log('constructor():TracktunesApp');
        // NB: you can delete the DB here to get rid of it easily in Firefox

        this.platform.ready().then(() => {
            // we need to wait for platform.ready() in order to retrieve
            // this.app.getComponent('nav-tabs') successfuly
            this.appState.getProperty('lastSelectedTab').subscribe(
                (tabIndex: number) => {
                    if (!app.getComponent('nav-tabs')) {
                        alert('no navTabs!');
                    }
                    this.app.getComponent('nav-tabs').select(tabIndex);
                },
                (getError: any) => {
                    alert('getProperty error: ' + getError);
                    console.log('getProperty error: ' + getError);
                }
            ); // getProperty().subscribe(
        });
    }

    selectTab(index: number) {
        console.log('selectTab: ' + index);
        this.appState.updateProperty('lastSelectedTab', index).subscribe(
            () => { this.app.getComponent('nav-tabs').select(index); });
    }
}
