import {Injectable} from 'angular2/core';

// based on example at: 
// https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB

const DB_NAME = 'ionic-recorder-db';
const DB_VERSION = 1;
const DB_STORE_NAME = 'blobs';

@Injectable()
export class IndexedDB {
    private db: IDBDatabase;
    private openRequest: IDBOpenDBRequest;

    constructor() {
        console.log('constructor():IndexedDB');
        if (!window.indexedDB) {
            alert('Browser does not support a stable version of indexedDB');
        }
    }

    openDb() {
        console.log('IndexedDB:openDb() db:' + DB_NAME + ', version:' + DB_VERSION);
        this.openRequest = indexedDB.open(DB_NAME, DB_VERSION);

        this.openRequest.onsuccess = (event: Event) => {
            this.db = this.openRequest.result;
            console.log('openDb:onsuccess DONE');
        }

        this.openRequest.onerror = (event: Event) => {
            console.error('Could not open database');
        }

        this.openRequest.onupgradeneeded = (event: IDBVersionChangeEvent) => {
            console.log('openDb:onupgradeended + oldVersion=' +
                event.oldVersion + ', newVersion=' + event.newVersion);
        }
    }

}
