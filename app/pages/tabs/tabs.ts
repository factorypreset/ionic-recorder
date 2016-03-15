// Copyright (C) 2015, 2016 Tracktunes Inc

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
    private selectedIndex: number;

    constructor(private app: IonicApp) {
        console.log('constructor():TabsPage');
        this.tab1Root = RecordPage;
        this.tab2Root = LibraryPage;
        this.appState.getProperty('lastSelectedTab').subscribe(
            (tabIndex: number) => {
                this.app.getComponent('nav-tabs').select(tabIndex);
                this.selectedIndex = tabIndex;
            },
            (getError: any) => {
                console.log('getProperty error: ' + getError);
            }
        ); // getProperty().subscribe(
    }
}
