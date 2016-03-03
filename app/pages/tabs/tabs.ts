import {Page} from 'ionic-angular';
import {Type} from 'angular2/core';
import {RecordPage} from '../record/record';
import {LibraryPage} from '../library/library';


@Page({
    template: [
        '<ion-tabs id="tabs">',
        '    <ion-tab [root]="tab1Root" tabTitle="Record"></ion-tab>',
        '    <ion-tab [root]="tab2Root" tabTitle="Library"></ion-tab>',
        '</ion-tabs>'
    ].join('')
})
export class TabsPage {
    private tab1Root: Type = RecordPage;
    private tab2Root: Type = LibraryPage;

    constructor() {
        console.log('constructor():TabsPage');
        this.tab1Root = RecordPage;
        this.tab2Root = LibraryPage;
    }
}
