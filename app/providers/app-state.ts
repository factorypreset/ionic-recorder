import {Injectable} from 'angular2/core';
import {LocalDB} from './local-db';

@Injectable()
export class AppState {
    db: LocalDB;
    dbName: string = 'ionic-recorder-db';
    dbVersion: number = 15;
    dbTreeStoreName = 'blobTree';
    unfiledFolderName: string = 'Unfiled';
    lastViewedFolderKey: number = 0;
    
    constructor() {
        this.db = new LocalDB(
            this.dbName,
            this.dbVersion, 
            this.dbTreeStoreName);
    }
}
