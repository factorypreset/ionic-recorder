import {Injectable} from 'angular2/core';


@Injectable()
export class AppState {
    dbName: string = 'ionic-recorder-db';
    dbVersion: number = 15;
    dbTreeStoreName = 'blobTree';
    unfiledFolderName: string = 'Unfiled';
    lastViewedFolderKey: number = 0;
}
